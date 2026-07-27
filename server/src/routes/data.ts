import type { Express, Request, Response } from 'express';
import { runQuery } from '../shared/query';
import { requireAuth } from '../shared/session';

// Generic data gateway for the browser client's Supabase-compatible shim.
// The client posts a query descriptor; we run it and return { data, error }.
// requireAuth: this endpoint reaches every table in the database (leads, payments, app_users...)
// with no table-specific restriction — it MUST NOT be reachable without a valid session. Before
// this, it had no authentication of any kind (the audit's single highest-severity finding).
export function registerDataRoutes(app: Express) {
  app.post('/db/query', requireAuth, async (req: Request, res: Response) => {
    const r = await runQuery(req.body || {});
    res.json({ data: r.data, error: r.error, count: r.count });
  });
}
