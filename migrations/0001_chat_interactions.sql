-- pd-chat-logs / chat_interactions
-- Full-interaction log for the purpledirective.com public site assistant
-- (functions/api/chat.ts). One row per request, success AND failure.
-- No PHI: the assistant is public-info only and content is PHI-scrubbed
-- (functions/api/_phi-scrub.ts) before insertion. This table is a
-- training-corpus source — see 6.Infra/AI-DATA-COLLECTION-AUDIT.md.
--
-- Provision (Tyrian, authenticated wrangler):
--   npx wrangler d1 create pd-chat-logs
--   # paste the returned database_id into wrangler.toml
--   npx wrangler d1 execute pd-chat-logs --remote --file migrations/0001_chat_interactions.sql

CREATE TABLE IF NOT EXISTS chat_interactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT,              -- ISO-8601 request time
  request_id    TEXT,              -- cf-ray
  ip            TEXT,              -- cf-connecting-ip
  country       TEXT,              -- cf-ipcountry
  user_agent    TEXT,
  referer       TEXT,
  model         TEXT,
  region        TEXT,
  turn_count    INTEGER,
  messages_json TEXT,              -- full conversation sent to the model (PHI-scrubbed)
  reply         TEXT,              -- model reply as stored (PHI-scrubbed)
  stop_reason   TEXT,
  status        INTEGER,           -- HTTP status returned to the client
  outcome       TEXT,              -- ok | guardrail | bad_request | forbidden | ...
  input_tokens  INTEGER,
  output_tokens INTEGER,
  latency_ms    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_interactions (ts);
CREATE INDEX IF NOT EXISTS idx_chat_outcome ON chat_interactions (outcome);
