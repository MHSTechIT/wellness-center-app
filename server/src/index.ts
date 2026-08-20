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
import { ensureSchema } from './shared/schema';
import { registerMetaRoutes, refreshExpiringTokens } from './routes/meta';
import { registerCallRoutes } from './routes/calls';
import { registerDataRoutes } from './routes/data';
import { registerEventRoutes } from './routes/events';
import { registerAuthRoutes } from './routes/auth';
import { registerStorageRoutes } from './routes/storage';
import { registerLeadImportRoutes } from './routes/leadimport';

const app = express();

// CORS — allow only the configured client origin(s) (comma-separated CORS_ORIGIN). This used to
// reflect back ANY request origin whenever CORS_ORIGIN was left unset (`origin: true`) — meaning a
// forgotten env var in a deployment silently let any website on the internet make authenticated-
// looking cross-origin requests. Fail CLOSED instead: with nothing configured, only same-origin
// requests work, which matches how this app actually runs in production anyway (this same server
// serves the built frontend on the same origin — see the static-file block below — so a real
// deployment never needs CORS at all; CORS_ORIGIN exists for the two-server local dev setup).
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// The dev client's port is NOT fixed: .claude/launch.json runs it with autoPort, so when 3000 is
// already taken (another project on the same machine) it moves to a random high port. CORS_ORIGIN
// pins http://localhost:3000, so every such run failed every request with "Failed to fetch" —
// the response came back 200 but carried no Access-Control-Allow-Origin, so the browser binned it.
// Any loopback origin is this same developer's machine, so accept it on ANY port instead of
// chasing the port in .env. Safe to leave on in production too: auth is a Bearer token in a
// header (never a cookie), so there is no ambient-credential/CSRF surface for a cross-origin page
// to abuse — it would still need a token it has no way to read. Non-loopback origins remain
// restricted to the explicit CORS_ORIGIN allowlist, and still fail CLOSED when it is unset.
const isLoopbackOrigin = (o: string) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(o);

// Baseline security response headers. Purely additive — no request is accepted or rejected
// differently, and no response BODY changes; these only tell the browser how to treat what it
// already receives. Deliberately NOT included: Content-Security-Policy and HSTS. Both can break
// a working page (inline handlers, http:// dev origins) and need their own rollout, so they stay
// a conscious follow-up rather than a silent change here.
app.disable('x-powered-by');   // was advertising "Express" on every response
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');       // stop MIME-sniffing of stored uploads
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');           // no third-party framing / clickjacking
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin(origin, cb) {
    // No Origin header = same-origin, curl, or server-to-server — nothing to police.
    if (!origin) return cb(null, true);
    if (isLoopbackOrigin(origin)) return cb(null, true);
    return cb(null, origins.includes(origin));
  },
}));

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
registerLeadImportRoutes(app);
registerCallRoutes(app);
registerDataRoutes(app);   // Postgres data gateway (replaces Supabase PostgREST)
registerAuthRoutes(app);   // login / set-password against app_users
registerStorageRoutes(app); // file uploads (replaces Supabase Storage)
registerEventRoutes(app);   // /events — SSE push so every role/page updates without a refresh

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
    if (req.path.startsWith('/db') || req.path.startsWith('/auth') || req.path.startsWith('/storage') || req.path.startsWith('/api') || req.path === '/health' || req.path === '/events') return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
  console.log(`[wellness-api] serving frontend from ${CLIENT_DIST}`);
} else {
  console.log(`[wellness-api] frontend build not found at ${CLIENT_DIST} (API-only mode). Run: npm --prefix client run build`);
}

// Global error handler — MUST be registered last (Express identifies it by the 4-arg signature).
// Before this, there was no custom error handler at all, so a body-parser failure (malformed JSON,
// an oversized upload) fell through to Express's default handler, which returns the raw error
// stack — including absolute server file paths and dependency versions — straight to the caller.
// This logs the real error server-side and returns a generic message to the client instead.
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[wellness-api] ${req.method} ${req.path} ->`, err?.message || err);
  if (res.headersSent) return;
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({ error: status === 413 ? 'Upload too large.' : 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`[wellness-api] listening on :${port}`);
  // Bring whatever database this server points at up to date. Additive and idempotent, so it is
  // safe on every boot — and it is what stops dev and production drifting apart (see schema.ts).
  // Deliberately NOT awaited before listen: a schema hiccup must not keep the API down.
  ensureSchema().catch((e) => console.error('[schema] ensure failed:', e?.message || e));
});

// A crash in a fire-and-forget async path (nothing awaits it, so nothing can .catch it) would
// otherwise terminate the whole process with no log at all — every currently-open connection
// dropped with zero diagnostic trail. Log it and keep running; individual route handlers already
// catch their own expected failures, so anything reaching here is a genuine bug worth surviving.
process.on('unhandledRejection', (reason) => {
  console.error('[wellness-api] unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[wellness-api] uncaught exception:', err);
});

// Daily Meta token refresh — replaces the Vercel cron that hit /api/meta/token.
// Runs in-process since this is a long-lived container (not serverless).
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  refreshExpiringTokens().catch(() => {});
}, ONE_DAY_MS);
