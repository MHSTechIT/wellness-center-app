import type { Express, Request, Response } from 'express';
import { runQuery } from '../shared/query';
import { requireAuth } from '../shared/session';
import { broadcastChange } from './events';
import { resetCallerNumberCache } from '../services/tata';

// Actions that CHANGE data. A 'select' must never broadcast, or every client's refresh read would
// trigger another broadcast and the whole fleet would loop forever.
const MUTATIONS = new Set(['insert', 'update', 'upsert', 'delete']);

// Generic data gateway for the browser client's Supabase-compatible shim.
// The client posts a query descriptor; we run it and return { data, error }.
// requireAuth: this endpoint reaches every table in the database (leads, payments, app_users...)
// with no table-specific restriction — it MUST NOT be reachable without a valid session. Before
// this, it had no authentication of any kind (the audit's single highest-severity finding).
// Returns an error message if a leads write would persist a "Will Join Immediately" coach
// profile without a review date; null when the write is allowed. Only inspects leads
// insert/update/upsert that carry a coach_profile — every other write passes straight through.
function validateCoachProfileWrite(q: any): string | null {
  if (!q || q.table !== 'leads') return null;
  if (!['insert', 'update', 'upsert'].includes(String(q.action))) return null;
  const rows = Array.isArray(q.values) ? q.values : (q.values ? [q.values] : []);
  for (const row of rows) {
    const cp = row && row.coach_profile;
    if (cp && typeof cp === 'object' && cp.consStatus === 'Will Join Immediately') {
      const rd = cp.reviewDate;
      if (!(rd != null && String(rd).trim())) {
        return 'Review date is required when "Will Join Immediately" is selected.';
      }
    }
  }
  return null;
}

// Telephony columns on app_users decide which line a call dials FROM and which caller ID the
// customer sees. This gateway reaches every table with no per-table authorization, so without
// this check any authenticated user could rewrite anyone's DID — placing calls under another
// person's identity, and (because configuredCallerNumbers trusts these values) pulling arbitrary
// Smartflo CDR records into this clinic's call history. Restricted to the admin roles that own
// the Settings screen where these fields live.
const TELEPHONY_COLS = ['tata_did', 'tata_extension'];
const TELEPHONY_ADMIN_ROLES = new Set(['Super Admin', 'Branch Manager', 'Manager']);
function validateTelephonyWrite(q: any, user: any): string | null {
  if (!q || q.table !== 'app_users') return null;
  if (!['insert', 'update', 'upsert'].includes(String(q.action))) return null;
  const rows = Array.isArray(q.values) ? q.values : (q.values ? [q.values] : []);
  const touches = rows.some((r: any) => r && TELEPHONY_COLS.some((c) => Object.prototype.hasOwnProperty.call(r, c)));
  if (!touches) return null;
  if (TELEPHONY_ADMIN_ROLES.has(String(user?.role || ''))) return null;
  return 'Only an admin can change a user\'s telephony (DID / extension) settings.';
}

// The services/roles master is readable by every signed-in client (the user form and nav gating
// need it), but writing it is privilege escalation: org_roles.modules IS the permission list, so
// anyone who can update it can hand themselves the Settings screen — and org_roles.is_assignable
// silently changes who receives leads. Mutations are therefore admin-only, enforced here rather
// than by hiding the Settings tab, which stops nobody who can post to this endpoint directly.
const ORG_TABLES = new Set(['org_services', 'org_roles', 'org_role_services']);
function validateOrgWrite(q: any, user: any): string | null {
  if (!q || !ORG_TABLES.has(String(q.table))) return null;
  if (!MUTATIONS.has(String(q.action))) return null;
  if (TELEPHONY_ADMIN_ROLES.has(String(user?.role || ''))) return null;
  return 'Only an admin can change services and roles.';
}

// Deleting a lead is irreversible and takes its history with it: appointments, payments, call and
// office recordings all key off meta_lead_id and NO foreign key protects them, so the row simply
// vanishes and its records are orphaned. The Lead-import table offers the button to a Super Admin
// only — and this is where that actually holds, because hiding the button stops nobody who can post
// to this endpoint directly (the same reasoning as the two guards above).
// Deletes that destroy a business record, restricted to a Super Admin. Both are irreversible and
// both take history with them: a lead's appointments, payments and recordings key off
// meta_lead_id with NO foreign key, and a payment IS the revenue record — removing one changes
// what every report says was collected.
const RESTRICTED_DELETE: Record<string, string> = {
  leads: 'Only a Super Admin can delete a lead.',
  payments: 'Only a Super Admin can delete a payment.',
};
// Exported so the rule can be tested against the REAL function rather than a copy of it.
export function validateLeadDelete(q: any, user: any): string | null {
  if (!q || String(q.action) !== 'delete') return null;
  const msg = RESTRICTED_DELETE[String(q.table)];
  if (!msg) return null;
  if (String(user?.role || '') === 'Super Admin') return null;
  return msg;
}

export function registerDataRoutes(app: Express) {
  app.post('/db/query', requireAuth, async (req: Request, res: Response) => {
    const q = req.body || {};
    const tErr = validateTelephonyWrite(q, req.user);
    if (tErr) { res.status(403).json({ data: null, error: { message: tErr }, count: null }); return; }
    const oErr = validateOrgWrite(q, req.user);
    if (oErr) { res.status(403).json({ data: null, error: { message: oErr }, count: null }); return; }
    const dErr = validateLeadDelete(q, req.user);
    if (dErr) { res.status(403).json({ data: null, error: { message: dErr }, count: null }); return; }
    // Domain rule (mirrors the frontend): a coach profile whose consultation status is
    // "Will Join Immediately" MUST carry a review date. Enforced here too so the DB can never
    // hold a "join" record without the follow-up date, even if the client check is bypassed.
    const gErr = validateCoachProfileWrite(q);
    if (gErr) { res.status(400).json({ data: null, error: { message: gErr }, count: null }); return; }
    const r = await runQuery(q);
    res.json({ data: r.data, error: r.error, count: r.count });
    // A DID/extension write changes which Smartflo CDR records count as OURS. configuredCallerNumbers
    // caches that set for 60s, so without this drop a call placed in the first minute after saving a
    // new DID would fail isOwnCallRecord and be discarded by syncProvider as an external call.
    if (!r.error && q.table === 'app_users' && MUTATIONS.has(String(q.action))) {
      try { resetCallerNumberCache(); } catch { /* cache drop must never affect the write */ }
    }
    // Real-time fan-out AFTER the response, so a slow/failed notify can never delay or break the
    // write itself. Only successful mutations notify. This one hook covers every page and role
    // because every write in the app already funnels through this endpoint — see events.ts.
    if (!r.error && q.table && MUTATIONS.has(String(q.action))) {
      try { broadcastChange(String(q.table)); } catch { /* never let notification break a write */ }
    }
  });
}
