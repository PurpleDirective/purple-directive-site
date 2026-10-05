/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Receives the inquiry form on /hire and emails it to the Purple Directive
 * inbox via Resend, then redirects back to the form with a flag the page reads
 * (?contact=sent or ?contact_error=...). It replaces a third-party relay
 * (formsubmit.co) that had never delivered a message to the inbox.
 *
 * Env vars (Cloudflare Pages -> Settings -> Environment):
 *   RESEND_API_KEY   required, secret.
 *   CONTACT_TO       optional. Recipient inbox; defaults to info@purpledirective.com
 *   CONTACT_FROM     optional. Verified Resend sender; defaults to
 *                    "Site Inquiry <noreply@purpledirective.com>". Never an
 *                    address of the receiving mailbox: the inbox files mail
 *                    from itself as a sent copy, marked read.
 *   ALERT_NTFY_URL / ALERT_NTFY_TOKEN   optional, see ./_alert.ts
 */

import { isBot, botRefusal } from './_bot';
import { alertOperator, type AlertEnv } from './_alert';

interface Env extends AlertEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

function back(referer: string, key: 'contact' | 'contact_error', value: string): Response {
  try {
    const url = new URL(referer);
    url.searchParams.delete('contact');
    url.searchParams.delete('contact_error');
    url.searchParams.set(key, value);
    url.hash = 'contact';
    return Response.redirect(url.toString(), 303);
  } catch {
    return Response.redirect(`https://purpledirective.com/hire?${key}=${value}#contact`, 303);
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Same-origin guard (covers prod, www, localhost, and *.pages.dev previews).
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const reqHost = new URL(request.url).host;
  let srcHost = '';
  try {
    srcHost = referer ? new URL(referer).host : (origin ? new URL(origin).host : '');
  } catch {
    return new Response('Forbidden', { status: 403 });
  }
  if (srcHost && srcHost !== reqHost && !srcHost.endsWith('.pages.dev')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Crawlers and scripted clients stop here, as they do on the buy links.
  if (isBot(request.headers.get('user-agent') ?? '')) return botRefusal();

  if (!env.RESEND_API_KEY) {
    context.waitUntil(alertOperator(env, 'site inquiry', 'the mail key is not set'));
    return back(referer, 'contact_error', 'unavailable');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back(referer, 'contact_error', 'bad-request');
  }
  // The browser's maxlength is not a control; cap here too.
  const get = (k: string, max = 300) => String(form.get(k) ?? '').trim().slice(0, max);

  // Honeypot: bots fill a hidden field; treat as success, send nothing. The
  // field is named so a browser's autofill has no reason to touch it.
  if (get('hp_ref') !== '') return back(referer, 'contact', 'sent');

  const name = get('name', 120);
  const email = get('email', 200).toLowerCase();
  const organization = get('organization', 200);
  const message = get('message', 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return back(referer, 'contact_error', 'invalid');
  }

  const to = env.CONTACT_TO || 'info@purpledirective.com';
  const from = env.CONTACT_FROM || 'Site Inquiry <noreply@purpledirective.com>';
  const text = `New inquiry from purpledirective.com/hire\n\nName: ${name}\nEmail: ${email}\nOrganization: ${organization || '(not given)'}\n\n${message}\n`;
  // The inbox rule that keeps site form mail in the Inbox matches "Site inquiry".
  const subject = `Site inquiry — ${name}${organization ? ' (' + organization + ')' : ''}`;

  let resp: Response;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text }),
    });
  } catch {
    context.waitUntil(alertOperator(env, 'site inquiry', 'the mail service could not be reached'));
    return back(referer, 'contact_error', 'unavailable');
  }

  if (resp.ok) return back(referer, 'contact', 'sent');

  context.waitUntil(alertOperator(env, 'site inquiry', `the mail service answered ${resp.status}`));
  return back(referer, 'contact_error', resp.status === 429 ? 'rate-limited' : 'unavailable');
};

// Reject non-POST requests with 405 instead of 404.
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
