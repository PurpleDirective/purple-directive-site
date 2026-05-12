/**
 * Cloudflare Pages Function: POST /api/subscribe
 *
 * Receives form-encoded { email, source? } from EmailCapture.astro, proxies
 * to Beehiiv's API to create a subscription, then redirects the visitor to
 * /newsletter-confirm (success) or back to the referrer with ?error=... .
 *
 * Why server-side: the Beehiiv API key must never reach the client. We
 * keep the API in our envelope; visitor sees only purpledirective.com,
 * not subscribe-forms.beehiiv.com.
 *
 * Env vars (set in Cloudflare Pages dashboard → Settings → Environment):
 *   BEEHIIV_API_KEY          required, secret. Get from Beehiiv → Settings → API.
 *   BEEHIIV_PUBLICATION_ID   required. e.g. "pub_6f5579d5-0f7c-..."
 *
 * Local dev: this function does NOT run under `npm run dev` (Astro static
 * server). To test the full flow locally, use `npx wrangler pages dev ./dist`
 * after a `npm run build`.
 */

interface Env {
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
}

const SAME_ORIGIN_HOSTS = new Set([
  'purpledirective.com',
  'www.purpledirective.com',
  'localhost:4321',
  'localhost:4325',
  'localhost:8788', // wrangler pages dev default
]);

function redirectBack(referer: string, errorCode?: string): Response {
  try {
    const url = new URL(referer);
    if (errorCode) url.searchParams.set('newsletter_error', errorCode);
    else url.searchParams.set('newsletter', 'pending');
    return Response.redirect(url.toString(), 303);
  } catch {
    return Response.redirect('https://purpledirective.com/?newsletter_error=' + (errorCode ?? 'unknown'), 303);
  }
}

function redirectConfirm(origin: string): Response {
  return Response.redirect(`${origin}/newsletter-confirm`, 303);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Reject cross-origin POSTs (basic CSRF protection — Beehiiv has its own
  // rate-limiting but we don't want random sites driving our signup endpoint).
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const refererHost = referer ? new URL(referer).host : '';
  const originHost = origin ? new URL(origin).host : '';
  const sourceHost = refererHost || originHost;
  if (sourceHost && !SAME_ORIGIN_HOSTS.has(sourceHost)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Config sanity check — if the env vars aren't set, fail loud with a
  // clear redirect back to the form so the visitor sees a real message
  // rather than a generic 500.
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    return redirectBack(referer, 'not-configured');
  }

  // Parse the form body.
  let email = '';
  let pageSource = '';
  try {
    const form = await request.formData();
    email = String(form.get('email') ?? '').trim().toLowerCase();
    pageSource = String(form.get('source') ?? '').trim();
  } catch {
    return redirectBack(referer, 'bad-request');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirectBack(referer, 'invalid-email');
  }

  // POST to Beehiiv's API. send_welcome_email + double_opt_in are controlled
  // by the form's own settings in the Beehiiv dashboard (we already enabled
  // double opt-in there). reactivate_existing lets re-subscribers re-enter
  // without a 409 error.
  const beehiivUrl = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`;
  const payload = {
    email,
    reactivate_existing: true,
    send_welcome_email: true,
    utm_source: 'purpledirective.com',
    utm_medium: pageSource || 'newsletter-capture',
    utm_campaign: 'site-capture',
    referring_site: referer || 'https://purpledirective.com',
  };

  let resp: Response;
  try {
    resp = await fetch(beehiivUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return redirectBack(referer, 'network');
  }

  // 201 = created (new sub), 200 = already existed and reactivated.
  if (resp.status === 200 || resp.status === 201) {
    const reqOrigin = new URL(request.url).origin;
    return redirectConfirm(reqOrigin);
  }

  // Translate Beehiiv error codes into short slugs the page can display.
  let errSlug = 'unknown';
  if (resp.status === 400) errSlug = 'invalid-email';
  else if (resp.status === 401 || resp.status === 403) errSlug = 'auth';
  else if (resp.status === 429) errSlug = 'rate-limited';
  else if (resp.status >= 500) errSlug = 'beehiiv-down';
  return redirectBack(referer, errSlug);
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
