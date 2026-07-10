-- ============================================================
-- WellnessOS — consolidated schema for plain PostgreSQL
-- (migrated from Supabase). Backend-owned DB: no RLS, no Supabase
-- storage/realtime/auth objects, no sample seed data.
-- Safe to re-run (IF NOT EXISTS throughout).
-- ============================================================

-- 1. LEADS ---------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  source           TEXT NOT NULL,
  lead_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  is_valid         BOOLEAN NOT NULL DEFAULT true,
  is_duplicate     BOOLEAN NOT NULL DEFAULT false,
  is_assigned      BOOLEAN NOT NULL DEFAULT false,
  assigned_to      TEXT,
  campaign         TEXT,
  service          TEXT DEFAULT 'Diabetes',
  language         TEXT DEFAULT 'Tamil',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- lead-form fields
  ad_name          TEXT,
  sugar_poll       TEXT,
  city             TEXT,
  street           TEXT,
  -- call/lead status
  call_status      TEXT,
  next_followup    TIMESTAMPTZ,
  -- assignment pool
  in_pool          BOOLEAN NOT NULL DEFAULT false,
  pool_added_at    TIMESTAMPTZ,
  assigned_at      TIMESTAMPTZ,
  -- Meta attribution
  meta_lead_id     TEXT,
  campaign_id      TEXT,
  ad_account_id    TEXT,
  ad_account_name  TEXT,
  form_name        TEXT,
  -- profiles / vitals (JSONB)
  coach_profile    JSONB,
  advisor_profile  JSONB,
  screening_vitals JSONB,
  visited_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_leads_source        ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_date          ON leads(lead_date);
CREATE INDEX IF NOT EXISTS idx_leads_source_date   ON leads(source, lead_date);
CREATE INDEX IF NOT EXISTS idx_leads_call_status   ON leads(call_status);
CREATE INDEX IF NOT EXISTS idx_leads_in_pool       ON leads(in_pool);
CREATE INDEX IF NOT EXISTS idx_leads_ad_account    ON leads(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign      ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_visited       ON leads(visited_at);
-- meta_lead_id is the natural key for UPSERT (NULLs stay distinct).
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_meta_lead_id ON leads(meta_lead_id);

-- 2. SOURCE CONNECTIONS --------------------------------------
CREATE TABLE IF NOT EXISTS source_connections (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'Not connected',
  status_color TEXT NOT NULL DEFAULT 'neu',
  mode         TEXT NOT NULL DEFAULT '—',
  last_lead    TEXT DEFAULT '—'
);

-- 3. META TOKENS ---------------------------------------------
CREATE TABLE IF NOT EXISTS meta_tokens (
  id           SERIAL PRIMARY KEY,
  token_type   TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. META SYNC STATE -----------------------------------------
CREATE TABLE IF NOT EXISTS meta_sync_state (
  id                  SERIAL PRIMARY KEY,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at         TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'running',
  leads_synced        INTEGER DEFAULT 0,
  forms_scanned       INTEGER DEFAULT 0,
  campaigns_matched   INTEGER DEFAULT 0,
  accounts_accessible TEXT,
  error               TEXT
);

-- 5. ASSIGNEES (advisor master) ------------------------------
CREATE TABLE IF NOT EXISTS assignees (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'Advisor',
  branch     TEXT NOT NULL DEFAULT 'Chennai',
  phone      TEXT,
  email      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. APPOINTMENTS --------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id                    BIGSERIAL PRIMARY KEY,
  lead_id               TEXT,
  client_name           TEXT,
  phone                 TEXT,
  service               TEXT,
  hc_pt                 TEXT,
  appt_date             DATE,
  appt_time             TEXT,
  status                TEXT DEFAULT 'expected',
  visited_at            TEXT,
  stage                 TEXT,
  session               TEXT,
  source                TEXT,
  language              TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  blood_test_data       JSONB,
  screening_vitals_data JSONB,
  physio_data           JSONB
);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appt_date);
CREATE INDEX IF NOT EXISTS idx_appointments_blood_test ON appointments ((blood_test_data IS NOT NULL)) WHERE blood_test_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_physio     ON appointments ((physio_data IS NOT NULL)) WHERE physio_data IS NOT NULL;

-- 7. PAYMENTS ------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                  BIGSERIAL PRIMARY KEY,
  appointment_id      BIGINT,
  lead_id             TEXT,
  amount              INT DEFAULT 0,
  status              TEXT DEFAULT 'paid',
  method              TEXT,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  verified            BOOLEAN DEFAULT false,
  verified_at         TIMESTAMPTZ,
  verified_by         TEXT,
  refund_status       TEXT,
  refund_amount       INT DEFAULT 0,
  refund_reason       TEXT,
  refund_requested_at TIMESTAMPTZ,
  refund_processed_at TIMESTAMPTZ,
  payment_type        TEXT DEFAULT 'full',
  installment_number  INT,
  total_installments  INT,
  emi_provider        TEXT,
  emi_subvention      INT DEFAULT 0,
  service             TEXT,
  txn_ref             TEXT,
  proof_url           TEXT,
  proof_name          TEXT
);
CREATE INDEX IF NOT EXISTS idx_payments_appt          ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_lead          ON payments(lead_id);
CREATE INDEX IF NOT EXISTS idx_payments_verified      ON payments(verified);
CREATE INDEX IF NOT EXISTS idx_payments_refund_status ON payments(refund_status) WHERE refund_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_service       ON payments(service) WHERE service IS NOT NULL;

-- 8. CSV IMPORT BATCHES + LEADS ------------------------------
CREATE TABLE IF NOT EXISTS csv_import_batches (
  id                BIGSERIAL PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS csv_leads (
  id         BIGSERIAL PRIMARY KEY,
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
  status     TEXT NOT NULL DEFAULT 'valid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_csv_leads_batch  ON csv_leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_csv_leads_status ON csv_leads(status);
CREATE INDEX IF NOT EXISTS idx_csv_leads_phone  ON csv_leads(phone);

-- 9. CALL RECORDINGS -----------------------------------------
CREATE TABLE IF NOT EXISTS call_recordings (
  id               BIGSERIAL PRIMARY KEY,
  contact_id       TEXT,
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

-- 10. LEAD ACTIVITY ------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activity (
  id         BIGSERIAL PRIMARY KEY,
  lead_id    TEXT NOT NULL,
  action     TEXT NOT NULL,
  field      TEXT,
  old_value  TEXT,
  new_value  TEXT,
  actor      TEXT NOT NULL DEFAULT 'ABM / Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON lead_activity(lead_id, created_at DESC);

-- 11. RBAC: app_users + app_settings -------------------------
CREATE TABLE IF NOT EXISTS app_users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'Advisor',
  active        BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT,               -- scrypt$salt$hash (set via /auth/signup)
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(lower(email));

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Owner account (reference data, required for RBAC / login).
INSERT INTO app_users (email, name, role, active)
VALUES ('info@myhealthschool.in', 'Owner', 'Super Admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'Super Admin', active = true;

-- 12. LEAD ASSIGNMENTS (assignment history) -----------------
-- One immutable row per assignment event. `leads` keeps only current state
-- (assigned_to / is_assigned); this table is the audit trail behind the
-- "Assigned Leads History" view. status: 'assigned' | 'unassigned'.
CREATE TABLE IF NOT EXISTS lead_assignments (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     TEXT,                 -- meta_lead_id of the lead
  lead_name   TEXT,
  lead_phone  TEXT,
  source      TEXT,
  service     TEXT,
  advisor     TEXT,                 -- assigned health advisor (name)
  assigned_by TEXT,                 -- actor (logged-in user)
  status      TEXT NOT NULL DEFAULT 'assigned',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead    ON lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_created ON lead_assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_advisor ON lead_assignments(advisor);

-- 13. OFFICE-VISIT RECORDINGS (audio) -----------------------
-- In-clinic audio recordings captured on the Health Coach screen (distinct
-- from telephony call_recordings). The file itself lives under /storage.
CREATE TABLE IF NOT EXISTS office_recordings (
  id               BIGSERIAL PRIMARY KEY,
  lead_id          TEXT NOT NULL,   -- meta_lead_id of the customer
  file_url         TEXT,            -- public URL (/storage/files/...)
  file_path        TEXT,            -- storage-relative path
  file_name        TEXT,
  duration_seconds INT,
  recorded_by      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_office_recordings_lead ON office_recordings(lead_id, created_at DESC);

-- Zoom / online consultation recordings (link-based, distinct from the on-disk
-- office_recordings audio). Captured from the Health Coach recording-URL field.
CREATE TABLE IF NOT EXISTS zoom_recordings (
  id               BIGSERIAL PRIMARY KEY,
  lead_id          TEXT NOT NULL,   -- meta_lead_id of the customer
  customer_name    TEXT,
  meeting_url      TEXT,            -- Zoom (or other) recording link
  duration_seconds INT,
  status           TEXT,            -- 'Ready' once a link is present, else 'Pending'
  recorded_by      TEXT,
  meeting_at       TIMESTAMPTZ,     -- when the consultation happened
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zoom_recordings_lead ON zoom_recordings(lead_id, created_at DESC);

-- 14. Appointment meeting metadata (Zoom vs walk-in check-in) -
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_type TEXT;   -- 'zoom' | 'direct'
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 15. Client ID (WCyyNNNN) — one ID per client, shared across ALL services,
-- generated at reception walk-in registration. Stored on both the client (leads)
-- and each appointment so the check-in search can match by Client ID.
ALTER TABLE leads        ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_id TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_client_id        ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
