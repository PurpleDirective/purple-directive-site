/**
 * Cloudflare Pages Function: POST /api/chat
 *
 * The Purple Directive website assistant — a NO-PHI, public-info chat agent.
 * Answers questions about PD's products/services from a fixed system prompt
 * (see _chat-system-prompt.ts, generated from previews/chat-agent/system-prompt.txt).
 *
 * Backend: AWS Bedrock (Converse API), so the chat agent shares one AI provider,
 * one IAM/billing/quota surface, and one compliance envelope with the planned
 * all-AWS voice stack (Connect -> Transcribe -> Bedrock -> Polly). The website
 * itself stays on Cloudflare Pages; this function is same-origin glue that signs
 * an outbound Bedrock request with SigV4 (aws4fetch) — AWS creds never reach the
 * browser, and the visitor only ever talks to purpledirective.com.
 *
 * Env vars (Cloudflare Pages -> Settings -> Environment, all secret):
 *   AWS_ACCESS_KEY_ID       required. Dedicated PD-business Bedrock IAM user
 *   AWS_SECRET_ACCESS_KEY   required.   (NOT the family-hub account).
 *   AWS_SESSION_TOKEN       optional, only if using temporary credentials.
 *   BEDROCK_REGION          optional. Default us-west-2 (proven Haiku 4.5 access).
 *   BEDROCK_MODEL_ID        optional. Default us.anthropic.claude-haiku-4-5-20251001-v1:0
 *                           (a cross-region inference profile; cheap+fast for a public
 *                           FAQ bot — swap to a Sonnet profile for higher quality).
 *
 * IAM least-privilege: the user only needs bedrock:InvokeModel on the model +
 * inference-profile ARNs for the chosen region. No bedrock:List* needed.
 *
 * Local dev: Pages Functions don't run under `astro dev`. Test the widget+backend
 * end-to-end with previews/chat-agent/dev-server.py (which calls Bedrock via boto3),
 * or the real function with `npx wrangler pages dev ./dist` after `npm run build`.
 */
import { AwsClient } from 'aws4fetch';
import { SYSTEM_PROMPT } from './_chat-system-prompt';

interface Env {
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_SESSION_TOKEN?: string;
  BEDROCK_REGION?: string;
  BEDROCK_MODEL_ID?: string;
}

interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_REGION = 'us-west-2';
const DEFAULT_MODEL = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
const MAX_OUTPUT_TOKENS = 300;        // answers are short
const MAX_MESSAGES = 12;              // conversation turn cap
const MAX_CHARS_PER_MESSAGE = 2000;   // per-message size cap
const MAX_TOTAL_CHARS = 8000;        // whole-conversation cost guard

const SAME_ORIGIN_HOSTS = new Set([
  'purpledirective.com',
  'www.purpledirective.com',
  'localhost:4321',
  'localhost:8788', // wrangler pages dev default
  '127.0.0.1:8788',
]);

const FALLBACK =
  "Sorry — something went wrong on our end. Please email info@purpledirective.com and the team will follow up.";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Same-origin guard (basic CSRF / abuse protection).
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const sourceHost =
    (referer ? new URL(referer).host : '') || (origin ? new URL(origin).host : '');
  if (sourceHost && !SAME_ORIGIN_HOSTS.has(sourceHost)) {
    return json({ error: 'forbidden' }, 403);
  }

  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return json({ error: 'assistant_unavailable' }, 503);
  }

  // Parse + validate the client payload.
  let payload: { messages?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const rawList = Array.isArray(payload.messages) ? payload.messages : null;
  if (!rawList || rawList.length === 0) return json({ error: 'bad_request' }, 400);

  const messages: Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }> = [];
  let totalChars = 0;
  for (const m of rawList.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as ClientMessage).role;
    let content = (m as ClientMessage).content;
    if (role !== 'user' && role !== 'assistant') continue; // never accept client 'system'
    if (typeof content !== 'string') continue;
    content = content.slice(0, MAX_CHARS_PER_MESSAGE).trim();
    if (!content) continue;
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) break;
    messages.push({ role, content: [{ text: content }] });
  }
  // Bedrock requires the first message to be from the user, alternating roles.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (messages.length === 0) return json({ error: 'bad_request' }, 400);

  // Sign + send the Bedrock Converse request (SigV4 via aws4fetch).
  const region = env.BEDROCK_REGION || DEFAULT_REGION;
  const modelId = env.BEDROCK_MODEL_ID || DEFAULT_MODEL;
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(
    modelId,
  )}/converse`;

  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    sessionToken: env.AWS_SESSION_TOKEN,
    service: 'bedrock',
    region,
  });

  let apiResp: Response;
  try {
    apiResp = await aws.fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system: [{ text: SYSTEM_PROMPT }],
        messages,
        inferenceConfig: { maxTokens: MAX_OUTPUT_TOKENS },
      }),
    });
  } catch {
    return json({ error: 'upstream_unavailable', reply: FALLBACK }, 502);
  }

  if (!apiResp.ok) {
    // Don't leak upstream error detail to the client.
    return json({ error: 'assistant_error', reply: FALLBACK }, 502);
  }

  const data = (await apiResp.json()) as {
    stopReason?: string;
    output?: { message?: { content?: Array<{ text?: string }> } };
  };

  if (data.stopReason === 'guardrail_intervened' || data.stopReason === 'content_filtered') {
    return json({
      reply:
        "I can't help with that one. For anything I can't answer here, email info@purpledirective.com and the team will follow up.",
    });
  }

  const reply = (data.output?.message?.content ?? [])
    .map((b) => b.text || '')
    .join('\n')
    .trim();

  return json({
    reply:
      reply ||
      "Sorry — I didn't catch that. Could you rephrase, or email info@purpledirective.com?",
  });
};
