import { pool } from '../shared/db';

// ============================================================
// AUTO-ASSIGNMENT — daily lead allocation per advisor
//
// The admin sets a DAILY TARGET per advisor in Settings → Advisor targets → Advisor Leads Count
// Setting. This distributes pooled leads against those targets, and is safe to run as often as you
// like: it works out what is still owed each time rather than remembering anything between runs.
//
// WHY IT IS SAFE TO RE-RUN. Nothing here stores "how many were assigned today". That number is
// derived from leads.assigned_at every run, so:
//   · the daily reset needs no cron — a new IST day simply matches no rows;
//   · a lead reassigned or deleted by hand is reflected immediately, where a stored counter would
//     have drifted from reality and quietly starved or over-fed an advisor;
//   · two runs racing each other cannot double-assign, because the second run sees the first run's
//     writes and recomputes the remaining headroom from them.
//
// THE DAY IS AN IST DAY. appt/assignment dates in this app are Chennai days, and a naive
// assigned_at::date would roll over at 05:30 IST — so leads assigned late in the evening would be
// counted against tomorrow's allocation. Every date expression below is explicitly AT TIME ZONE.
// ============================================================

export type AssignPlanRow = { service: string; advisor: string; pct: number; already: number; assigned: number; expected: number };
export type AllocMember = { advisor: string; pct: number };

// A lead's service, reduced to the key its team is stored under. Two jobs:
//  · a COMBINED service ("Diabetes Counselling + Blood Test") is served by the FIRST line named,
//    decided 28-Aug-2026 — the string is written in the order it was captured, so the first is the
//    line the lead actually came in for.
//  · the same line written differently ("Blood test" / "Blood Test", "Physio" / "Physiotherapy")
//    collapses onto one key, so a team configured once serves every spelling of its own service.
// Anything unrecognised keeps its own trimmed, lowercased name rather than being forced into a
// bucket it does not belong to — it simply falls through to the default team.
export function serviceTeamKey(raw: string): string {
  const first = String(raw || '').split('+')[0];
  const x = first.trim().toLowerCase();
  if (!x) return '';
  if (x.includes('weight') || x.includes('wt loss')) return 'weight loss counselling';
  if (x.includes('diab') || x.includes('sugar')) return 'diabetes counselling';
  if (x.includes('sauna') || x.includes('sona')) return 'sauna bath';
  if (x.includes('cold') || x.includes('plunge')) return 'cold plunge';
  if (x.includes('phys')) return 'physiotherapy';
  if (x.includes('blood') || x.includes('diagnost')) return 'blood test';
  if (x.includes('hbot') || x.includes('hyperbaric') || x.includes('oxygen')) return 'hbot';
  return x;
}

// LARGEST DEFICIT, one lead at a time. For each arriving lead the advisor furthest BELOW their
// share of the day so far gets it — the standard apportionment answer to "the total keeps growing
// and the ratio must hold at every point", and the reason this needs no daily total to work from.
//
// It self-corrects: whoever the rounding shorted on one lead is the most deficient on the next, so
// nobody accumulates a deficit. At any moment each advisor's count sits within one lead of their
// exact quota, whether the day ends at 25 leads or 500.
//
// `already` seeds the counts with what each advisor was given earlier today (auto or by hand), so
// the ratio is measured across the WHOLE day rather than restarting at every sync.
export function distributeByPercent(
  members: AllocMember[],
  already: Record<string, number>,
  queue: string[],
): { perAdvisor: Map<string, string[]>; counts: Record<string, number> } {
  const perAdvisor = new Map<string, string[]>();
  const live = members.filter((m) => m.pct > 0);
  const counts: Record<string, number> = {};
  for (const m of live) counts[m.advisor] = Number(already[m.advisor] || 0);
  const totalPct = live.reduce((a, m) => a + m.pct, 0);
  if (!live.length || totalPct <= 0 || !queue.length) return { perAdvisor, counts };
  // Sorted once, so ties resolve the same way on every run: larger share first, then by name.
  const ordered = live.slice().sort((a, b) => (b.pct - a.pct) || a.advisor.localeCompare(b.advisor));
  let n = Object.values(counts).reduce((a, b) => a + b, 0);
  for (const id of queue) {
    n += 1;
    let best = ordered[0];
    let bestDeficit = -Infinity;
    for (const m of ordered) {
      const deficit = (m.pct / totalPct) * n - counts[m.advisor];
      if (deficit > bestDeficit + 1e-9) { bestDeficit = deficit; best = m; }
    }
    counts[best.advisor] += 1;
    const arr = perAdvisor.get(best.advisor) || [];
    arr.push(id);
    perAdvisor.set(best.advisor, arr);
  }
  return { perAdvisor, counts };
}
export type AssignResult = {
  ok: boolean;
  assigned: number;
  poolSeen: number;
  poolLeft: number;
  rows: AssignPlanRow[];
  /** Leads whose service matched no team and had no default to fall back on — left pooled. */
  unrouted?: number;
  /** How many of today's leads each team was handed, for the preview. */
  teams?: { service: string; leads: number }[];
  rotation?: { order: string[]; chunks: number[]; lastServed: string | null; nextStart: string | null };
  reason?: string;
};

// ---------- Round-robin batch distribution (requested 21-Aug-2026) ----------
// Leads are dealt in TURNS around the ring of advisors with a target, not by filling one advisor's
// whole day first. Each advisor's turn size scales with their target — the day split into roughly
// four waves — so the worked example (targets 8 / 7 / 5) deals 2 / 2 / 1 per lap:
// The round-robin distributor that stood here (turnSizeOf / distributeRoundRobin) is gone with
// the fixed daily target it served: turns sized as a quarter of a NUMBER have no meaning once
// allocation is a ratio. distributeByPercent above replaces it.

// The rotation pointer (app_settings 'auto_assign_rotation') belonged to the round-robin ring:
// it remembered whose turn was next so the same advisor did not always receive the first leads
// of the day. Ratio allocation needs no such memory — the largest-deficit rule reads the day's
// counts and is self-correcting from any starting point — so nothing reads or writes it now.
// The stored row is left untouched rather than deleted, as the rollback path to the old engine.

export async function listAdvisors(): Promise<{ name: string; role: string }[]> {
  const { rows } = await pool.query(
    `SELECT a.name,
            coalesce(
              (SELECT string_agg(r.role, ' · ' ORDER BY r.role)
                 FROM jsonb_array_elements_text(u.roles) AS r(role)),
              a.role, '') AS role
       FROM assignees a
       LEFT JOIN app_users u ON lower(btrim(u.email)) = lower(btrim(a.email))
      WHERE a.is_active
        AND a.name IS NOT NULL AND btrim(a.name) <> ''
        AND EXISTS (
          SELECT 1
            FROM jsonb_array_elements_text(
                   coalesce(u.roles, to_jsonb(ARRAY[coalesce(a.role, '')]))
                 ) AS r(role)
            JOIN org_roles o ON lower(btrim(o.name)) = lower(btrim(r.role))
           WHERE o.is_assignable
             AND (lower(btrim(r.role)) IN ('advisor', 'senior advisor')
                  OR lower(btrim(r.role)) ~ '^tele ?caller')
        )
      ORDER BY a.name`
  );
  return rows.map((r: any) => ({ name: String(r.name).trim(), role: String(r.role || '') }));
}

/**
 * Work out — and optionally perform — today's allocation.
 *
 * `dryRun` returns the identical plan without writing, which is what the settings screen previews
 * and what the tests assert against.
 */
/**
 * Is auto-assignment switched on for today?
 *
 * The most recent row dated on or BEFORE today wins, so a setting persists forward until something
 * later changes it, and a row dated tomorrow cannot switch today on or off by accident. With no rows
 * at all it is ON — that was the behaviour before this control existed, and defaulting to OFF would
 * have silently stopped a working system the moment this shipped.
 */
export async function isAutoAssignOn(): Promise<{ on: boolean; day: string | null; by: string | null }> {
  try {
    const { rows } = await pool.query(
      `SELECT to_char(day,'YYYY-MM-DD') AS day, enabled, updated_by
         FROM auto_assign_control
        WHERE day <= (now() AT TIME ZONE 'Asia/Kolkata')::date
        ORDER BY day DESC LIMIT 1`
    );
    if (!rows.length) return { on: true, day: null, by: null };
    return { on: !!rows[0].enabled, day: rows[0].day, by: rows[0].updated_by || null };
  } catch {
    // The table not existing yet must not switch assignment off — same reasoning as the default.
    return { on: true, day: null, by: null };
  }
}

export async function runAutoAssign(opts: { dryRun?: boolean; by?: string; force?: boolean } = {}): Promise<AssignResult> {
  const dryRun = !!opts.dryRun;
  const by = opts.by || 'auto-assign';

  // The switch is checked FIRST, before any query does work. `force` exists only for the settings
  // screen's own "assign now" button — an explicit human action, which the toggle is not meant to
  // veto; the toggle governs the AUTOMATIC path.
  if (!opts.force) {
    const sw = await isAutoAssignOn();
    if (!sw.on) {
      return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: [],
        reason: 'auto-assignment is switched OFF' + (sw.day ? ' (set ' + sw.day + (sw.by ? ' by ' + sw.by : '') + ')' : '') };
    }
  }

  // 1 — ALLOCATION. Percentages per service team (advisor_alloc), not a fixed count: Meta
  //     delivers an unpredictable number of leads through the day, so a per-advisor NUMBER can only
  //     ever be a guess about a total nobody knows yet, while a RATIO holds whatever the day brings.
  //     Only a POSITIVE percentage opts an advisor in, and the advisor must still be active staff —
  //     EXISTS rather than a join, and matched case-sensitively, for the same reasons the fixed
  //     targets did: "Deepak" and "deepak" are two different people here with two different books.
  const { rows: allocRows } = await pool.query(
    `SELECT a.service, a.advisor, a.pct
       FROM advisor_alloc a
      WHERE a.pct > 0
        AND EXISTS (SELECT 1 FROM assignees s
                     WHERE s.is_active AND btrim(s.name) = btrim(a.advisor))
      ORDER BY a.service, a.advisor`
  );
  if (!allocRows.length) {
    return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: [], reason: 'no advisor allocation configured' };
  }
  // Teams keyed by NORMALISED service, so a team saved as "Blood Test" still serves leads whose
  // service reads "Blood test". '' is the default team every unmatched service falls back to.
  const teams = new Map<string, AllocMember[]>();
  for (const r of allocRows) {
    const key = serviceTeamKey(String(r.service || ''));
    const arr = teams.get(key) || [];
    arr.push({ advisor: String(r.advisor), pct: Number(r.pct) || 0 });
    teams.set(key, arr);
  }
  // Which team serves a given lead: its own service's team where one exists, otherwise the default.
  const teamFor = (service: string): string | null => {
    const k = serviceTeamKey(service);
    if (teams.has(k)) return k;
    return teams.has('') ? '' : null;
  };

  // 2 — ELIGIBLE LEADS. Anything unassigned that arrived TODAY (IST). Unchanged in spirit from the
  //     fixed-target engine, and deliberately still TODAY ONLY: the backlog in this database is
  //     thousands of unassigned leads and the brief has always been that yesterday's stay put.
  //
  //     THE LIMIT IS GONE. It used to be the sum of everyone's headroom, which is what made a
  //     target a hard ceiling; with ratio allocation there is no ceiling to enforce (decided
  //     28-Aug-2026), so every lead that arrives today is placed and nothing is left pooled merely
  //     because somebody hit a number.
  const { rows: leadRows } = await pool.query(
    `SELECT meta_lead_id, coalesce(service,'') AS service
       FROM leads
      WHERE coalesce(is_assigned,false) = false
        AND coalesce(btrim(assigned_to),'') = ''
        AND (coalesce(created_at, pool_added_at) AT TIME ZONE 'Asia/Kolkata')::date
            = (now() AT TIME ZONE 'Asia/Kolkata')::date
      ORDER BY coalesce(pool_added_at, created_at) ASC NULLS LAST`
  );
  const poolSeen = leadRows.length;
  if (!poolSeen) {
    return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: [], reason: "no unassigned leads from today — older leads are left alone by design" };
  }

  // 3 — WHAT EACH ADVISOR ALREADY HOLDS TODAY, per team. Counted across every lead assigned today,
  //     not just auto-assigned ones: a lead the admin places by hand is still part of that advisor's
  //     day, so it has to pull their share down or the two paths would fight each other. Bucketed by
  //     TEAM because an advisor can sit on more than one, and each team's ratio stands on its own.
  const { rows: todayRows } = await pool.query(
    `SELECT assigned_to AS advisor, coalesce(service,'') AS service
       FROM leads
      WHERE is_assigned
        AND assigned_at IS NOT NULL
        AND (assigned_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date`
  );
  const already = new Map<string, Record<string, number>>();
  for (const r of todayRows) {
    const t = teamFor(String(r.service || ''));
    if (t === null) continue;
    const m = already.get(t) || {};
    const name = String(r.advisor || '').trim();
    if (!name) continue;
    m[name] = (m[name] || 0) + 1;
    already.set(t, m);
  }

  // 4 — SPLIT BY RATIO, team by team. Leads keep their arrival order within a team so the earliest
  //     lead is still placed first.
  const byTeam = new Map<string, string[]>();
  let unrouted = 0;
  for (const r of leadRows) {
    const t = teamFor(String(r.service || ''));
    if (t === null) { unrouted++; continue; }   // no team for this service and no default — stays pooled
    const arr = byTeam.get(t) || [];
    arr.push(String(r.meta_lead_id));
    byTeam.set(t, arr);
  }
  const writeMap = new Map<string, string[]>();
  const plan: AssignPlanRow[] = [];
  let assigned = 0;
  for (const [teamKey, queue] of byTeam) {
    const members = teams.get(teamKey) || [];
    const startCounts = already.get(teamKey) || {};
    const d = distributeByPercent(members, startCounts, queue);
    for (const [advisor, ids] of d.perAdvisor) {
      const cur = writeMap.get(advisor) || [];
      cur.push(...ids);
      writeMap.set(advisor, cur);
      assigned += ids.length;
    }
    const totalPct = members.reduce((a, m) => a + m.pct, 0) || 1;
    const finalN = Object.values(d.counts).reduce((a, b) => a + b, 0);
    for (const m of members) {
      plan.push({
        service: teamKey,
        advisor: m.advisor,
        pct: m.pct,
        already: Number(startCounts[m.advisor] || 0),
        assigned: (d.perAdvisor.get(m.advisor) || []).length,
        // What a perfect split of the day so far would have given them — the number the actual
        // count is meant to sit within one of.
        expected: Math.round((m.pct / totalPct) * finalN * 100) / 100,
      });
    }
  }
  const writes = Array.from(writeMap, ([advisor, ids]) => ({ advisor, ids }));

  if (dryRun) {
    // The preview runs the identical split and writes nothing.
    return { ok: true, assigned, poolSeen, poolLeft: Math.max(0, poolSeen - assigned), rows: plan,
      unrouted, teams: Array.from(byTeam, ([k, v]) => ({ service: k, leads: v.length })) };
  }

  // 5 — write. One statement per advisor, each re-checking that the lead is still unassigned, so a
  //     lead the admin grabbed manually between the read above and this write is left alone rather
  //     than being yanked out from under them.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const wgroup of writes) {
      await client.query(
        `UPDATE leads
            SET assigned_to = $1, is_assigned = true, in_pool = false, assigned_at = now()
          WHERE meta_lead_id = ANY($2)
            AND coalesce(is_assigned,false) = false
            AND coalesce(btrim(assigned_to),'') = ''`,
        [wgroup.advisor, wgroup.ids]
      );
      // Same audit trail the manual path writes, so an auto-assigned lead is not a blank in the
      // history. Best-effort: a missing table must never roll back the assignment itself.
      try {
        // Columns match the manual path's own history rows (advisor / assigned_by / status), and the
        // lead's details are read back from `leads` so the history is as complete as a hand-assigned
        // one rather than a bare id.
        await client.query(
          `INSERT INTO lead_assignments (lead_id, lead_name, lead_phone, source, service, advisor, assigned_by, status, created_at)
           SELECT l.meta_lead_id, l.name, l.phone, l.source, l.service, $2, $3, 'assigned', now()
             FROM leads l WHERE l.meta_lead_id = ANY($1)`,
          [wgroup.ids, wgroup.advisor, by]
        );
      } catch { /* history is optional; the assignment is not */ }
    }
    await client.query('COMMIT');
  } catch (e: any) {
    try { await client.query('ROLLBACK'); } catch { /* nothing to undo */ }
    return { ok: false, assigned: 0, poolSeen, poolLeft: poolSeen, rows: plan, reason: e?.message || 'assignment failed' };
  } finally {
    client.release();
  }

  // Tell every connected client. These writes go straight to Postgres rather than through the
  // /db/query gateway, and that gateway is what normally emits the SSE change event — so without
  // this an assignment made by the sync was invisible to an already-open app until someone reloaded.
  // Emitting 'leads' is what makes an Advisor's book fill in front of them.
  if (assigned > 0) {
    try {
      const { broadcastChange } = await import('../routes/events');
      broadcastChange('leads');
    } catch { /* a missed notification must never fail the assignment */ }
  }

  return { ok: true, assigned, poolSeen, poolLeft: Math.max(0, poolSeen - assigned), rows: plan,
    unrouted, teams: Array.from(byTeam, ([k, v]) => ({ service: k, leads: v.length })) };
}
