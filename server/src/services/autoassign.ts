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

export type AssignPlanRow = { advisor: string; target: number; already: number; headroom: number; assigned: number };
export type AssignResult = {
  ok: boolean;
  assigned: number;
  poolSeen: number;
  poolLeft: number;
  rows: AssignPlanRow[];
  reason?: string;
};

// Who counts as an advisor for lead assignment — the SAME three gates the client's _assignTargets
// applies, expressed in SQL:
//   1. an active assignee;
//   2. holding a role of ADVISOR GRADE (Advisor / Senior Advisor / any Telecaller variant). Roles
//      come from app_users.roles, which is a LIST — assignees.role mirrors only one of them, and
//      reading that column alone is what hid sugashini, whose mirrored role is "Health Coach" while
//      app_users.roles is ["Health Coach","Advisor"]. She showed in the Assign-to menu and was
//      missing from the allocation table, the one place her daily limit is set;
//   3. that role still ticked Assignable in Settings → Roles, so assignment can be switched off
//      org-wide without editing anybody's record.
// Health Coach is assignable but is NOT an advisor grade, so a Health Coach alone still never
// qualifies — only the second role does it.
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

  // 1 — targets. Only a POSITIVE target opts an advisor in; 0 or no row means "not in the rotation",
  //     which is how an admin excludes somebody without deleting them from the staff master.
  // EXISTS, not JOIN, and matched CASE-SENSITIVELY.
  //   · EXISTS because a join can multiply one target row once per matching assignee — which put an
  //     advisor in the plan twice and handed them 8 + 4 = 12 leads against a target of 8. EXISTS asks
  //     the question actually meant ("is this advisor active staff?") and answers once.
  //   · case-sensitively because "Deepak" and "deepak" are two DIFFERENT staff members here, with
  //     different email addresses, separate logins and 54 and 17 leads of their own. leads.assigned_to
  //     stores the exact name, so exact comparison is the only thing that can tell them apart;
  //     lower() would let one person's target validate against the other's staff row.
  const { rows: tRows } = await pool.query(
    `SELECT t.advisor, t.daily_target
       FROM advisor_lead_targets t
      WHERE t.daily_target > 0
        AND EXISTS (SELECT 1 FROM assignees a
                     WHERE a.is_active AND btrim(a.name) = btrim(t.advisor))
      ORDER BY t.advisor`
  );
  if (!tRows.length) {
    return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: [], reason: 'no advisor has a daily target set' };
  }

  // 2 — what each advisor has ALREADY been given today (IST). Counted across every lead, not just
  //     auto-assigned ones: a lead the admin hands over manually is still part of that advisor's day,
  //     so it has to reduce the headroom or the two paths would together exceed the target.
  const { rows: aRows } = await pool.query(
    `SELECT assigned_to AS advisor, count(*)::int AS n
       FROM leads
      WHERE is_assigned
        AND assigned_at IS NOT NULL
        AND (assigned_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date
      GROUP BY 1`
  );
  // Keyed by the EXACT assigned_to string. Lowercasing here collapsed "Deepak" (54 leads) and
  // "deepak" (17) onto one key, where Map.set let whichever row came last silently overwrite the
  // other's count — so one of the two would have been handed a full day's allocation they had
  // already used up.
  const already = new Map<string, number>();
  for (const r of aRows) already.set(String(r.advisor || '').trim(), Number(r.n) || 0);

  const plan: AssignPlanRow[] = tRows.map((r: any) => {
    const target = Number(r.daily_target) || 0;
    const done = already.get(String(r.advisor).trim()) || 0;
    return { advisor: String(r.advisor), target, already: done, headroom: Math.max(0, target - done), assigned: 0 };
  });

  const totalHeadroom = plan.reduce((s, p) => s + p.headroom, 0);
  if (totalHeadroom <= 0) {
    return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: plan, reason: "every advisor has reached today's target" };
  }

  // 3 — ELIGIBLE LEADS. Anything unassigned that either arrived TODAY (IST) or was deliberately
  //     pushed into the manual pool.
  //
  //     It used to require in_pool = true, and that was the bug behind "16 leads still showing as
  //     unassigned": a lead arriving from Meta is written with in_pool = false and no pool_added_at.
  //     The flag marks a lead an admin has PUSHED to the pool, not a lead awaiting assignment — so
  //     the engine saw zero eligible leads however many came in, and every live lead sat in the
  //     Unassigned table waiting for a manual hand-off that the whole feature exists to avoid.
  //
  //     TODAY ONLY, and that is a deliberate instruction rather than a convenience: the backlog in
  //     this database is 5,500+ unassigned leads, and the brief is explicit that yesterday's and
  //     older leads stay untouched. So a lead that arrives after every target is full is NOT carried
  //     into tomorrow — it stays unassigned for an admin to place by hand. (An earlier version used
  //     a 7-day window to stop exactly that stranding; it was withdrawn because auto-assigning a
  //     lead a day or more after it arrived is worse than leaving it visible in the Unassigned list.)
  //     in_pool is no longer consulted at all: a Meta lead is written with in_pool = false, so that
  //     flag was the original reason live leads were never eligible.
  //     LIMIT is the headroom, which is what enforces "never exceed the configured daily target".
  const { rows: leadRows } = await pool.query(
    `SELECT meta_lead_id FROM leads
      WHERE coalesce(is_assigned,false) = false
        AND coalesce(btrim(assigned_to),'') = ''
        AND (coalesce(created_at, pool_added_at) AT TIME ZONE 'Asia/Kolkata')::date
            = (now() AT TIME ZONE 'Asia/Kolkata')::date
      ORDER BY coalesce(pool_added_at, created_at) ASC NULLS LAST
      LIMIT $1`,
    [totalHeadroom]
  );
  const poolSeen = leadRows.length;
  if (!poolSeen) {
    return { ok: true, assigned: 0, poolSeen: 0, poolLeft: 0, rows: plan, reason: "no unassigned leads from today — older leads are left alone by design" };
  }

  // 4 — SEQUENTIAL FILL, per the spec: advisor A is topped up to their target before B receives
  //     anything. (The alternative, round-robin, would spread the morning's leads across everyone —
  //     the brief's own worked example, "3 leads arrive and all 3 go to Advisor A", rules that out.)
  const queue = leadRows.map((r: any) => String(r.meta_lead_id));
  let i = 0;
  const writes: { advisor: string; ids: string[] }[] = [];
  for (const p of plan) {
    if (i >= queue.length) break;
    const take = Math.min(p.headroom, queue.length - i);
    if (take <= 0) continue;
    writes.push({ advisor: p.advisor, ids: queue.slice(i, i + take) });
    p.assigned = take;
    i += take;
  }
  const assigned = i;

  if (dryRun) {
    return { ok: true, assigned, poolSeen, poolLeft: Math.max(0, poolSeen - assigned), rows: plan };
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

  return { ok: true, assigned, poolSeen, poolLeft: Math.max(0, poolSeen - assigned), rows: plan };
}
