// Integration test for the chunked upload path (/storage/upload-part).
//
// This exercises the REAL handler from server/src/routes/storage.ts, mounted on a throwaway
// express app with no auth — the auth middleware is not what this is testing, and standing up a
// signed session to reach a file-assembly bug would prove nothing about the assembly.
//
// Run:  node server/scripts/test-chunked-upload.mjs        (needs `npm --prefix server run build`)
//
// What it has to prove, because this is the path a lost consultation recording travels:
//   1. A file sent in N parts is reassembled BYTE-EXACTLY, at sizes matching 45m / 1h / 1.5h / 2h.
//   2. Nothing appears at the destination until the last part lands.
//   3. A part arriving without part 0 is refused, never written as a truncated file.
//   4. An uploadId cannot escape the parts directory.
//   5. Abort removes the scratch file.
import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const ROOT = path.resolve(process.cwd());
const UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'wos-upl-'));
process.env.UPLOAD_DIR = UPLOAD_DIR;   // must be set BEFORE the module is imported

const mod = await import('file://' + path.join(ROOT, 'server/dist/routes/storage.js'));
const app = express();
app.post('/storage/upload-part', express.json({ limit: '12mb' }), mod.uploadPart);
app.post('/storage/upload-abort', express.json({ limit: '64kb' }), mod.abortPart);
const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

const post = (route, body) => new Promise((resolve) => {
  const b = JSON.stringify(body);
  const req = http.request({ host: '127.0.0.1', port: PORT, path: route, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, (res) => {
    let d = ''; res.on('data', (c) => (d += c));
    res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: { raw: d.slice(0, 120) } }); } });
  });
  req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
  req.end(b);
});

const PART = 6 * 1024 * 1024;
let pass = 0, fail = 0;
const check = (name, ok, detail) => { (ok ? pass++ : fail++); console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '   ' + detail : '')); };

// Bytes that are NOT compressible or self-similar, so a mis-ordered or dropped part cannot
// coincidentally produce a matching digest.
function noise(bytes) {
  const b = Buffer.allocUnsafe(bytes);
  for (let o = 0; o < bytes; o += 65536) crypto.randomFillSync(b, o, Math.min(65536, bytes - o));
  return b;
}

async function sendInParts(id, dest, buf) {
  const parts = Math.ceil(buf.length / PART) || 1;
  let last = null;
  for (let i = 0; i < parts; i++) {
    last = await post('/storage/upload-part', {
      uploadId: id, path: dest, seq: i,
      dataB64: buf.subarray(i * PART, Math.min(buf.length, (i + 1) * PART)).toString('base64'),
      last: i === parts - 1,
    });
    if (last.body.error) return { parts, last };
  }
  return { parts, last };
}

console.log('\nChunked upload — consultation recording sizes');
console.log('UPLOAD_DIR: ' + UPLOAD_DIR + '\n');

// 64 kbps Opus is 8 kB/s, the rate the recorders now request.
const KBPS8 = 8 * 1024;
for (const [label, minutes] of [['45 minutes', 45], ['1 hour', 60], ['1.5 hours', 90], ['2 hours', 120]]) {
  const bytes = minutes * 60 * KBPS8;
  const buf = noise(bytes);
  const want = crypto.createHash('sha256').update(buf).digest('hex');
  const dest = 'office-recordings/lead1/' + minutes + 'min.webm';
  const t0 = Date.now();
  const { parts, last } = await sendInParts('up' + minutes + 'aaaaaaaa', dest, buf);
  const full = path.join(UPLOAD_DIR, dest);
  const got = fs.existsSync(full) ? crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') : '(missing)';
  check(label.padEnd(10) + ' ' + String(Math.round(bytes / 1048576)).padStart(3) + ' MB in ' + String(parts).padStart(2) + ' parts',
    got === want && !last.body.error,
    'byte-exact, ' + (Date.now() - t0) + 'ms');
}

// Nothing may appear at the destination until the LAST part lands.
{
  const dest = 'office-recordings/lead2/partial.webm';
  const buf = noise(14 * 1024 * 1024);
  await post('/storage/upload-part', { uploadId: 'uppartial01', path: dest, seq: 0, dataB64: buf.subarray(0, PART).toString('base64'), last: false });
  await post('/storage/upload-part', { uploadId: 'uppartial01', path: dest, seq: 1, dataB64: buf.subarray(PART, PART * 2).toString('base64'), last: false });
  check('incomplete upload is not published', !fs.existsSync(path.join(UPLOAD_DIR, dest)), 'destination still absent after 2 of 3 parts');
  const ab = await post('/storage/upload-abort', { uploadId: 'uppartial01' });
  check('abort clears the scratch file', ab.body.ok === true && !fs.existsSync(path.join(UPLOAD_DIR, '.parts', 'uppartial01')));
}

// A part with no session before it must be refused, never written as a truncated file.
{
  const r = await post('/storage/upload-part', { uploadId: 'uporphan001', path: 'office-recordings/lead3/x.webm', seq: 4, dataB64: noise(1024).toString('base64'), last: true });
  check('orphan part (no seq 0) is refused', /expired/i.test(String(r.body.error || '')), String(r.body.error || r.body.path));
}

// uploadId is used as a filename; it must not be able to escape.
{
  const r = await post('/storage/upload-part', { uploadId: '../../escape', path: 'office-recordings/lead4/x.webm', seq: 0, dataB64: 'AA==', last: true });
  check('traversal uploadId is rejected', /invalid uploadId/i.test(String(r.body.error || '')), String(r.body.error || ''));
}

// The destination path itself must stay under UPLOAD_DIR.
{
  const r = await post('/storage/upload-part', { uploadId: 'uptrav00001', path: '../../../etc/passwd', seq: 0, dataB64: 'AA==', last: true });
  const escaped = fs.existsSync(path.resolve(UPLOAD_DIR, '../../../etc/passwd'));
  check('traversal destination cannot escape UPLOAD_DIR', !escaped, 'stored as ' + (r.body.path || r.body.error));
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
server.close();
fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
