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
export function registerDataRoutes(app: Express) {
  app.post('/db/query', requireAuth, async (req: Request, res: Response) => {
    const q = req.body || {};
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
