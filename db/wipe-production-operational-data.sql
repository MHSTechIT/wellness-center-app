-- ============================================================================
-- WIPE OPERATIONAL DATA — Wellness_Center_App (PRODUCTION)
-- Requested 6 Aug 2026: keep ONLY Lead-import data; remove all other page data.
--
-- RUN THIS ON:  Wellness_Center_App          (NOT Wellness_center_dev)
-- BACKUP TAKEN: db/backup-prod-2026-08-06-pre-wipe.backup (681 KB, full DB)
--
-- KEEPS (untouched):
--   leads, csv_leads, csv_import_batches            <- Lead import page
--   app_users, app_settings, assignees              <- logins & staff
--   bt_tests, bt_lab_partners, bt_coupons           <- masters
--   physio_pricing, org_roles, org_services,
--   org_role_services, source_connections           <- masters / config
--   meta_tokens, meta_sync_state                    <- Meta sync (prune protection)
--
-- DELETES (every row):
--   payments            215 rows  (Rs 17,39,670 paid + Rs 7,13,999 due history)
--   appointments        177 rows  (all bookings & visits)
--   lead_activity     1,789 rows
--   lead_assignments    167 rows
--   call_recordings      73 rows
--   office_recordings    58 rows
--   zoom_recordings      14 rows
--   bt_orders             2 rows
--
-- NOTE: leads keep their enrolled_at / visited_at / call_status stamps, so
-- Advisor statuses survive, but Coach visited-book, Accounts, instalment
-- tracking and all payment history start from zero.
--
-- TO RESTORE EVERYTHING (if regretted):
--   pg_restore -h 13.202.225.50 -U postgres --clean -d Wellness_Center_App \
--     "db/backup-prod-2026-08-06-pre-wipe.backup"
-- ============================================================================

BEGIN;

-- safety: abort instantly if this is somehow not production
DO $$ BEGIN
  IF current_database() <> 'Wellness_Center_App' THEN
    RAISE EXCEPTION 'Wrong database: % — run this on Wellness_Center_App only', current_database();
  END IF;
END $$;

DELETE FROM payments;
DELETE FROM appointments;
DELETE FROM lead_activity;
DELETE FROM lead_assignments;
DELETE FROM call_recordings;
DELETE FROM office_recordings;
DELETE FROM zoom_recordings;
DELETE FROM bt_orders;

COMMIT;

-- verify: every wiped table should read 0, keeps should be non-zero
SELECT 'payments' t, count(*) FROM payments
UNION ALL SELECT 'appointments', count(*) FROM appointments
UNION ALL SELECT 'lead_activity', count(*) FROM lead_activity
UNION ALL SELECT 'lead_assignments', count(*) FROM lead_assignments
UNION ALL SELECT 'call_recordings', count(*) FROM call_recordings
UNION ALL SELECT 'office_recordings', count(*) FROM office_recordings
UNION ALL SELECT 'zoom_recordings', count(*) FROM zoom_recordings
UNION ALL SELECT 'bt_orders', count(*) FROM bt_orders
UNION ALL SELECT 'leads (kept)', count(*) FROM leads
UNION ALL SELECT 'csv_leads (kept)', count(*) FROM csv_leads
UNION ALL SELECT 'app_users (kept)', count(*) FROM app_users;
