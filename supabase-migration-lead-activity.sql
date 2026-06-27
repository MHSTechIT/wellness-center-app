-- ============================================================
-- WellnessOS — per-lead Activity Log (audit history)
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- One row per change: who, what, previous → new value, when, action type.
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_activity (
  id BIGSERIAL PRIMARY KEY,
  lead_id    TEXT NOT NULL,                 -- leads.meta_lead_id
  action     TEXT NOT NULL,                 -- Created / Updated / Assigned / Status Changed / Follow-up Added / File Uploaded / Notes Updated
  field      TEXT,                          -- which field changed (optional)
  old_value  TEXT,                          -- previous value (optional)
  new_value  TEXT,                          -- new value (optional)
  actor      TEXT NOT NULL DEFAULT 'ABM / Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON lead_activity(lead_id, created_at DESC);

ALTER TABLE lead_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on lead_activity"   ON lead_activity;
DROP POLICY IF EXISTS "Allow public insert on lead_activity" ON lead_activity;
CREATE POLICY "Allow public read on lead_activity"   ON lead_activity FOR SELECT USING (true);
CREATE POLICY "Allow public insert on lead_activity" ON lead_activity FOR INSERT WITH CHECK (true);

-- ============================================================
-- STORAGE (for the Blood-report file uploads):
-- In the Supabase dashboard → Storage → create a bucket named exactly:
--     lead-files
-- and mark it PUBLIC (so attachment links open without signed URLs).
-- (If you prefer a private bucket, tell me and I'll switch the code to signed URLs.)
-- ============================================================
