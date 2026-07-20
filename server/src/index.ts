import './shared/env';   // MUST be first — loads server/.env + .env.local before any env read
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Deployed commit SHA — reported at /version and /health so an already-open client can detect a new
// build and prompt a reload. Prefer an explicit BUILD_VERSION env; else read the checked-out commit
// (the server runs from the git repo on the prod box after `git reset --hard`); else 'dev'.
const BUILD_VERSION = (() => {
  if (process.env.BUILD_VERSION) return process.env.BUILD_VERSION;
  try { return execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim(); } catch { return 'dev'; }
})();
import { registerMetaRoutes, refreshExpiringTokens } from './routes/meta';
import { registerCallRoutes } from './routes/calls';
import { registerDataRoutes } from './routes/data';
import { registerAuthRoutes } from './routes/auth';
import { registerStorageRoutes } from './routes/storage';

const app = express();

// CORS — allow the configured client origin(s). Comma-separated CORS_ORIGIN,
// or reflect any origin in development when unset.
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));

// Default JSON body limit is small; office-visit audio uploads to /storage/upload
// are base64-encoded and much larger, so that route gets its own bigger parser
// (registered inside registerStorageRoutes). Skip the small parser for it here.
const jsonSmall = express.json({ limit: '2mb' });
app.use((req, res, next) => {
  if (req.path === '/storage/upload') return next();
  return jsonSmall(req, res, next);
});
// Smartflo may POST the recording webhook as form-encoded.
app.use(express.urlencoded({ extended: true }));

// Health check (used by ECS/ALB target-group probes).
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'wellness-api', version: BUILD_VERSION, ts: new Date().toISOString() });
});

// Deployed build version — the client polls this and compares to its own baked SHA to know when a
// newer build is live. Never cached so a reload can't serve a stale value.
app.get('/version', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ version: BUILD_VERSION });
});

registerMetaRoutes(app);
registerCallRoutes(app);
registerDataRoutes(app);   // Postgres data gateway (replaces Supabase PostgREST)
registerAuthRoutes(app);   // login / set-password against app_users
registerStorageRoutes(app); // file uploads (replaces Supabase Storage)

// ---- Serve the built frontend (static export) on the SAME origin as the API ----
// In production, `npm --prefix client run build` emits client/out; this server
// serves it, so the browser's /db, /auth, /api calls are same-origin (no proxy).
const CLIENT_DIST = [
  process.env.CLIENT_DIST,
  path.resolve(process.cwd(), '..', 'client', 'out'),   // started from server/
  path.resolve(process.cwd(), 'client', 'out'),          // started from repo root
  path.resolve(__dirname, '..', '..', 'client', 'out'),  // relative to dist/index.js
].find((p) => p && fs.existsSync(path.join(p, 'index.html'))) || '';
if (CLIENT_DIST) {
  app.use(express.static(CLIENT_DIST));
  // SPA fallback: any non-API route serves index.html.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/db') || req.path.startsWith('/auth') || req.path.startsWith('/storage') || req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
  console.log(`[wellness-api] serving frontend from ${CLIENT_DIST}`);
} else {
  console.log(`[wellness-api] frontend build not found at ${CLIENT_DIST} (API-only mode). Run: npm --prefix client run build`);
}

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`[wellness-api] listening on :${port}`);
});

// Daily Meta token refresh — replaces the Vercel cron that hit /api/meta/token.
// Runs in-process since this is a long-lived container (not serverless).
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  refreshExpiringTokens().catch(() => {});
}, ONE_DAY_MS);
