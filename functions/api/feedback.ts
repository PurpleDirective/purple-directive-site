/**
 * Cloudflare Pages Function: POST /api/feedback
 *
 * Receives the /feedback form (form-encoded) — the public + anonymous intake
 * door for ALL products. Stores the submission in the FEEDBACK_DB D1 database
 * (database `pd-feedback`, schema in ./_feedback-schema.sql). Read path is
 * GET /api/admin/feedback (Bearer key) — nothing a visitor submits is ever
 * rendered on the site.
 *
 * Anonymity contract (stated on the form): no account, no tracking. We store
 * message, product, optional reply-to email, page, coarse country header, and
 * a timestamp — NEVER the IP or user-agent (QuillPDF feedback-store pattern).
 * The rate limiter keeps only a peppered daily-rotating hash of the IP.
 *
 * Mirrors the validation/redirect pattern in ./review-submit.ts (honeypot,
 * required-field check, error-code redirect, same-origin guard).
 *
 * Env (Cloudflare Pages → Settings → Environment → Production + Preview):
 *   FEEDBACK_DB        D1 binding → database `pd-feedback`. Required; without
 *                      it submissions redirect back with an error rather than
 *                      being silently dropped.
 *   FEEDBACK_ADMIN_KEY secret. Bearer key for /api/admin/feedback; also the
 *                      pepper for the rate-limit hash.
 *
 * Local dev note: Pages Functions do NOT run under `npm run dev`. Test with
 * `npx wrangler pages dev ./dist` (bind D1 + set vars).
 */

interface Env {
  FEEDBACK_DB?: D1Database;
  FEEDBACK_ADMIN_KEY?: string;
}

const PRODUCTS = new Set([
  'sops', 'nexrial', 'quillpdf', 'quell', 'purplesign', 'misam', 'volstrin', 'general',
]);

// Rate limit: max submissions per ip-hash inside the sliding window.
const RL_MAX = 5;
const RL_WINDOW_MS = 10 * 60 * 1000;

function back(referer: string, code: string): Response {
  try {
    const url = new URL(referer);
    url.searchParams.set('feedback_error', code);
    return Response.redirect(url.toString(), 303);
  } catch {
    return Response.redirect('https://purpledirective.com/feedback?feedback_error=' + code, 303);
  }
}

async function ipHash(ip: string, pepper: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${day}:${pepper}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Same-origin guard (prod, www, localhost, *.pages.dev previews).
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const reqHost = new URL(request.url).host;
  const srcHost = referer ? new URL(referer).host : (origin ? new URL(origin).host : '');
  if (srcHost && srcHost !== reqHost && !srcHost.endsWith('.pages.dev')) {
    return new Response('Forbidden', { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back(referer, 'bad-request');
  }
  const get = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot — bots fill a hidden field; pretend success, store nothing.
  if (get('company_website') !== '') {
    return Response.redirect(new URL('/feedback-received', request.url).toString(), 303);
  }

  const product = get('product').toLowerCase();
  if (!PRODUCTS.has(product)) return back(referer, 'missing-product');

  const message = get('message');
  if (!message) return back(referer, 'missing-message');

  const email = get('email').toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back(referer, 'invalid-email');

  if (!env.FEEDBACK_DB) return back(referer, 'unavailable');

  // Rate limit on a peppered daily hash — the raw IP is never stored.
  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const now = Date.now();
  try {
    const hash = await ipHash(ip, env.FEEDBACK_ADMIN_KEY ?? '');
    const windowStart = new Date(now - RL_WINDOW_MS).toISOString();
    const { count } = (await env.FEEDBACK_DB
      .prepare('SELECT COUNT(*) AS count FROM feedback_rl WHERE ip_hash = ? AND ts > ?')
      .bind(hash, windowStart)
      .first<{ count: number }>()) ?? { count: 0 };
    if (count >= RL_MAX) return back(referer, 'rate-limited');
    await env.FEEDBACK_DB.batch([
      env.FEEDBACK_DB.prepare('INSERT INTO feedback_rl (ip_hash, ts) VALUES (?, ?)')
        .bind(hash, new Date(now).toISOString()),
      env.FEEDBACK_DB.prepare('DELETE FROM feedback_rl WHERE ts < ?')
        .bind(new Date(now - 24 * 60 * 60 * 1000).toISOString()),
    ]);
  } catch {
    /* a broken limiter must not block real feedback */
  }

  const rec = {
    ts: new Date(now).toISOString(),
    product,
    page: get('page').slice(0, 300),
    message: message.slice(0, 4000),
    email: email.slice(0, 160),
    quotable: get('quotable') ? 1 : 0,
    name_role: get('name_role').slice(0, 200),
    country: request.headers.get('cf-ipcountry') ?? '',
  };

  try {
    await env.FEEDBACK_DB
      .prepare(
        `INSERT INTO feedback (ts, product, page, message, email, quotable, name_role, country)
         VALUES (?,?,?,?,?,?,?,?)`,
      )
      .bind(
        rec.ts, rec.product, rec.page, rec.message, rec.email,
        rec.quotable, rec.name_role, rec.country,
      )
      .run();
  } catch {
    return back(referer, 'unavailable');
  }

  return Response.redirect(new URL('/feedback-received', request.url).toString(), 303);
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
