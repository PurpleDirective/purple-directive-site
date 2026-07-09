/**
 * Cloudflare Pages Function: POST /api/review-submit
 *
 * Receives the on-site review form (form-encoded) from /review, stores the
 * submission in the REVIEWS_DB D1 database with status='pending', and emails a
 * moderation notice via Resend. Approved reviews are curated into
 * src/data/testimonials.ts by hand (the commit is the manual-approve gate),
 * so nothing a visitor submits is ever shown automatically.
 *
 * Mirrors the validation/redirect pattern in ./research-intake.ts (honeypot,
 * required-field check, error-code redirect). Storage is additive: if the D1
 * binding is absent the email still goes out, so a missing binding degrades to
 * "email-only" rather than dropping the review.
 *
 * Env vars (Cloudflare Pages → Settings → Environment → Production + Preview):
 *   REVIEWS_DB       D1 binding → database `pd-reviews` (see _reviews-schema.sql).
 *                    Optional but strongly recommended; without it reviews are
 *                    emailed only.
 *   RESEND_API_KEY   secret. Resend key for purpledirective.com (shared with intake).
 *   REVIEW_TO        optional. Moderation recipient; defaults to info@purpledirective.com.
 *   REVIEW_FROM      optional. Verified Resend sender; defaults to
 *                    "Reviews <noreply@purpledirective.com>".
 *
 * Local dev note: Pages Functions do NOT run under `npm run dev`. Test with
 * `npx wrangler pages dev ./dist` (bind D1 + set vars).
 */

interface Env {
  REVIEWS_DB?: D1Database;
  RESEND_API_KEY?: string;
  REVIEW_TO?: string;
  REVIEW_FROM?: string;
}

const PRODUCTS = new Set(['sop', 'consulting']);
const REQUIRED = ['name', 'product', 'rating', 'body'] as const;

function back(referer: string, code: string): Response {
  try {
    const url = new URL(referer);
    url.searchParams.set('review_error', code);
    return Response.redirect(url.toString(), 303);
  } catch {
    return Response.redirect('https://purpledirective.com/review?review_error=' + code, 303);
  }
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
    return Response.redirect(new URL('/review-received', request.url).toString(), 303);
  }

  for (const k of REQUIRED) {
    if (!get(k)) return back(referer, 'missing-fields');
  }
  const product = get('product').toLowerCase();
  if (!PRODUCTS.has(product)) return back(referer, 'bad-request');

  const rating = parseInt(get('rating'), 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return back(referer, 'bad-rating');

  const email = get('email').toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back(referer, 'invalid-email');

  const rec = {
    ts: new Date().toISOString(),
    product,
    rating,
    name: get('name').slice(0, 120),
    role: get('role').slice(0, 120),
    organization: get('organization').slice(0, 160),
    email: email.slice(0, 160),
    body: get('body').slice(0, 4000),
    consent_publish: get('consent_publish') ? 1 : 0,
    status: 'pending',
    ip: request.headers.get('cf-connecting-ip') ?? '',
    user_agent: request.headers.get('user-agent') ?? '',
  };

  // Store in D1 if bound (best-effort — never block the visitor on storage).
  if (env.REVIEWS_DB) {
    try {
      await env.REVIEWS_DB
        .prepare(
          `INSERT INTO reviews
            (ts, product, rating, name, role, organization, email, body,
             consent_publish, status, ip, user_agent)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          rec.ts, rec.product, rec.rating, rec.name, rec.role, rec.organization,
          rec.email, rec.body, rec.consent_publish, rec.status, rec.ip, rec.user_agent,
        )
        .run();
    } catch {
      /* fall through to email so the review isn't lost */
    }
  }

  // Email a moderation notice (best-effort).
  if (env.RESEND_API_KEY) {
    const to = env.REVIEW_TO || 'info@purpledirective.com';
    const from = env.REVIEW_FROM || 'Reviews <noreply@purpledirective.com>';
    const stars = '★'.repeat(rec.rating) + '☆'.repeat(5 - rec.rating);
    const text =
      `New ${product} review (pending approval)\n\n` +
      `Rating: ${stars} (${rec.rating}/5)\n` +
      `Name: ${rec.name}\n` +
      `Role: ${rec.role || '—'}\n` +
      `Organization: ${rec.organization || '—'}\n` +
      `Email: ${rec.email || '—'}\n` +
      `OK to publish: ${rec.consent_publish ? 'yes' : 'no'}\n\n` +
      `Review:\n${rec.body}\n\n` +
      `— To publish: add to src/data/testimonials.ts and commit.`;
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: [to], reply_to: rec.email || undefined,
          subject: `New ${product} review — ${rec.name} (${rec.rating}/5)`, text,
        }),
      });
    } catch {
      /* best-effort */
    }
  }

  return Response.redirect(new URL('/review-received', request.url).toString(), 303);
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
