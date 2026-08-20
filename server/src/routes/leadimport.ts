import type { Express } from 'express';
import { requireAuth, requireRole } from '../shared/session';
import { pool } from '../shared/db';

// Direct Upload in DP. Three endpoints, and the ordering between them is the safety property:
// template → preview → apply. Nothing writes except /apply, and /apply re-derives everything from
// the file rather than trusting a preview the browser hands back.
//
// Gated to the roles that own bulk data. A bulk update can change hundreds of leads in one action,
// which is not something an advisor account should be able to do even by accident.
const IMPORT_ROLES = ['Super Admin', 'Manager', 'Branch Manager', 'BDM'] as const;

export function registerLeadImportRoutes(app: Express) {
  // The reusable template. Downloaded once, filled in, and re-uploaded as often as needed.
  app.get('/api/leadimport/template', requireAuth, async (_req, res) => {
    try {
      const { templateCsv } = await import('../services/leadimport');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="direct-upload-template.csv"');
      // The BOM makes Excel open a UTF-8 CSV without mangling non-ASCII names.
      res.send('﻿' + templateCsv());
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message || 'template failed' }); }
  });

  // Validate + match + diff. Writes NOTHING; this is what the confirm screen renders.
  app.post('/api/leadimport/preview', requireAuth, requireRole(...IMPORT_ROLES), async (req, res) => {
    try {
      const { analyze } = await import('../services/leadimport');
      const csv = String((req.body && req.body.csv) || '');
      if (!csv.trim()) { res.status(400).json({ ok: false, error: 'No file content received.' }); return; }
      res.json(await analyze(csv, { leadDateMode: req.body?.leadDateMode, fileName: req.body?.fileName }));
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message || 'preview failed' }); }
  });

  // The only write path.
  app.post('/api/leadimport/apply', requireAuth, requireRole(...IMPORT_ROLES), async (req, res) => {
    try {
      const { apply } = await import('../services/leadimport');
      const csv = String((req.body && req.body.csv) || '');
      if (!csv.trim()) { res.status(400).json({ ok: false, error: 'No file content received.' }); return; }
      const by = String((req as any).user?.name || (req as any).user?.email || 'Admin');
      const out = await apply(csv, { leadDateMode: req.body?.leadDateMode, by, fileName: req.body?.fileName });
      // Every screen showing leads should refresh — the same signal a normal gateway write emits.
      if (out.ok && out.updated > 0) {
        try { const { broadcastChange } = await import('./events'); broadcastChange('leads'); } catch { /* notification only */ }
      }
      res.json(out);
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message || 'update failed' }); }
  });

  // Past uploads, newest first — the audit log the settings screen lists.
  app.get('/api/leadimport/batches', requireAuth, async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, file_name, uploaded_by, lead_date_mode, total_rows, matched, updated_rows,
                not_found, ambiguous, duplicate_rows, invalid_rows,
                to_char(uploaded_at AT TIME ZONE 'Asia/Kolkata','YYYY-MM-DD HH24:MI') AS uploaded_at
           FROM lead_import_batches ORDER BY id DESC LIMIT 25`
      );
      res.json({ ok: true, batches: rows });
    } catch (e: any) { res.json({ ok: true, batches: [], note: e?.message }); }
  });

  // The field-level old → new for one batch.
  app.get('/api/leadimport/batch/:id', requireAuth, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT lead_id, lead_name, field, old_value, new_value
           FROM lead_import_changes WHERE batch_id = $1 ORDER BY id LIMIT 2000`,
        [String(req.params.id)]
      );
      res.json({ ok: true, changes: rows });
    } catch (e: any) { res.status(500).json({ ok: false, error: e?.message || 'failed' }); }
  });
}
