-- ============================================================
-- WellnessOS — Backfill missing leads.enrolled_at for already-paid leads
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- Root cause (2026-07-27 investigation, triggered by Dinesh Iyer
-- /1073279318552471/ showing "not enrolled" on the Advisor page while
-- Health Coach and Reception both showed him correctly enrolled):
--
-- leads.enrolled_at is the CANONICAL field the Advisor page trusts to decide
-- whether a lead is enrolled. It was only ever written by a handful of
-- specific code paths (a payment-status DROPDOWN's onchange handler on the
-- Coach page; one specific Reception "settle a coach request" branch) —
-- every OTHER payment-collection path (Coach's main Save button, Reception's
-- direct installment/due-balance/one-shot collects) inserted a real 'paid'
-- row into `payments` but never stamped leads.enrolled_at. Health Coach and
-- Reception's own "Enrolled" displays read LIVE from the payments table, so
-- they always looked correct and masked the gap — only Advisor, which trusts
-- enrolled_at alone, went stale. Fixed in code (client/src/client/app.ts —
-- every payment-collection path now calls the shared _enrollLeadShared
-- writer directly), but that only prevents FUTURE occurrences. This
-- migration repairs the leads it already happened to.
--
-- Scope: leads with a real paid payment (amount > 0) but enrolled_at still
-- NULL. Excludes zero-amount 'paid' rows (found one: a walk-in dev/test
-- artifact, lead_id walkin-1783074148151-961542, amount=0) — no real money
-- changed hands there, so it should not be auto-enrolled.
--
-- enrolled_at is set to the EARLIEST paid_at across that lead's paid rows
-- (the actual historical moment they enrolled), not "now" — matching
-- _enrollLeadShared's own "stamp once, stay stable" rule. NULL program is
-- treated as L1 (the documented majority convention — see
-- migration-backfill-null-program.sql).
--
-- Verified against live data before writing this file: 13 leads qualify
-- (2026-07-01 through 2026-07-25), including Dinesh Iyer. Idempotent — the
-- WHERE enrolled_at IS NULL guard means re-running it is a no-op once applied.
-- Review before running.
-- ============================================================

UPDATE leads l
SET enrolled_at = sub.earliest_paid_at,
    call_status = 'Enrolled'
FROM (
  SELECT p.lead_id, MIN(p.paid_at) AS earliest_paid_at
  FROM payments p
  WHERE p.status = 'paid' AND p.amount > 0
  GROUP BY p.lead_id
) sub
WHERE l.meta_lead_id = sub.lead_id
  AND l.enrolled_at IS NULL;
