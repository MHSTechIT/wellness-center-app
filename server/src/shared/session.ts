// Signed session tokens — replaces the client's old hardcoded access_token:"local", which no
// server code ever validated (anyone could paste a crafted {user:{email:...}} into localStorage
// and be whoever they claimed). Hand-rolled HMAC (no external JWT dependency), matching the
// project's existing pattern of using Node's built-in crypto for auth (see auth.ts's scrypt).
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — a staff shift; re-login after that

// A token signed with a secret that changes on every restart is still far better than no
// signature at all (forgery becomes impossible instead of trivial) — but every session drops on
// deploy/restart if SESSION_SECRET isn't set. Warn loudly so this is a conscious ops decision,
// not a silent gap someone finds in production.
const SESSION_SECRET: string = process.env.SESSION_SECRET || (() => {
  const generated = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[wellness-api] SESSION_SECRET is not set — generated a random one for this process only.\n' +
    '                Every logged-in session will be invalidated on the next restart.\n' +
    '                Set SESSION_SECRET in server/.env for stable sessions across restarts.'
  );
  return generated;
})();

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export type SessionPayload = { email: string; role: string; name: string | null; iat: number; exp: number };

export function signSession(email: string, role: string, name: string | null): string {
  const payload: SessionPayload = { email, role, name, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: SessionPayload }
  }
}

function extractToken(req: Request): string | null {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  // Plain resource loads (<img src>, a download link opened in a new tab, a PDF viewer) can't
  // attach a custom header — the file-serving route needs the token embedded in the URL itself.
  // This is broader than a per-file signed URL (any valid session can read any stored file, same
  // as before minus "no auth at all"), but ships without a bigger URL-signing subsystem; a
  // path-scoped signed-URL upgrade is a reasonable follow-up, not required to close the hole.
  const q = req.query?.token;
  if (typeof q === 'string' && q) return q;
  return null;
}

// Require ANY valid, unexpired session. This is the fix for the audit's single highest-severity
// finding: /db/query, /storage/*, and /api/* had no authentication of any kind — any caller could
// read or write every table, including app_users, or download any uploaded patient file.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const payload = verifySession(extractToken(req));
  if (!payload) { res.status(401).json({ error: 'Not authenticated — please sign in again.' }); return; }
  req.user = payload;
  next();
}

// Gate an admin-only route (e.g. writing app_users/assignees/app_settings) to specific roles.
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated — please sign in again.' }); return; }
    if (!roles.includes(req.user.role)) { res.status(403).json({ error: 'You do not have permission to do that.' }); return; }
    next();
  };
}
