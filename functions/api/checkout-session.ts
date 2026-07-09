/**
 * Cloudflare Pages Function: GET /api/checkout-session?session_id=cs_...
 *
 * Looks up a completed Stripe Checkout Session and returns ONLY the
 * purchased product name(s), so /thank-you can render the correct product
 * ("Your SOP-004: Informed Consent is on its way") instead of a hardcoded
 * one. Called client-side from the thank-you page after Stripe redirects
 * back with ?session_id={CHECKOUT_SESSION_ID}.
 *
 * Deliberately minimal surface: returns product description + count only.
 * No customer email, amount, or any PII is echoed back to the browser.
 *
 * Degrades gracefully — if the key is unset, the id is malformed, or
 * Stripe errors, it returns { product: null } with 200 so the page falls
 * back to product-agnostic copy rather than showing an error.
 *
 * Env vars (Cloudflare Pages → Settings → Environment → Production + Preview):
 *   STRIPE_SECRET_KEY   REQUIRED, secret. A RESTRICTED key is strongly
 *                       preferred — only "Checkout Sessions: Read" is needed.
 *                       Get from dashboard.stripe.com → Developers → API keys
 *                       → Restricted keys.
 *
 * Local dev note: Pages Functions do NOT run under `npm run dev`. Test with
 * `npx wrangler pages dev ./dist` after `npm run build`, with the key set.
 */

interface Env {
  STRIPE_SECRET_KEY?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Short cache: the same session_id is immutable, so let the browser
      // (and CDN) cache the lookup briefly without pinning it forever.
      'cache-control': 'public, max-age=300',
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const sessionId = new URL(request.url).searchParams.get('session_id') ?? '';

  // Validate shape before spending a Stripe call. Checkout Session ids are
  // `cs_test_...` / `cs_live_...`; reject anything else outright.
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json({ product: null });
  }

  if (!env.STRIPE_SECRET_KEY) {
    // Not configured yet — page falls back to product-agnostic copy.
    return json({ product: null });
  }

  let resp: Response;
  try {
    resp = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
      {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2024-06-20',
        },
      },
    );
  } catch {
    return json({ product: null });
  }

  if (!resp.ok) {
    return json({ product: null });
  }

  let data: any;
  try {
    data = await resp.json();
  } catch {
    return json({ product: null });
  }

  const items: any[] = data?.line_items?.data ?? [];
  if (!items.length) {
    return json({ product: null });
  }

  // Description is the human-facing line label ("SOP-004: Informed Consent",
  // "Clinical Research SOP Template Bundle"). Fall back to price nickname.
  const first = items[0]?.description || items[0]?.price?.nickname || null;
  return json({ product: first, count: items.length });
};

// Method-specific onRequestGet handles GET; this catch-all returns 405 for
// everything else (Pages gives the method-specific handler precedence).
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } });
};
