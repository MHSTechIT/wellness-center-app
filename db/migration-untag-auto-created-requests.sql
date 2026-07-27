-- ============================================================
-- WellnessOS — Un-publish auto-created installment-2 Reception requests
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- Root cause (confirmed 2026-07-27): before commit 2b546eb (2026-07-24 13:15),
-- sendToReception() tagged its installment-2 BOOKKEEPING companion row with the
-- Reception-side `who` value ("Reception desk") instead of "Health Coach". So a
-- single "Send collection request to Reception" click for installment 1 ALSO
-- published an installment-2 request into Reception's Collect queue — one the
-- coach never sent. Reported as "L2 - 2nd Installment appears on Reception
-- without clicking Send" (Thirumalai, then confirmed across all leads).
--
-- Proof: each affected installment-2 row was created in the SAME database
-- operation as its installment-1 row — creation gaps of 54ms to 526ms. Two rows,
-- one click. Verified against live data; 9 rows qualify, all created 2026-07-20
-- to 2026-07-22 (i.e. all pre-fix). The 2 post-fix rows (Thirumalai id=247,
-- barath id=248, created 2026-07-25) have creation gaps of ~22h/36s AND matching
-- audit entries, so they are genuine explicit sends and are NOT touched here.
--
-- REPAIR = RE-TAG, NOT DELETE. These rows represent REAL outstanding balances
-- (the client genuinely still owes installment 2) — deleting them would destroy
-- balance/outstanding tracking and understate what is owed. Re-tagging them to
-- "Health Coach" restores exactly what the FIXED code would have written: a
-- hidden coach-side bookkeeping row. The balance stays tracked; it simply stops
-- appearing in Reception's Collect queue until someone explicitly clicks "Send
-- collection request to Reception" (which re-tags it via sendToReception).
--
-- due_date is also cleared: that auto "+30 days" date was likewise persisted
-- without an explicit send (it drives the Accounts auto-reminders). Matches the
-- companion code fix in _persistInstallments, which no longer writes due_date.
--
-- Idempotent — re-running is a no-op once the rows are tagged "Health Coach".
-- Guarded by the <10s same-click signature so it can only ever match rows
-- created by this specific bug. Review before running.
-- ============================================================

UPDATE payments d
SET collected_by = 'Health Coach',
    due_date = NULL
FROM payments i1
WHERE i1.lead_id = d.lead_id
  AND i1.payment_type = 'installment'
  AND i1.installment_number = 1
  AND COALESCE(i1.program, '') = COALESCE(d.program, '')
  AND d.status = 'due'
  AND d.payment_type = 'installment'
  AND d.installment_number = 2
  AND d.collected_by IN ('Reception desk', 'POS Machine', 'Razorpay link (online)')
  AND ABS(EXTRACT(EPOCH FROM (d.created_at - i1.created_at))) < 10;
