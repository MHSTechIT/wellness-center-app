import type { Express, Request, Response } from 'express';
import { runQuery } from '../shared/query';

// Generic data gateway for the browser client's Supabase-compatible shim.
// The client posts a query descriptor; we run it and return { data, error }.
export function registerDataRoutes(app: Express) {
  app.post('/db/query', async (req: Request, res: Response) => {
    const r = await runQuery(req.body || {});
    res.json({ data: r.data, error: r.error, count: r.count });
  });
}
