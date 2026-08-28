import express from 'express';
import type { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../shared/session';

// Minimal file storage (replaces Supabase Storage). Files are written under
// UPLOAD_DIR and served back from /storage/files/*. The client sends the file
// as base64 JSON so no multipart parser is needed.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

function safeRel(p: string): string {
  // Prevent path traversal; keep it under UPLOAD_DIR.
  return p.replace(/\\/g, '/').replace(/\.\.+/g, '').replace(/^\/+/, '');
}

async function upload(req: Request, res: Response) {
  try {
    const rel = safeRel(String(req.body?.path || ''));
    const b64 = String(req.body?.dataB64 || '');
    if (!rel || !b64) { res.json({ error: 'path and dataB64 required' }); return; }
    const full = path.join(UPLOAD_DIR, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, Buffer.from(b64, 'base64'));
    res.json({ path: rel });
  } catch (e: any) {
    res.json({ error: e?.message || 'upload error' });
  }
}

export function registerStorageRoutes(app: Express) {
  // Bigger JSON limit for uploads (base64 audio/office recordings) — the global
  // parser in index.ts intentionally skips this path.
  // requireAuth on both routes — previously anyone could upload arbitrary files or download any
  // patient's payment proof / office-visit recording with no credentials at all. GET accepts the
  // session token via ?token= too (see session.ts) since a plain <img src>/download link can't
  // carry a header.
  // 150mb (raised from 64mb, 28-Aug-2026): base64 inflates a file by a third, so the cap has to
  // be ~1.34x the largest audio we mean to accept. Consultations record at a measured ~128 kbps
  // (15.5 kB/s), so 150mb of REQUEST carries roughly 112 MB of audio — about two hours. The
  // 87-minute recording that could not be saved posts ~105 MB, which the old 64mb cap refused.
  app.post('/storage/upload', express.json({ limit: '150mb' }), requireAuth, upload);
  // List what is actually stored under a prefix. Needed to RECOVER a file whose URL was never
  // recorded: proofs used to be saved as a bare filename, so the BDM saw dead text ("no link
  // saved") for a PDF sitting on disk the whole time. The upload path is <bucket>/<leadId>/
  // <timestamp>_<sanitised name>, so listing the lead's folder is enough to find it again.
  // Names only - no contents, and the same requireAuth as every other storage route.
  app.get('/storage/list/*', requireAuth, (req: Request, res: Response) => {
    const rel = safeRel(req.params[0] || '');
    const full = path.join(UPLOAD_DIR, rel);
    if (!full.startsWith(UPLOAD_DIR) || !fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
      res.json({ files: [] }); return;
    }
    try {
      const files = fs.readdirSync(full, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => ({ name: d.name, path: rel.replace(/^[^/]+\//, '') + '/' + d.name }));
      res.json({ files });
    } catch { res.json({ files: [] }); }
  });
  app.get('/storage/files/*', requireAuth, (req: Request, res: Response) => {
    const rel = safeRel(req.params[0] || '');
    const full = path.join(UPLOAD_DIR, rel);
    if (!full.startsWith(UPLOAD_DIR) || !fs.existsSync(full)) { res.status(404).end(); return; }
    res.sendFile(full);
  });
}
