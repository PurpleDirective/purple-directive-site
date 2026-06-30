/**
 * Cloudflare Pages Function: POST /api/consulting-intake
 *
 * Receives the Consulting post-purchase intake form (form-encoded) from
 * /thank-you-consulting, emails the submission to the intake inbox via Resend,
 * then redirects to /consulting-intake-received (success) or back to the form
 * with ?intake_error=... (failure). Mirrors ./research-intake.ts exactly.
 *
 * Env vars (Cloudflare Pages → Settings → Environment → Production + Preview):
 *   RESEND_API_KEY   REQUIRED, secret. Resend key for the purpledirective.com domain.
 *   INTAKE_TO        optional. Recipient; defaults to info@purpledirective.com.
 *   INTAKE_FROM      optional. Verified Resend sender; defaults to
 *                    "Consulting Intake <noreply@purpledirective.com>".
 *
 * Local dev note: Pages Functions do NOT run under `npm run dev`. Test with
 * `npx wrangler pages dev ./dist` after `npm run build`, with the env vars set.
 */

interface Env {
  RESEND_API_KEY?: string;
  INTAKE_TO?: string;
  INTAKE_FROM?: string;
}

const REQUIRED = [
  'name', 'email', 'organization', 'stripe_order_id',
  'tier', 'study_stage', 'needs', 'timeline',
] as const;

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  role: 'Role / title',
  organization: 'Site / organization',
  stripe_order_id: 'Stripe order ID',
  tier: 'Engagement tier',
  study_stage: 'Study stage / indication',
  needs: 'What they need',
  timeline: 'Timeline',
  prior_support: 'Prior support / context',
  anything_else: 'Anything else',
};

function back(referer: string, code: string): Response {
  try {
    const url = new URL(referer);
    url.searchParams.set('intake_error', code);
    return Response.redirect(url.toString(), 303);
  } catch {
    return Response.redirect('https://purpledirective.com/thank-you-consulting?intake_error=' + code, 303);
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Same-origin guard (covers prod, www, localhost, and *.pages.dev previews).
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const reqHost = new URL(request.url).host;
  const srcHost = referer ? new URL(referer).host : (origin ? new URL(origin).host : '');
  if (srcHost && srcHost !== reqHost && !srcHost.endsWith('.pages.dev')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Fail loud (clear redirect) if the mailer isn't configured.
  if (!env.RESEND_API_KEY) return back(referer, 'not-configured');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back(referer, 'bad-request');
  }

  const get = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot — bots fill a hidden field; silently treat as success, send nothing.
  if (get('company_website') !== '') {
    return Response.redirect(new URL('/consulting-intake-received', request.url).toString(), 303);
  }

  const email = get('email').toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back(referer, 'invalid-email');
  for (const k of REQUIRED) {
    if (!get(k)) return back(referer, 'missing-fields');
  }

  // Compose the email body from all known fields.
  const lines: string[] = [];
  for (const k of Object.keys(FIELD_LABELS)) {
    const v = get(k);
    if (v) lines.push(`${FIELD_LABELS[k]}:\n${v}`);
  }
  const text = `New Consulting intake\n\n${lines.join('\n\n')}\n`;
  const to = env.INTAKE_TO || 'info@purpledirective.com';
  const from = env.INTAKE_FROM || 'Consulting Intake <noreply@purpledirective.com>';
  const subject = `New Consulting intake — ${get('name')} (${get('organization')})`;

  let resp: Response;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text }),
    });
  } catch {
    return back(referer, 'network');
  }

  if (resp.ok) {
    return Response.redirect(new URL('/consulting-intake-received', request.url).toString(), 303);
  }

  let code = 'unknown';
  if (resp.status === 401 || resp.status === 403) code = 'auth';
  else if (resp.status === 422) code = 'invalid-email';
  else if (resp.status === 429) code = 'rate-limited';
  else if (resp.status >= 500) code = 'resend-down';
  return back(referer, code);
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
