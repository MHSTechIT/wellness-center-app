-- ============================================================
-- WellnessOS — Call/lead status for the Health Advisor dashboard
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Drives the Health Advisor KPI cards (Open, Sales, Health, Payment,
-- Enrolled, Follow-up, Closed) and call-status filters.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_status TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_call_status ON leads(call_status);
