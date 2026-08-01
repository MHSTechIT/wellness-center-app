-- Per-user Tata Tele (Smartflo) click-to-call config.
--
-- Before this, the DID (caller ID) and agent extension lived ONLY in server/.env, resolved
-- per ROLE (tata_tele_caller_id_advisor, ..._coach, ..._reception — see server/src/services/tata.ts).
-- Every advisor therefore shared one extension, and changing a DID meant editing .env and
-- restarting the server. These columns let Settings → Users & Assignees set them per person,
-- so calls ring that individual's desk and show their own caller ID.
--
-- Deliberately on app_users, NOT assignees:
--   * Receptionists place calls but never get an `assignees` row (only lead-receiving roles do).
--   * Changing someone's role DELETES their assignees row, which would silently destroy the DID.
-- The API key stays in server/.env — it is a shared account-level secret and must never be
-- readable through the /db/query gateway.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS tata_did       TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS tata_extension TEXT;

-- configuredCallerNumbers() scans every configured DID/extension on each CDR sync to decide
-- whether a Smartflo call record was genuinely placed through this app. That scan includes
-- INACTIVE users (so historical calls still re-sync), hence no partial-index predicate.
CREATE INDEX IF NOT EXISTS idx_app_users_tata_did ON app_users(tata_did) WHERE tata_did IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_tata_ext ON app_users(tata_extension) WHERE tata_extension IS NOT NULL;
