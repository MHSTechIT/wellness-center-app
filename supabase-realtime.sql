-- ============================================================
-- WellnessOS — enable Realtime on the leads table
-- Run in Supabase SQL Editor. Lets the app receive INSERT/UPDATE/DELETE
-- events instantly so new leads appear in the Live Incoming Feed with no refresh.
-- ============================================================

-- Add the table to Supabase's realtime publication (safe to run once).
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Ensure full row data is sent on UPDATE/DELETE events (needed for matching by meta_lead_id).
ALTER TABLE leads REPLICA IDENTITY FULL;
