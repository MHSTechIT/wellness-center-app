-- ============================================================
-- WellnessOS — Client ID (WCyyNNNN)
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
-- One ID per client, shared across ALL services, generated at reception
-- walk-in registration. Additive and safe to re-run.
-- ============================================================
ALTER TABLE leads        ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_id TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_client_id        ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
