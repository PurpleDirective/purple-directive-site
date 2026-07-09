/**
 * Cloudflare Pages Function: POST /api/stripe-webhook
 *
 * Receives Stripe webhook events. On `checkout.session.completed`, if the buyer
 * granted marketing consent at checkout (consent.promotions === 'opt_in'), syncs
 * their email to the Beehiiv "Practitioner Notes" list — buyers are the warmest
 * audience. All other events and non-consenting buyers are acknowledged and
 * ignored. Reuses the Beehiiv call shape from ./subscribe.ts.
 *
 * Signature is verified manually with Web Crypto (Workers have no Node crypto,
 * so the stripe-node SDK's constructEvent can't run here). Replay window: 5 min.
 *
 * Env vars (Cloudflare Pages → Settings → Environment → Production + Preview):
 *   STRIPE_WEBHOOK_SECRET    REQUIRED, secret. The "whsec_..." signing secret
 *                            from dashboard.stripe.com → Developers → Webhooks
 *                            → (this endpoint) → Signing secret.
 *   BEEHIIV_API_KEY          REQUIRED, secret. Same key used by ./subscribe.ts.
 *   BEEHIIV_PUBLICATION_ID   REQUIRED. e.g. "pub_6f5579d5-...".
 *
 * Register the endpoint in Stripe for event `checkout.session.completed` at
 * https://purpledirective.com/api/stripe-webhook.
 *
 * Local dev note: Pages Functions do NOT run under `npm run dev`. Test with
 * `npx wrangler pages dev ./dist` + the Stripe CLI `stripe listen --forward-to`.
 */

interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
}

const REPLAY_TOLERANCE_SECONDS = 300;

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

/** Constant-time string compare (equal length assumed; guards length first). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify a Stripe webhook signature header against the raw payload.
 * Header format: "t=<unix>,v1=<hex>,v1=<hex>,...". Returns true if any v1
 * signature matches and the timestamp is within the replay tolerance.
 */
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  if (!header) return false;
  let t = '';
  const v1: string[] = [];
  for (const part of header.split(',')) {
    const [k, v] = part.split('=');
    if (k === 't') t = v;
    else if (k === 'v1') v1.push(v);
  }
  if (!t || v1.length === 0) return false;

  const ts = parseInt(t, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > REPLAY_TOLERANCE_SECONDS) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = toHex(sigBuf);
  return v1.some((sig) => timingSafeEqual(expected, sig));
}

async function syncToBeehiiv(env: Env, email: string): Promise<void> {
  const url = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`;
  const payload = {
    email,
    reactivate_existing: true,
    send_welcome_email: false, // they just bought — no need for the lead-magnet welcome
    utm_source: 'purpledirective.com',
    utm_medium: 'post-purchase',
    utm_campaign: 'buyer-consent',
    referring_site: 'https://purpledirective.com',
  };
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    // Not configured — acknowledge so Stripe doesn't pile up retries, but do nothing.
    return new Response('webhook not configured', { status: 200 });
  }

  const sig = request.headers.get('stripe-signature') ?? '';
  const raw = await request.text();

  const ok = await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) {
    return new Response('invalid signature', { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  if (event?.type !== 'checkout.session.completed') {
    return new Response('ignored', { status: 200 });
  }

  const session = event.data?.object ?? {};
  const consented = session?.consent?.promotions === 'opt_in';
  const email = String(session?.customer_details?.email ?? '').trim().toLowerCase();

  if (consented && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      && env.BEEHIIV_API_KEY && env.BEEHIIV_PUBLICATION_ID) {
    // Non-blocking: never let a Beehiiv hiccup turn into a Stripe retry storm.
    context.waitUntil(syncToBeehiiv(env, email).catch(() => { /* best-effort */ }));
  }

  return new Response('ok', { status: 200 });
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
