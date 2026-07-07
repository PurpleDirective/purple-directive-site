/**
 * Cloudflare Pages Function: POST /api/sop-customization
 *
 * Receives the "tailor these SOPs to my site" request form from
 * sop-bundle.astro, emails it to the Purple Directive inbox via Resend, then
 * redirects the visitor back to the SOP page with a flag the page reads to
 * show an inline success/error message (same pattern as /api/subscribe).
 *
 * Why server-side: the Resend API key must never reach the client, and we
 * keep the visitor on purpledirective.com end to end.
 *
 * Env vars (Cloudflare Pages -> Settings -> Environment):
 *   RESEND_API_KEY   required, secret. From pass: purpledirective/resend/api-key
 *   SOP_INTAKE_TO    optional. Recipient inbox; defaults to info@purpledirective.com
 *   SOP_INTAKE_FROM  optional. Verified Resend sender; defaults to
 *                    "Purple Directive <info@purpledirective.com>"
 *
 * Local dev: this does NOT run under `npm run dev` (Astro static server).
 * Test with `npx wrangler pages dev ./dist` after `npm run build`, with
 * RESEND_API_KEY in a .dev.vars file.
 */

interface Env {
  RESEND_API_KEY?: string;
  SOP_INTAKE_TO?: string;
  SOP_INTAKE_FROM?: string;
}

const SAME_ORIGIN_HOSTS = new Set([
  'purpledirective.com',
  'www.purpledirective.com',
  'localhost:4321',
  'localhost:4325',
  'localhost:8788', // wrangler pages dev default
]);

// Redirect back to the SOP page's tailoring section with a success (`sop`)
// or error (`sop_error`) flag the inline script on the page reads.
function redirectBack(referer: string, flag: string, isError: boolean): Response {
  try {
    const url = new URL(referer);
    url.searchParams.delete('sop');
    url.searchParams.delete('sop_error');
    url.searchParams.set(isError ? 'sop_error' : 'sop', flag);
    url.hash = 'tailor';
    return Response.redirect(url.toString(), 303);
  } catch {
    const q = isError ? `sop_error=${flag}` : `sop=${flag}`;
    return Response.redirect(`https://purpledirective.com/sop-bundle?${q}#tailor`, 303);
  }
}

function esc(s: string): string {
  return s.replace(/[<>&"]/g, (c) => (({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' } as Record<string, string>)[c]));
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Basic CSRF guard: reject cross-origin POSTs.
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const sourceHost = (referer ? new URL(referer).host : '') || (origin ? new URL(origin).host : '');
  if (sourceHost && !SAME_ORIGIN_HOSTS.has(sourceHost)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Fail loud with a clear message if the secret isn't set yet.
  if (!env.RESEND_API_KEY) {
    return redirectBack(referer, 'not-configured', true);
  }

  let name = '', email = '', site = '', sops = '', ctx = '', message = '', source = '', trap = '';
  try {
    const form = await request.formData();
    name = String(form.get('name') ?? '').trim();
    email = String(form.get('email') ?? '').trim();
    site = String(form.get('site') ?? '').trim();
    sops = String(form.get('sops') ?? '').trim();
    ctx = String(form.get('context') ?? '').trim();
    message = String(form.get('message') ?? '').trim();
    source = String(form.get('source') ?? '').trim();
    trap = String(form.get('company_url') ?? '').trim(); // honeypot
  } catch {
    return redirectBack(referer, 'bad-request', true);
  }

  // Honeypot: real users never fill the hidden field. Treat as success, send nothing.
  if (trap) {
    return redirectBack(referer, 'submitted', false);
  }

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirectBack(referer, 'invalid', true);
  }

  const to = env.SOP_INTAKE_TO || 'info@purpledirective.com';
  const from = env.SOP_INTAKE_FROM || 'Purple Directive <info@purpledirective.com>';

  const rows = ([
    ['Name', name],
    ['Email', email],
    ['Site / organization', site],
    ['SOPs to tailor', sops],
    ['Protocols / systems / timeline', ctx],
    ['Message', message],
    ['Source', source || 'sop-bundle'],
  ] as [string, string][])
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#555;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:4px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#111;line-height:1.5">
    <p>New SOP customization request from the bundle page.</p>
    <table style="border-collapse:collapse;margin-top:8px">${rows}</table>
    <p style="color:#888;font-size:12px;margin-top:16px">Reply directly to this email to reach ${esc(name)}.</p>
  </div>`;
  const text = `New SOP customization request\n\nName: ${name}\nEmail: ${email}\nSite: ${site}\nSOPs to tailor: ${sops}\nProtocols/systems/timeline: ${ctx}\nMessage: ${message}\nSource: ${source || 'sop-bundle'}`;

  let resp: Response;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: `SOP customization request — ${name}${site ? ' (' + site + ')' : ''}`, html, text }),
    });
  } catch {
    return redirectBack(referer, 'network', true);
  }

  if (resp.ok) {
    return redirectBack(referer, 'submitted', false);
  }

  let slug = 'unknown';
  if (resp.status === 401 || resp.status === 403) slug = 'auth';
  else if (resp.status === 429) slug = 'rate-limited';
  else if (resp.status === 422) slug = 'invalid';
  else if (resp.status >= 500) slug = 'resend-down';
  return redirectBack(referer, slug, true);
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
