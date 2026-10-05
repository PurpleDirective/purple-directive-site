/**
 * Tell the operator when a visitor's form could not be delivered.
 *
 * A form that fails shows the visitor an error; without this nobody on our
 * side knows it happened. The push goes to the same ntfy topic as the
 * reliability gate (purple-alerts). It carries the form's name and the reason,
 * never what the visitor typed.
 *
 * Env vars (Cloudflare Pages secrets):
 *   ALERT_NTFY_URL    the topic URL. Unset = no alert is sent.
 *   ALERT_NTFY_TOKEN  bearer token for that topic.
 */
export interface AlertEnv {
  ALERT_NTFY_URL?: string;
  ALERT_NTFY_TOKEN?: string;
}

export async function alertOperator(env: AlertEnv, form: string, reason: string): Promise<void> {
  if (!env.ALERT_NTFY_URL || !env.ALERT_NTFY_TOKEN) return;
  try {
    await fetch(env.ALERT_NTFY_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ALERT_NTFY_TOKEN}`,
        Title: `Form failed: ${form}`,
        Priority: 'high',
        Tags: 'rotating_light',
      },
      body: `A visitor submitted the ${form} form on purpledirective.com and it was not delivered (${reason}). They saw an error asking them to email info@purpledirective.com.`,
    });
  } catch {
    // The visitor's reply must not depend on the alert going out.
  }
}
