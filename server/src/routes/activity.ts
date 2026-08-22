import type { Express, Request, Response } from 'express';
import { pool } from '../shared/db';
import { requireAuth, requireRole } from '../shared/session';

// ============================================================
// USER LOGIN & ACTIVITY (PRD §8, §9, §16, §17, §20, §21)
//
// Records WHEN people were signed in. It deliberately owns no user data of its own: app_users
// remains the single source of truth for who someone is and what role they hold (§3, §21), and
// every row here is keyed by the email the signed session token already carries.
//
// One row per SESSION. A person logging in twice in a day produces two rows, never an overwritten
// one (§9) — the daily total is a SUM over them, which is only possible if each is kept.
// ============================================================

/** Roles allowed to see other people's activity (§2). Enforced HERE, not only in the UI (§20). */
export const ACTIVITY_ROLES = ['Super Admin', 'Admin', 'Manager'];

/** How long a silent session is presumed dead. The client beats every 60s (§16); three missed
 *  beats is a browser that was closed rather than a person who paused. */
const STALE_MS = 3 * 60 * 1000;

/** Coarse device/browser from the UA string. No fingerprinting — enough to tell a phone from a
 *  desk, which is what "2 Active Sessions on 2 devices" (§17) has to distinguish. */
export function parseAgent(ua: string): { device: string; browser: string } {
  const s = String(ua || '');
  const browser = /Edg\//.test(s) ? 'Edge' : /OPR\//.test(s) ? 'Opera'
    : /Chrome\//.test(s) ? 'Chrome' : /Safari\//.test(s) ? 'Safari'
    : /Firefox\//.test(s) ? 'Firefox' : 'Browser';
  const device = /Android/.test(s) ? 'Android' : /iPhone|iPad|iPod/.test(s) ? 'iOS'
    : /Windows/.test(s) ? 'Windows' : /Mac OS X/.test(s) ? 'macOS'
    : /Linux/.test(s) ? 'Linux' : 'Unknown';
  return { device, browser };
}

/** The caller's IP, honouring a proxy header when one is present (§8 "if available"). */
function clientIp(req: Request): string {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req.socket?.remoteAddress || '').replace(/^::ffff:/, '') || '';
}

/** Open a session. Called from the login route — never exposed as its own endpoint, so a session
 *  can only ever be created by an actual authenticated sign-in (§16). */
export async function openSession(u: { email: string; name?: string | null; role?: string | null }, req: Request): Promise<string | null> {
  try {
    const { device, browser } = parseAgent(String(req.headers['user-agent'] || ''));
    // Close anything this account left hanging first. A browser closed without signing out leaves
    // an open row that would otherwise read as "online" forever and inflate Currently Online (§17).
    await closeStale(u.email);
    const { rows } = await pool.query(
      `INSERT INTO user_sessions (user_email, user_name, user_role, device, browser, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [String(u.email).toLowerCase(), u.name || null, u.role || null, device, browser, clientIp(req)]);
    return String(rows[0].id);
  } catch { return null; }   // a login must never fail because monitoring did
}

/** Mark this account's silent sessions as expired rather than logged out — the two are different
 *  facts and §17 asks for them to read differently. */
async function closeStale(email: string): Promise<void> {
  await pool.query(
    `UPDATE user_sessions
        SET logout_at = last_activity_at, status = 'expired', updated_at = now()
      WHERE lower(user_email) = lower($1) AND logout_at IS NULL
        AND last_activity_at < now() - ($2 || ' milliseconds')::interval`,
    [email, String(STALE_MS)]);
}

export function registerActivityRoutes(app: Express) {
  // ---- Heartbeat: the session is still alive (§16) ----
  app.post('/auth/heartbeat', requireAuth, async (req: Request, res: Response) => {
    try {
      const email = String(req.user?.email || '');
      const id = String(req.body?.sessionId || '');
      const r = await pool.query(
        `UPDATE user_sessions SET last_activity_at = now(), updated_at = now()
          WHERE logout_at IS NULL AND lower(user_email) = lower($1)
            AND ($2 = '' OR id::text = $2) RETURNING id`,
        [email, id]);
      // A beat with no open row means the session was expired out from under this tab (a laptop
      // reopened after lunch). Re-open one so the person does not vanish from the dashboard while
      // still working — they are demonstrably here.
      if (!r.rows.length) { const nid = await openSession({ email, name: req.user?.name, role: req.user?.role }, req); res.json({ ok: true, sessionId: nid }); return; }
      res.json({ ok: true, sessionId: String(r.rows[0].id) });
    } catch (e: any) { res.json({ ok: false, error: e?.message || 'heartbeat error' }); }
  });

  // ---- Explicit sign-out (§17 "Normal Logout") ----
  app.post('/auth/logout', requireAuth, async (req: Request, res: Response) => {
    try {
      const email = String(req.user?.email || '');
      const id = String(req.body?.sessionId || '');
      await pool.query(
        `UPDATE user_sessions SET logout_at = now(), status = 'logged_out', updated_at = now()
          WHERE logout_at IS NULL AND lower(user_email) = lower($1) AND ($2 = '' OR id::text = $2)`,
        [email, id]);
      res.json({ ok: true });
    } catch (e: any) { res.json({ ok: false, error: e?.message || 'logout error' }); }
  });

  // ---- The dashboard's data (§2, §20) ----
  // Role-checked on the SERVER: hiding the nav item would leave the data one fetch away.
  app.get('/api/activity/sessions', requireAuth, requireRole(...ACTIVITY_ROLES), async (req: Request, res: Response) => {
    try {
      const from = String(req.query.from || '').slice(0, 10);
      const to = String(req.query.to || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        res.json({ error: 'from and to must be YYYY-MM-DD' }); return;
      }
      // Sweep stale sessions before reading, so "Currently Online" cannot count a browser that was
      // closed hours ago. Cheap, indexed, and it keeps the read and the truth in the same request.
      await pool.query(
        `UPDATE user_sessions SET logout_at = last_activity_at, status = 'expired', updated_at = now()
          WHERE logout_at IS NULL AND last_activity_at < now() - ($1 || ' milliseconds')::interval`,
        [String(STALE_MS)]);
      // IST, because every date on every other screen in this app is a Chennai day.
      const { rows } = await pool.query(
        `SELECT s.id, s.user_email, s.user_name, s.user_role, s.login_at, s.logout_at,
                s.last_activity_at, s.status, s.device, s.browser, s.ip_address,
                EXTRACT(EPOCH FROM (COALESCE(s.logout_at, now()) - s.login_at))::bigint AS seconds
           FROM user_sessions s
          WHERE (s.login_at AT TIME ZONE 'Asia/Kolkata')::date BETWEEN $1::date AND $2::date
          ORDER BY s.login_at DESC
          LIMIT 5000`, [from, to]);
      // Every user, so the dashboard can show who has NEVER logged in (§12 status filter) — a fact
      // that only exists by comparing the roster against the sessions.
      const { rows: users } = await pool.query(
        `SELECT email, name, role, COALESCE(active, true) AS active FROM app_users ORDER BY name`);
      res.json({ sessions: rows, users, staleMs: STALE_MS, serverNow: new Date().toISOString() });
    } catch (e: any) { res.json({ error: e?.message || 'activity error' }); }
  });
}
