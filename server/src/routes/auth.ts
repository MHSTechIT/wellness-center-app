import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../shared/db';
import { signSession } from '../shared/session';

// Password hashing with Node's built-in scrypt (no external deps).
// Stored format: scrypt$<saltHex>$<hashHex>
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string | null): boolean {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, saltHex, hashHex] = stored.split('$');
  const hash = crypto.scryptSync(pw, Buffer.from(saltHex, 'hex'), 64);
  const a = Buffer.from(hashHex, 'hex');
  return a.length === hash.length && crypto.timingSafeEqual(a, hash);
}

async function login(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) { res.json({ error: 'Enter email and password' }); return; }
    const { rows } = await pool.query('SELECT email, name, role, active, password_hash FROM app_users WHERE lower(email)=lower($1) LIMIT 1', [email]);
    const u = rows[0];
    if (!u || !u.active || !verifyPassword(password, u.password_hash)) {
      res.json({ error: 'Invalid login credentials' });
      return;
    }
    const token = signSession(u.email, u.role || 'Advisor', u.name || null);
    res.json({ email: u.email, name: u.name, role: u.role, token });
  } catch (e: any) {
    res.json({ error: e?.message || 'login error' });
  }
}

// "First time? Set your password" — sets the password for an existing app_user that has NEVER
// had one (password_hash IS NULL). This used to accept ANY active email with no proof of identity
// at all, so anyone who learned an admin's address — e.g. from the seeded Super Admin account,
// whose email is not a secret — could silently overwrite their password and sign in as them. Once
// a password already exists, this route now refuses; only an account that genuinely hasn't been
// activated yet can go through it. (A real "forgot password" flow — a signed, single-use, emailed
// reset link — would close the remaining narrower gap of racing a brand-new, not-yet-claimed
// account, but needs an email/SMS provider this codebase doesn't have configured; flagging that as
// a follow-up rather than inventing a delivery channel here.)
async function signup(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (password.length < 6) { res.json({ error: 'Password must be at least 6 characters' }); return; }
    const { rows } = await pool.query('SELECT email, name, role, active, password_hash FROM app_users WHERE lower(email)=lower($1) LIMIT 1', [email]);
    const u = rows[0];
    if (!u || !u.active) { res.json({ error: 'This email is not authorized. Ask your admin to add you first.' }); return; }
    if (u.password_hash) { res.json({ error: 'This account already has a password. Use Sign in — if you forgot it, ask your admin to reset your access.' }); return; }
    await pool.query('UPDATE app_users SET password_hash=$1 WHERE lower(email)=lower($2)', [hashPassword(password), email]);
    const token = signSession(u.email, u.role || 'Advisor', u.name || null);
    res.json({ email: u.email, name: u.name, role: u.role, token });
  } catch (e: any) {
    res.json({ error: e?.message || 'signup error' });
  }
}

export function registerAuthRoutes(app: Express) {
  app.post('/auth/login', login);
  app.post('/auth/signup', signup);
}
