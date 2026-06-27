-- ============================================================
-- WellnessOS — Tata Tele / Smartflo click-to-call recordings
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- NOTE: this CRM keys leads by leads.meta_lead_id (TEXT), so contact_id is TEXT
-- (the lead's meta_lead_id), not a BIGINT FK to a numeric contacts table.
-- ============================================================

CREATE TABLE IF NOT EXISTS call_recordings (
  id BIGSERIAL PRIMARY KEY,
  contact_id       TEXT,                         -- leads.meta_lead_id
  call_id          VARCHAR(255) UNIQUE,
  call_type        VARCHAR(50),
  recording_url    VARCHAR(1000),
  recording_path   VARCHAR(500),
  duration_seconds INT DEFAULT 0,
  from_number      VARCHAR(50),
  to_number        VARCHAR(50),
  direction        VARCHAR(20),
  call_status      VARCHAR(50),
  agent_number     VARCHAR(50),
  raw_payload      JSONB,
  created_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_call_recordings_contact ON call_recordings(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_callid  ON call_recordings(call_id);

ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on call_recordings"   ON call_recordings;
DROP POLICY IF EXISTS "Allow public insert on call_recordings" ON call_recordings;
DROP POLICY IF EXISTS "Allow public update on call_recordings" ON call_recordings;
CREATE POLICY "Allow public read on call_recordings"   ON call_recordings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on call_recordings" ON call_recordings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on call_recordings" ON call_recordings FOR UPDATE USING (true);

-- ============================================================
-- STORAGE: in Supabase dashboard → Storage → create a PUBLIC bucket named:
--     call-recordings
-- (Recordings are downloaded from Smartflo and re-hosted here, because Vercel's
--  serverless filesystem is ephemeral — this replaces the spec's uploads/ folder.)
-- ============================================================
