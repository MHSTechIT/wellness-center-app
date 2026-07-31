import type { Express, Request, Response } from 'express';
import { runQuery } from '../shared/query';
import { requireAuth } from '../shared/session';
import { broadcastChange } from './events';

// Actions that CHANGE data. A 'select' must never broadcast, or every client's refresh read would
// trigger another broadcast and the whole fleet would loop forever.
const MUTATIONS = new Set(['insert', 'update', 'upsert', 'delete']);

// Generic data gateway for the browser client's Supabase-compatible shim.
// The client posts a query descriptor; we run it and return { data, error }.
// requireAuth: this endpoint reaches every table in the database (leads, payments, app_users...)
// with no table-specific restriction — it MUST NOT be reachable without a valid session. Before
// this, it had no authentication of any kind (the audit's single highest-severity finding).
// Returns an error message if a leads write would persist a "Will Join Immediately" coach
// profile without a review date; null when the write is allowed. Only inspects leads
// insert/update/upsert that carry a coach_profile — every other write passes straight through.
function validateCoachProfileWrite(q: any): string | null {
  if (!q || q.table !== 'leads') return null;
  if (!['insert', 'update', 'upsert'].includes(String(q.action))) return null;
  const rows = Array.isArray(q.values) ? q.values : (q.values ? [q.values] : []);
  for (const row of rows) {
    const cp = row && row.coach_profile;
    if (cp && typeof cp === 'object' && cp.consStatus === 'Will Join Immediately') {
      const rd = cp.reviewDate;
      if (!(rd != null && String(rd).trim())) {
        return 'Review date is required when "Will Join Immediately" is selected.';
      }
    }
  }
  return null;
}

export function registerDataRoutes(app: Express) {
  app.post('/db/query', requireAuth, async (req: Request, res: Response) => {
    const q = req.body || {};
    // Domain rule (mirrors the frontend): a coach profile whose consultation status is
    // "Will Join Immediately" MUST carry a review date. Enforced here too so the DB can never
    // hold a "join" record without the follow-up date, even if the client check is bypassed.
    const gErr = validateCoachProfileWrite(q);
    if (gErr) { res.status(400).json({ data: null, error: { message: gErr }, count: null }); return; }
    const r = await runQuery(q);
    res.json({ data: r.data, error: r.error, count: r.count });
    // Real-time fan-out AFTER the response, so a slow/failed notify can never delay or break the
    // write itself. Only successful mutations notify. This one hook covers every page and role
    // because every write in the app already funnels through this endpoint — see events.ts.
    if (!r.error && q.table && MUTATIONS.has(String(q.action))) {
      try { broadcastChange(String(q.table)); } catch { /* never let notification break a write */ }
    }
  });
}
