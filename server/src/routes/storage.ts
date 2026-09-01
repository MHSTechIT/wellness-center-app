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

// ---- Chunked upload -----------------------------------------------------------------------
// A consultation recording is posted in PARTS instead of one enormous request. The single-shot
// route below has a hard body limit, and every limit of that kind eventually meets a longer
// consultation: a 64mb cap refused anything past ~50 minutes (the bug reported from production),
// and raising it to 150mb only moved the wall to just under two hours. Parts remove the wall
// rather than move it — no single request here exceeds ~12 MB, so duration stops being a
// variable, and a dropped connection costs one part instead of the whole session.
//
// Parts are appended to a scratch file and moved into place only when the LAST part lands, so a
// half-finished upload can never be mistaken for a recording.
const PARTS_DIR = path.join(UPLOAD_DIR, '.parts');
/** Hard ceiling per upload. Two hours of 64 kbps speech is ~58 MB; 512 MB is far above anything
 *  legitimate while still bounding what a single caller can write to disk. */
const MAX_UPLOAD_BYTES = 512 * 1024 * 1024;
/** An upload id is used as a FILENAME, so it may only be characters that cannot escape the
 *  directory. Anything else is rejected outright rather than sanitised into something else. */
const UPLOAD_ID = /^[A-Za-z0-9_-]{8,80}$/;

/** Delete scratch files from uploads that were abandoned (tab closed mid-send, server restarted).
 *  Without this every failed attempt would leave its bytes on disk for ever. */
function sweepStaleParts(maxAgeMs = 12 * 60 * 60 * 1000) {
  try {
    if (!fs.existsSync(PARTS_DIR)) return;
    const now = Date.now();
    for (const name of fs.readdirSync(PARTS_DIR)) {
      const f = path.join(PARTS_DIR, name);
      try { if (now - fs.statSync(f).mtimeMs > maxAgeMs) fs.unlinkSync(f); } catch { /* next */ }
    }
  } catch { /* sweeping is best-effort */ }
}

// Exported so the part-assembly contract can be integration-tested against the REAL handler
// rather than a copy of it (see server/scripts/test-chunked-upload.mjs).
export async function uploadPart(req: Request, res: Response) {
  try {
    const id = String(req.body?.uploadId || '');
    const rel = safeRel(String(req.body?.path || ''));
    const b64 = String(req.body?.dataB64 || '');
    const seq = Number(req.body?.seq);
    const last = !!req.body?.last;
    if (!UPLOAD_ID.test(id)) { res.json({ error: 'invalid uploadId' }); return; }
    if (!rel) { res.json({ error: 'path required' }); return; }
    if (!Number.isInteger(seq) || seq < 0) { res.json({ error: 'seq required' }); return; }
    fs.mkdirSync(PARTS_DIR, { recursive: true });
    const scratch = path.join(PARTS_DIR, id);
    // Part 0 starts a fresh file. Any other part must find one already open, so a retry that
    // begins mid-sequence fails loudly instead of writing a file missing its first half.
    if (seq === 0) { try { fs.unlinkSync(scratch); } catch { /* nothing to remove */ } }
    else if (!fs.existsSync(scratch)) { res.json({ error: 'upload session expired — start again' }); return; }
    if (b64) {
      const buf = Buffer.from(b64, 'base64');
      const grown = (fs.existsSync(scratch) ? fs.statSync(scratch).size : 0) + buf.length;
      if (grown > MAX_UPLOAD_BYTES) {
        try { fs.unlinkSync(scratch); } catch { /* already gone */ }
        res.json({ error: 'file exceeds the ' + Math.round(MAX_UPLOAD_BYTES / 1048576) + ' MB limit' }); return;
      }
      fs.appendFileSync(scratch, buf);
    }
    if (!last) { res.json({ ok: true, seq, bytes: fs.existsSync(scratch) ? fs.statSync(scratch).size : 0 }); return; }
    // Last part: publish. rename() within one filesystem is atomic, so a reader can never observe
    // a partly-written recording; copy+unlink covers UPLOAD_DIR sitting on a different mount.
    const full = path.join(UPLOAD_DIR, rel);
    if (!full.startsWith(UPLOAD_DIR)) { res.json({ error: 'invalid path' }); return; }
    fs.mkdirSync(path.dirname(full), { recursive: true });
    try { fs.renameSync(scratch, full); }
    catch { fs.copyFileSync(scratch, full); try { fs.unlinkSync(scratch); } catch { /* best effort */ } }
    res.json({ path: rel, bytes: fs.statSync(full).size });
    sweepStaleParts();
  } catch (e: any) {
    res.json({ error: e?.message || 'upload error' });
  }
}

/** Abandon an upload and delete its scratch file (the client calls this when it gives up). */
export function abortPart(req: Request, res: Response) {
  const id = String(req.body?.uploadId || '');
  if (UPLOAD_ID.test(id)) { try { fs.unlinkSync(path.join(PARTS_DIR, id)); } catch { /* already gone */ } }
  res.json({ ok: true });
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
  // Parts are deliberately SMALL. The point of chunking is that no request here is ever near a
  // proxy's or a platform's body limit, so a longer consultation cannot reintroduce the failure
  // this route exists to remove. 12mb comfortably carries an 8 MB part with its base64 inflation.
  app.post('/storage/upload-part', express.json({ limit: '12mb' }), requireAuth, uploadPart);
  app.post('/storage/upload-abort', express.json({ limit: '64kb' }), requireAuth, abortPart);
  sweepStaleParts();   // clear anything a previous process left behind
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
