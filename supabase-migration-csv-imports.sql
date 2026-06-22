-- ============================================================
-- WellnessOS — CSV Import persistence
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- ============================================================

-- 1. Import-history / batch table
CREATE TABLE IF NOT EXISTS csv_import_batches (
  id BIGSERIAL PRIMARY KEY,
  file_name         TEXT,
  batch_name        TEXT,
  source            TEXT,
  branch            TEXT,
  service           TEXT,
  imported_by       TEXT,
  total_records     INTEGER NOT NULL DEFAULT 0,
  valid_records     INTEGER NOT NULL DEFAULT 0,
  duplicate_records INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Imported lead rows (valid + duplicate kept separately via status)
CREATE TABLE IF NOT EXISTS csv_leads (
  id BIGSERIAL PRIMARY KEY,
  batch_id   BIGINT REFERENCES csv_import_batches(id) ON DELETE CASCADE,
  date_time  TEXT,
  campaign   TEXT,
  ad_name    TEXT,
  lead_name  TEXT,
  phone      TEXT,
  sugar_poll TEXT,
  city       TEXT,
  street     TEXT,
  source     TEXT,
  service    TEXT,
  name       TEXT,
  status     TEXT NOT NULL DEFAULT 'valid',   -- valid | duplicate
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csv_leads_batch  ON csv_leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_csv_leads_status ON csv_leads(status);
CREATE INDEX IF NOT EXISTS idx_csv_leads_phone  ON csv_leads(phone);

-- 3. Row Level Security + public policies (development)
ALTER TABLE csv_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_leads          ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['csv_import_batches','csv_leads'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_read"   ON %I;', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert" ON %I;', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update" ON %I;', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "%s_read"   ON %I FOR SELECT USING (true);', t, t);
    EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT WITH CHECK (true);', t, t);
    EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE USING (true);', t, t);
    EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE USING (true);', t, t);
  END LOOP;
END $$;
