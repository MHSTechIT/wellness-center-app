-- ============================================================
-- Physiotherapy pricing master.
--
-- Replaces the HARDCODED pricing card on the Physiotherapy page (template.ts) and the static
-- Physiotherapy inputs on Settings → Service pricing — both were mockups labeled "from Settings"
-- while nothing actually read from Settings. Same pattern as bt_tests (the Blood Test master):
-- one row per price item, editable from Settings without a deploy.
--
--   sessions = how many sessions the item covers (0 = consultation / not session-based,
--              1 = per-session rate, 6/8/12 = packs). The Physio page uses it to pre-fill the
--              pack price when a treatment plan's "sessions planned" matches a pack.
-- ============================================================

CREATE TABLE IF NOT EXISTS physio_pricing (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL UNIQUE,
  sessions   INT  NOT NULL DEFAULT 0,
  price      INT  NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort       INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with the exact values the old hardcoded card displayed, so nothing changes visually
-- until someone edits them in Settings.
INSERT INTO physio_pricing (label, sessions, price, sort) VALUES
  ('Consultation',     0,   500, 10),
  ('Per session',      1,   800, 20),
  ('6-session pack',   6,  4200, 30),
  ('8-session pack',   8,  6400, 40),
  ('12-session pack', 12, 10800, 50)
ON CONFLICT (label) DO NOTHING;
