-- ============================================================
-- WellnessOS Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT NOT NULL,
  lead_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  is_assigned BOOLEAN NOT NULL DEFAULT false,
  assigned_to TEXT,
  campaign TEXT,
  service TEXT DEFAULT 'Diabetes',
  language TEXT DEFAULT 'Tamil',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SOURCE CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS source_connections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Not connected',
  status_color TEXT NOT NULL DEFAULT 'neu',
  mode TEXT NOT NULL DEFAULT '—',
  last_lead TEXT DEFAULT '—'
);

-- 3. Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_connections ENABLE ROW LEVEL SECURITY;

-- 4. Public read/write policies (for development — tighten before production)
CREATE POLICY "Allow public read on leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on leads" ON leads FOR DELETE USING (true);

CREATE POLICY "Allow public read on source_connections" ON source_connections FOR SELECT USING (true);
CREATE POLICY "Allow public insert on source_connections" ON source_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on source_connections" ON source_connections FOR UPDATE USING (true);

-- 5. Seed source connections
INSERT INTO source_connections (name, status, status_color, mode, last_lead) VALUES
  ('Meta Ads', 'Connected', 'ok', 'Real-time webhook', '2m'),
  ('Website forms', 'Connected', 'ok', 'Webhook', '26m'),
  ('WhatsApp (WATI)', 'Connected', 'ok', 'API', '11m'),
  ('Google / YouTube', 'Not connected', 'neu', '—', '—'),
  ('Walk-in / Referral / Telecalling', 'Manual', 'info', 'Reception / advisor form', '38m')
ON CONFLICT (name) DO NOTHING;

-- 6. Seed sample leads (June 2026 — today's date is June 19)
-- Today leads
INSERT INTO leads (name, source, lead_date, is_valid, is_duplicate, is_assigned) VALUES
  ('A. Kumar', 'Meta Ads', '2026-06-19', true, false, true),
  ('R. Suresh', 'Meta Ads', '2026-06-19', true, false, true),
  ('M. Vel', 'Meta Ads', '2026-06-19', true, false, false),
  ('K. Anu', 'Meta Ads', '2026-06-19', true, true, true),
  ('S. Devi', 'Meta Ads', '2026-06-19', false, false, true),
  ('V. Prasad', 'Website forms', '2026-06-19', true, false, true),
  ('L. Priya', 'WhatsApp (WATI)', '2026-06-19', true, false, false),
  ('D. Kumar', 'Walk-in / Referral / Telecalling', '2026-06-19', true, false, true);

-- Earlier June leads
INSERT INTO leads (name, source, lead_date, is_valid, is_duplicate, is_assigned) VALUES
  ('P. Ravi', 'Meta Ads', '2026-06-15', true, false, true),
  ('N. Singh', 'Meta Ads', '2026-06-14', true, false, true),
  ('G. Patel', 'Meta Ads', '2026-06-12', true, true, false),
  ('H. Khan', 'Website forms', '2026-06-10', true, false, true),
  ('B. Sharma', 'WhatsApp (WATI)', '2026-06-08', true, false, true),
  ('T. Reddy', 'Meta Ads', '2026-06-05', false, false, true),
  ('C. Nair', 'Meta Ads', '2026-06-03', true, false, false),
  ('J. Pillai', 'Walk-in / Referral / Telecalling', '2026-06-01', true, false, true);

-- May 2026 leads
INSERT INTO leads (name, source, lead_date, is_valid, is_duplicate, is_assigned) VALUES
  ('E. Das', 'Meta Ads', '2026-05-28', true, false, true),
  ('O. Rao', 'Meta Ads', '2026-05-22', true, false, true),
  ('A. Kumar', 'Website forms', '2026-05-18', true, true, false),
  ('R. Suresh', 'WhatsApp (WATI)', '2026-05-12', true, false, true),
  ('M. Vel', 'Meta Ads', '2026-05-05', true, false, true),
  ('K. Anu', 'Walk-in / Referral / Telecalling', '2026-05-01', false, false, false);

-- April 2026 leads
INSERT INTO leads (name, source, lead_date, is_valid, is_duplicate, is_assigned) VALUES
  ('S. Devi', 'Meta Ads', '2026-04-25', true, false, true),
  ('V. Prasad', 'Meta Ads', '2026-04-18', true, false, true),
  ('L. Priya', 'Website forms', '2026-04-10', true, false, false),
  ('D. Kumar', 'WhatsApp (WATI)', '2026-04-05', true, true, true),
  ('P. Ravi', 'Meta Ads', '2026-04-01', true, false, true);

-- 7. META TOKEN MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS meta_tokens (
  id SERIAL PRIMARY KEY,
  token_type TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on meta_tokens" ON meta_tokens FOR SELECT USING (true);
CREATE POLICY "Allow public insert on meta_tokens" ON meta_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on meta_tokens" ON meta_tokens FOR UPDATE USING (true);

-- 8. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(lead_date);
CREATE INDEX IF NOT EXISTS idx_leads_source_date ON leads(source, lead_date);
