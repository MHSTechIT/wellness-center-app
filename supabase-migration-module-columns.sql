-- Migration: Add columns for Blood Test, Physiotherapy, and Accounts modules
-- Run this in Supabase SQL Editor to enable these modules with live data.

-- ========== APPOINTMENTS: module-specific JSONB data ==========

-- Blood test data: sample status, panel, report URL, share status, thyrocare cost
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS blood_test_data JSONB;
-- Example: {"panel":"HbA1c · FBS","sample_status":"collected","sample_at":"...","report_status":"pending","report_url":"","shared":false,"shared_at":"","thyrocare_cost":400,"our_price":800}

-- Screening vitals captured at the screening desk
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS screening_vitals_data JSONB;

-- Physio data: SOAP notes, pain level, treatment plan, session history
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS physio_data JSONB;
-- Example: {"condition":"Frozen shoulder","sessions_planned":10,"payment_model":"pack","pack_price":8000,"soap":{"subjective":"...","objective":"...","assessment":"...","plan":"..."},"pain_level":4,"rom_improvement":"","exercises":"","next_session":"2026-07-05"}

-- ========== PAYMENTS: verification + refund columns ==========

-- Verification workflow
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Refund workflow
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_status TEXT;
-- Values: null (no refund), 'requested', 'abm_approved', 'bm_approved', 'processed'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount INT DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ;

-- Payment type tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'full';
-- Values: 'full', 'installment', 'emi', 'per_visit', 'pack'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_number INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_installments INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS emi_provider TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS emi_subvention INT DEFAULT 0;

-- Service tracking on payment
ALTER TABLE payments ADD COLUMN IF NOT EXISTS service TEXT;

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_payments_verified ON payments (verified);
CREATE INDEX IF NOT EXISTS idx_payments_refund_status ON payments (refund_status) WHERE refund_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_service ON payments (service) WHERE service IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_blood_test ON appointments ((blood_test_data IS NOT NULL)) WHERE blood_test_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_physio ON appointments ((physio_data IS NOT NULL)) WHERE physio_data IS NOT NULL;
