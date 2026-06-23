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
 * FULL INTERACTION LOGGING: every request (success AND failure) is written in
 * full to the CHAT_LOG_DB D1 binding via ctx.waitUntil — the complete conversation
 * sent, the reply, model/region, client metadata, outcome, token usage, latency.
 * Logging is non-blocking and a no-op if the binding is absent, so it never
 * affects the visitor's response. Required by policy: AI services log the full
 * interaction. (No PHI — enforced by the system prompt + the same-origin guard.)
 *
 * Env vars (Cloudflare Pages -> Settings -> Environment, all secret):
 *   AWS_ACCESS_KEY_ID       required. Dedicated PD-business Bedrock IAM user
 *   AWS_SECRET_ACCESS_KEY   required.   (NOT the family-hub account).
 *   AWS_SESSION_TOKEN       optional, only if using temporary credentials.
 *   BEDROCK_REGION          optional. Default us-west-2 (proven Haiku 4.5 access).
 *   BEDROCK_MODEL_ID        optional. Default us.anthropic.claude-haiku-4-5-20251001-v1:0
 * Bindings:
 *   CHAT_LOG_DB             optional D1 binding (database: pd-chat-logs). When
 *                           bound, every interaction is logged to chat_interactions.
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
  CHAT_LOG_DB?: D1Database;
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

interface LogRecord {
  ts: string;
  request_id: string | null;
  ip: string | null;
  country: string | null;
  user_agent: string | null;
  referer: string | null;
  model: string | null;
  region: string | null;
  turn_count: number | null;
  messages_json: string;
  reply: string | null;
  stop_reason: string | null;
  status: number;
  outcome: string;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
}

/** Write one full interaction record to D1 (non-blocking; no-op without binding). */
function logInteraction(ctx: EventContext<Env, string, unknown>, env: Env, rec: LogRecord): void {
  const db = env.CHAT_LOG_DB;
  if (!db) return; // logging not wired yet — never block the response
  try {
    const stmt = db
      .prepare(
        `INSERT INTO chat_interactions
          (ts, request_id, ip, country, user_agent, referer, model, region,
           turn_count, messages_json, reply, stop_reason, status, outcome,
           input_tokens, output_tokens, latency_ms)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .bind(
        rec.ts, rec.request_id, rec.ip, rec.country, rec.user_agent, rec.referer,
        rec.model, rec.region, rec.turn_count, rec.messages_json, rec.reply,
        rec.stop_reason, rec.status, rec.outcome, rec.input_tokens, rec.output_tokens,
        rec.latency_ms,
      );
    ctx.waitUntil(stmt.run().catch(() => { /* logging must never throw to the client */ }));
  } catch {
    /* swallow — logging is best-effort and must not affect the response */
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const startedAt = Date.now();

  // Client metadata captured up front so every exit path can log it.
  const referer = request.headers.get('referer') ?? '';
  const origin = request.headers.get('origin') ?? '';
  const meta = {
    ts: new Date().toISOString(),
    request_id: request.headers.get('cf-ray'),
    ip: request.headers.get('cf-connecting-ip'),
    country: request.headers.get('cf-ipcountry'),
    user_agent: request.headers.get('user-agent'),
    referer: referer || origin || null,
  };

  const region = env.BEDROCK_REGION || DEFAULT_REGION;
  const modelId = env.BEDROCK_MODEL_ID || DEFAULT_MODEL;

  // Single exit point: log the full interaction, then respond.
  const done = (
    outcome: string,
    status: number,
    body: unknown,
    extra: Partial<LogRecord> = {},
  ): Response => {
    logInteraction(context, env, {
      ts: meta.ts,
      request_id: meta.request_id,
      ip: meta.ip,
      country: meta.country,
      user_agent: meta.user_agent,
      referer: meta.referer,
      model: modelId,
      region,
      turn_count: extra.turn_count ?? null,
      messages_json: extra.messages_json ?? '[]',
      reply: extra.reply ?? null,
      stop_reason: extra.stop_reason ?? null,
      status,
      outcome,
      input_tokens: extra.input_tokens ?? null,
      output_tokens: extra.output_tokens ?? null,
      latency_ms: Date.now() - startedAt,
    });
    return json(body, status);
  };

  // Same-origin guard (basic CSRF / abuse protection).
  const sourceHost =
    (referer ? new URL(referer).host : '') || (origin ? new URL(origin).host : '');
  if (sourceHost && !SAME_ORIGIN_HOSTS.has(sourceHost)) {
    return done('forbidden', 403, { error: 'forbidden' });
  }

  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return done('assistant_unavailable', 503, { error: 'assistant_unavailable' });
  }

  // Parse + validate the client payload.
  let payload: { messages?: unknown };
  try {
    payload = await request.json();
  } catch {
    return done('bad_request', 400, { error: 'bad_request' });
  }
  const rawList = Array.isArray(payload.messages) ? payload.messages : null;
  if (!rawList || rawList.length === 0) {
    return done('bad_request', 400, { error: 'bad_request' });
  }

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
  if (messages.length === 0) {
    return done('bad_request', 400, { error: 'bad_request' });
  }

  // Full conversation sent to the model — logged verbatim.
  const convo = messages.map((m) => ({ role: m.role, content: m.content.map((c) => c.text).join('\n') }));
  const messagesJson = JSON.stringify(convo);
  const turnCount = convo.length;

  // Sign + send the Bedrock Converse request (SigV4 via aws4fetch).
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
    return done('upstream_unavailable', 502, { error: 'upstream_unavailable', reply: FALLBACK }, {
      messages_json: messagesJson,
      turn_count: turnCount,
      reply: FALLBACK,
    });
  }

  if (!apiResp.ok) {
    // Don't leak upstream error detail to the client.
    return done('assistant_error', 502, { error: 'assistant_error', reply: FALLBACK }, {
      messages_json: messagesJson,
      turn_count: turnCount,
      reply: FALLBACK,
      stop_reason: `http_${apiResp.status}`,
    });
  }

  const data = (await apiResp.json()) as {
    stopReason?: string;
    output?: { message?: { content?: Array<{ text?: string }> } };
    usage?: { inputTokens?: number; outputTokens?: number };
  };

  const inputTokens = data.usage?.inputTokens ?? null;
  const outputTokens = data.usage?.outputTokens ?? null;

  if (data.stopReason === 'guardrail_intervened' || data.stopReason === 'content_filtered') {
    const reply =
      "I can't help with that one. For anything I can't answer here, email info@purpledirective.com and the team will follow up.";
    return done('guardrail', 200, { reply }, {
      messages_json: messagesJson,
      turn_count: turnCount,
      reply,
      stop_reason: data.stopReason,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    });
  }

  const reply = (data.output?.message?.content ?? [])
    .map((b) => b.text || '')
    .join('\n')
    .trim();

  const finalReply =
    reply ||
    "Sorry — I didn't catch that. Could you rephrase, or email info@purpledirective.com?";

  return done('ok', 200, { reply: finalReply }, {
    messages_json: messagesJson,
    turn_count: turnCount,
    reply: finalReply,
    stop_reason: data.stopReason ?? null,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  });
};
