import type { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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
  app.post('/storage/upload', upload);
  app.get('/storage/files/*', (req: Request, res: Response) => {
    const rel = safeRel(req.params[0] || '');
    const full = path.join(UPLOAD_DIR, rel);
    if (!full.startsWith(UPLOAD_DIR) || !fs.existsSync(full)) { res.status(404).end(); return; }
    res.sendFile(full);
  });
}
