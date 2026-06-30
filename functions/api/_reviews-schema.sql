-- D1 schema for the on-site review inbox (binding: REVIEWS_DB, database: pd-reviews).
--
-- One-time setup (requires Cloudflare auth — run by an operator, not in CI):
--   wrangler d1 create pd-reviews
--   wrangler d1 execute pd-reviews --remote --file functions/api/_reviews-schema.sql
-- then bind it in the Pages project:
--   Cloudflare dashboard → Pages → (this project) → Settings → Functions →
--   D1 database bindings → Variable name: REVIEWS_DB → Database: pd-reviews
--   (add for BOTH Production and Preview environments).
--
-- Moderation flow (manual-approve gate): submissions land here as status='pending'.
-- To publish one, copy it into src/data/testimonials.ts and commit — the commit
-- is the approval. Nothing here is ever rendered automatically.

CREATE TABLE IF NOT EXISTS reviews (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              TEXT NOT NULL,                     -- ISO-8601 submission time
  product         TEXT NOT NULL,                     -- 'sop' | 'consulting'
  rating          INTEGER NOT NULL,                  -- 1..5
  name            TEXT NOT NULL,
  role            TEXT,
  organization    TEXT,
  email           TEXT,
  body            TEXT NOT NULL,
  consent_publish INTEGER NOT NULL DEFAULT 0,        -- 1 if submitter OK'd publishing
  status          TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
  ip              TEXT,
  user_agent      TEXT
);

CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product);
