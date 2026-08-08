-- ============================================================================
-- Manual "Confirmed" milestone on a lead.
--
-- The advisor's Visited-status row is a journey: Open → Confirm → Visited.
-- Visited is automatic (Reception's check-in stamps leads.visited_at) and Enrolled is automatic
-- (the coach stamps leads.enrolled_at). Confirm is the odd one out: it is set BY HAND, when the
-- advisor has actually confirmed the appointment with the client. Deriving it from the call status
-- guessed at that, so it gets its own stamp — same shape as visited_at / enrolled_at, so every
-- milestone on this table reads the same way.
--
-- NULL  = not confirmed (the dashboard's Confirmed card counts only non-NULL).
-- Safe to run more than once. Nothing back-fills: no existing lead is retroactively "confirmed",
-- because nobody has clicked the button yet.
-- ============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- The Confirmed dashboard card and its drill-down filter on "is this set", so an index pays for
-- itself the moment the advisor book grows.
CREATE INDEX IF NOT EXISTS idx_leads_confirmed_at ON leads(confirmed_at) WHERE confirmed_at IS NOT NULL;
