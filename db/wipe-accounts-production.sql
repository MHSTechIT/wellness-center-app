-- ============================================================================
-- WIPE ACCOUNTS PAGE DATA — Wellness_Center_App (PRODUCTION)
-- Requested 8 Aug 2026.
--
-- RUN THIS ON:  Wellness_Center_App          (NOT Wellness_center_dev)
-- HOW:          pgAdmin → Wellness_Center_App → Query Tool → paste → Execute (F5)
--
-- ---------------------------------------------------------------------------
-- SCOPE: the `payments` table, and nothing else.
--
-- The Accounts page reads ONLY payments. It joins appointments + leads purely
-- to show a client's name and service — it owns no rows in those tables — so
-- clearing Accounts means clearing payments. Appointments, check-ins, leads,
-- users and every master table are left untouched.
--
-- All 4 Accounts tabs are fed by this one table and all 4 go empty:
--   Transactions · Verification · Outstanding · Refunds
-- The Thyrocare tab is a VIEW over blood-test appointments, so it keeps its
-- rows but shows no money against them.
--
-- ---------------------------------------------------------------------------
-- WHAT IS THERE RIGHT NOW (read 8 Aug 2026) — 9 rows:
--
--   id   service     amount  status  method  type          date
--   371  Diabetes    15,000  paid    upi     installment 1  05 Aug
--   372  Diabetes    15,000  due     —       installment 2  05 Aug
--   373  Blood test     800  paid    upi     full           05 Aug
--   375  Diabetes     5,000  paid    Cash    advance        05 Aug
--   376  Physio         350  paid    upi     full           05 Aug
--   377  Blood test     600  paid    upi     full  (VERIFIED) 05 Aug
--   378  Diabetes    15,000  paid    upi     installment 1  05 Aug
--   379  Diabetes    15,000  due     —       installment 2  05 Aug
--   380  Blood test     600  paid    upi     full           06 Aug
--
--   Paid Rs 37,350 · Due Rs 30,000 · 1 verified · 0 refunds
--
-- ---------------------------------------------------------------------------
-- KNOCK-ON EFFECTS — read before running. This is NOT confined to one page:
--
--   * Admin Report      revenue / collected / avg-ticket all drop to zero
--   * Health Coach      instalment-1 and instalment-2 cards go to zero
--   * Reception         collect-payment history disappears; the two open
--                       instalment-2 dues (Rs 30,000) stop being chased
--   * Blood Test        Total Billed goes to zero
--
--   * ENROLLMENT SURVIVES. 3 leads carry an enrolled_at stamp. That stamp is
--     canonical, so those leads keep showing "Enrolled" on Advisor / Coach /
--     Reception while having no payment behind them. If you want them reset
--     too, un-comment STEP 4 at the bottom — otherwise leave it alone.
--
-- ---------------------------------------------------------------------------
-- BACKUP FIRST. The existing db/backup-prod-2026-08-06-pre-wipe.backup is
-- OLDER than some of these rows and will NOT bring them back. Take a fresh one
-- from a terminal before you run this:
--
--   pg_dump -h 13.202.225.50 -U postgres -Fc -t payments \
--     -d Wellness_Center_App -f db/backup-payments-2026-08-08.backup
--
--   restore with:
--   pg_restore -h 13.202.225.50 -U postgres --data-only \
--     -d Wellness_Center_App db/backup-payments-2026-08-08.backup
-- ============================================================================

BEGIN;

-- STEP 1 — safety. Aborts instantly if this is not production, so the script
-- cannot fire against Wellness_center_dev by an open-in-the-wrong-tab mistake.
DO $$ BEGIN
  IF current_database() <> 'Wellness_Center_App' THEN
    RAISE EXCEPTION 'Wrong database: % — run this on Wellness_Center_App only', current_database();
  END IF;
END $$;

-- STEP 2 — before picture. Note these numbers; step 3 must reconcile to them.
SELECT 'BEFORE' AS stage,
       count(*)                                                   AS payment_rows,
       coalesce(sum(amount) FILTER (WHERE status = 'paid'), 0)     AS paid_total,
       coalesce(sum(amount) FILTER (WHERE status <> 'paid'), 0)    AS due_total,
       count(*) FILTER (WHERE verified)                            AS verified_rows,
       count(*) FILTER (WHERE refund_status IS NOT NULL)           AS refund_rows
FROM payments;

-- STEP 3 — the wipe. DELETE (not TRUNCATE) so it stays inside this transaction
-- and a ROLLBACK genuinely undoes it.
DELETE FROM payments;

-- STEP 4 (OPTIONAL — leave commented unless you also want enrolment cleared).
-- Without this, 3 leads keep reading "Enrolled" with no payment behind them.
-- Un-comment ALL THREE lines together if you want those leads reset to
-- not-enrolled everywhere (Advisor, Coach, Reception, dashboards).
--
-- UPDATE leads
--    SET enrolled_at = NULL
--  WHERE enrolled_at IS NOT NULL;

-- STEP 5 — verify. Every number must be 0. If anything is non-zero, or the
-- row count in step 2 was not what you expected, type ROLLBACK; and stop.
SELECT 'AFTER' AS stage,
       count(*)                                          AS payment_rows,
       coalesce(sum(amount), 0)                          AS any_money_left,
       count(*) FILTER (WHERE refund_status IS NOT NULL) AS refund_rows
FROM payments;

-- Confirms the wipe stayed in its lane — these must be UNCHANGED, not zero.
SELECT 'UNTOUCHED' AS stage,
       (SELECT count(*) FROM leads)        AS leads,
       (SELECT count(*) FROM appointments) AS appointments,
       (SELECT count(*) FROM app_users)    AS users;

-- STEP 6 — commit. Nothing above is permanent until this runs.
-- Happy with the AFTER numbers?  COMMIT;
-- Anything looks wrong?           ROLLBACK;
COMMIT;
