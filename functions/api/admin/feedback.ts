/**
 * Cloudflare Pages Function: GET /api/admin/feedback
 *
 * Operator-only dump of the /feedback intake (FEEDBACK_DB, schema in
 * ../_feedback-schema.sql). Auth + response contract deliberately mirror
 * QuillPDF's /api/admin/feedback — Bearer <FEEDBACK_ADMIN_KEY>, refuse-all
 * when the key is unset or short, `{ mode, count, entries }` body — so one
 * collector can read both stores. Entries here carry extra fields
 * (product, quotable, name_role) on top of QuillPDF's ts/page/message/
 * email/country; readers of the shared shape can ignore them.
 *
 * Query params: ?limit=N (default 500, max 1000) — newest last, like the
 * QuillPDF endpoint.
 */

interface Env {
  FEEDBACK_DB?: D1Database;
  FEEDBACK_ADMIN_KEY?: string;
}

interface FeedbackRow {
  ts: string;
  product: string;
  page: string | null;
  message: string;
  email: string | null;
  quotable: number;
  name_role: string | null;
  country: string | null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

// Constant-time comparison: hash both sides so length never leaks, then
// compare every byte (Workers runtime has no node:crypto timingSafeEqual).
async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const ua = new Uint8Array(da);
  const ub = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const expected = env.FEEDBACK_ADMIN_KEY;
  if (!expected || expected.length < 16) {
    return json({ error: 'endpoint disabled' }, 503);
  }

  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !(await timingSafeCompare(token, expected))) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'www-authenticate': 'Bearer realm="pd-feedback"',
      },
    });
  }

  if (!env.FEEDBACK_DB) return json({ error: 'storage not bound' }, 503);

  const limitRaw = parseInt(new URL(request.url).searchParams.get('limit') ?? '500', 10);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 500, 1), 1000);

  try {
    const { results } = await env.FEEDBACK_DB
      .prepare(
        `SELECT ts, product, page, message, email, quotable, name_role, country
         FROM feedback ORDER BY id DESC LIMIT ?`,
      )
      .bind(limit)
      .all<FeedbackRow>();
    const entries = (results ?? []).reverse().map((r) => ({
      ts: r.ts,
      product: r.product,
      page: r.page || undefined,
      message: r.message,
      email: r.email || undefined,
      quotable: r.quotable === 1,
      name_role: r.name_role || undefined,
      country: r.country || undefined,
    }));
    return json({ mode: 'd1', count: entries.length, entries });
  } catch (err) {
    return json({ error: 'query failed' }, 500);
  }
};

// Reject non-GET requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } });
};
