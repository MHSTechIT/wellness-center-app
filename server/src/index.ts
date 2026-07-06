import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { registerMetaRoutes, refreshExpiringTokens } from './routes/meta';
import { registerCallRoutes } from './routes/calls';

const app = express();

// CORS — allow the configured client origin(s). Comma-separated CORS_ORIGIN,
// or reflect any origin in development when unset.
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));

app.use(express.json({ limit: '2mb' }));
// Smartflo may POST the recording webhook as form-encoded.
app.use(express.urlencoded({ extended: true }));

// Health check (used by ECS/ALB target-group probes).
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'wellness-api', ts: new Date().toISOString() });
});

registerMetaRoutes(app);
registerCallRoutes(app);

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
