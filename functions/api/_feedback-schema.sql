-- D1 schema for the anonymous product-feedback rail (binding: FEEDBACK_DB,
-- database: pd-feedback). Public door: /feedback (all products, ?product=
-- deep-links). Read path: GET /api/admin/feedback (Bearer FEEDBACK_ADMIN_KEY)
-- — same response contract as QuillPDF's /api/admin/feedback so one collector
-- reads both.
--
-- One-time setup (requires Cloudflare auth — run by an operator, not in CI):
--   wrangler d1 create pd-feedback
--   wrangler d1 execute pd-feedback --remote --file functions/api/_feedback-schema.sql
-- then bind it in the Pages project:
--   Cloudflare dashboard → Pages → purple-directive-site → Settings → Functions →
--   D1 database bindings → Variable name: FEEDBACK_DB → Database: pd-feedback
--   (add for BOTH Production and Preview environments), and set the
--   FEEDBACK_ADMIN_KEY secret in the same settings screen.
--
-- PII discipline (QuillPDF feedback-store pattern): store the message, the
-- optional reply-to email the visitor typed, page, coarse country header, and
-- a timestamp. NEVER the IP or user-agent. The rate-limit table stores only a
-- peppered daily-rotating hash, purged as it ages out.

CREATE TABLE IF NOT EXISTS feedback (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        TEXT NOT NULL,               -- ISO-8601 submission time
  product   TEXT NOT NULL,               -- sops|nexrial|quillpdf|quell|purplesign|misam|volstrin|general
  page      TEXT,                        -- path the visitor came from, if known
  message   TEXT NOT NULL,
  email     TEXT,                        -- optional reply-to, typed by the visitor
  quotable  INTEGER NOT NULL DEFAULT 0,  -- 1 = "you may quote me publicly" ticked
  name_role TEXT,                        -- optional attribution when quotable
  country   TEXT                         -- cf-ipcountry coarse header
);

CREATE INDEX IF NOT EXISTS idx_feedback_ts      ON feedback (ts);
CREATE INDEX IF NOT EXISTS idx_feedback_product ON feedback (product);

-- Transient rate-limit ledger. ip_hash = SHA-256(day : pepper : ip) — not
-- reversible to an IP without the pepper, rotates daily, rows purged on write.
CREATE TABLE IF NOT EXISTS feedback_rl (
  ip_hash TEXT NOT NULL,
  ts      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_rl ON feedback_rl (ip_hash, ts);
