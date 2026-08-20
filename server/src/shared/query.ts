import { pool } from './db';

// ============================================================
// One SQL engine, shared by the HTTP /db/query gateway (for the browser client)
// and the server-side Supabase-compatible shim (for meta sync / telephony).
// Builds parameterized SQL from a query descriptor and returns { data, error }.
// ============================================================

const TABLES = new Set([
  'leads', 'appointments', 'payments', 'assignees', 'csv_leads', 'csv_import_batches',
  'call_recordings', 'lead_activity', 'app_users', 'app_settings', 'meta_tokens',
  'meta_sync_state', 'source_connections', 'lead_assignments', 'office_recordings',
  'zoom_recordings',
  // Blood Test module (db/migration-bloodtest-module.sql). This allowlist is a real access
  // control, not a formality — the gateway reaches any table named here — so new tables must be
  // added deliberately. These four are module-owned and carry no credentials.
  'bt_tests', 'bt_lab_partners', 'bt_coupons', 'bt_orders',
  // Services & roles master (db/migration-org-services-roles.sql). Every signed-in client READS
  // these to build the user form and the nav gating, so they must be reachable. WRITES are a
  // different matter — org_roles.modules decides which screens a role can open, so an unrestricted
  // write here would let any authenticated user grant themselves the admin screen. See
  // validateOrgWrite in routes/data.ts, which limits mutations to the admin roles.
  'org_services', 'org_roles', 'org_role_services',
  // Physiotherapy pricing master (db/migration-physio-pricing.sql) — read by every client for the
  // Physio page's pricing card and payment amounts; edited from Settings → Service pricing.
  'physio_pricing',
  // BDM requisitions (self-applying schema) — the coach's frozen deal snapshot awaiting BDM
  // approval. Read by the coach (own requests) and the BDM page; approval writes leads.enrolled_at
  // through the normal update path. No credentials, no money movement of its own.
  'bdm_requests',
  // Thyrocare payout ledger (db/migration-thyrocare-payouts.sql) — Accounts & finance → Blood test
  // — Thyrocare tab. Records of real money transfers to the lab partner; no credentials.
  'thyrocare_payouts',
  // Physiotherapy payout ledger (self-applying schema) — Accounts & finance → Physiotherapy tab.
  // Records of real money sent to the physio provider/team; no credentials.
  'physio_payouts',
  // Per-advisor monthly targets (self-applying schema) — Settings → Advisor targets, read live by
  // the Health Advisor dashboard for its Targets & performance and Pipeline performance cards.
  // The table was added to the schema without being added HERE, so it was created on every boot and
  // then refused by this gate on every read and write: "Save failed: unknown table: advisor_targets",
  // with the dashboard quietly falling back to its built-in defaults because a failed read looks the
  // same as no row. A new table needs BOTH entries. Targets only, no credentials and no money.
  'advisor_targets',
  // Per-advisor daily lead allocation (self-applying schema) — Settings → Advisor targets. Read by
  // the settings table and by the auto-assigner; holds counts only, no credentials.
  'advisor_lead_targets',
  // Auto-assignment on/off per day (self-applying schema). READ by every client so the settings
  // screen can show the state; WRITES go through /api/meta/autoassign/control, which is Super-Admin
  // gated. Listing it here is not a way around that gate — see the route.
  'auto_assign_control',
  // Direct Upload audit (self-applying schema). Read-only from the client — every WRITE goes through
  // /api/leadimport/*, which validates, previews and applies inside one transaction.
  'lead_import_batches', 'lead_import_changes',
]);
const IDENT = /^[a-z_][a-z0-9_]*$/i;
// A caller with no limit at all (or an absurdly large one) could pull an entire table in one
// request — confirmed live pre-auth as a 3.4MB unbounded `leads` dump. Now that every request
// requires a session (see requireAuth), this is mainly resource protection rather than an
// exfiltration vector, so the cap is generous: comfortably above every legitimate call site in the
// app today (the largest, a client-ID-prefix scan, pulls a single narrow column) while still
// refusing to hand back an unbounded result set.
const MAX_SELECT_LIMIT = 5000;
const OP_SQL: Record<string, string> = {
  eq: '=', neq: '<>', lt: '<', lte: '<=', gt: '>', gte: '>=', like: 'LIKE', ilike: 'ILIKE',
};

function q(id: string): string {
  if (!IDENT.test(id)) throw new Error('invalid identifier: ' + id);
  return '"' + id + '"';
}
function coerce(v: any): any {
  if (v !== null && v !== undefined && typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
  return v === undefined ? null : v;
}
function isLiteral(val: any): string {
  const s = String(val).toLowerCase();
  if (val === null || s === 'null') return 'NULL';
  if (val === true || s === 'true') return 'TRUE';
  if (val === false || s === 'false') return 'FALSE';
  // .is() only ever means null/true/false (that's its whole contract) — silently falling back to
  // NULL for anything else meant a typo'd or unexpected value quietly flipped a filter's meaning
  // instead of failing loudly (confirmed live: {op:"is",val:"not null"} matched rows that WERE
  // null, the opposite of what it reads as).
  throw new Error(`invalid .is() value: ${JSON.stringify(val)} (must be null, true, or false)`);
}
function parseOr(expr: string, params: any[]): string {
  return expr.split(',').map((part) => {
    const dot = part.indexOf('.');
    const col = part.slice(0, dot);
    const rest = part.slice(dot + 1);
    const dot2 = rest.indexOf('.');
    const op = rest.slice(0, dot2);
    const val = rest.slice(dot2 + 1);
    if (op === 'is') return `${q(col)} IS ${isLiteral(val)}`;
    const sql = OP_SQL[op];
    if (!sql) throw new Error('unsupported or-op: ' + op);
    params.push(val);
    return `${q(col)} ${sql} $${params.length}`;
  }).join(' OR ');
}
function buildWhere(filters: any[], params: any[]): string {
  const clauses: string[] = [];
  for (const f of filters || []) {
    if (f.type === 'or') { clauses.push('(' + parseOr(f.expr, params) + ')'); continue; }
    if (f.type === 'not') {
      if (f.op === 'is') { clauses.push(`${q(f.col)} IS NOT ${isLiteral(f.val)}`); continue; }
      params.push(f.val); clauses.push(`NOT (${q(f.col)} ${OP_SQL[f.op] || '='} $${params.length})`); continue;
    }
    if (f.op === 'is') { clauses.push(`${q(f.col)} IS ${isLiteral(f.val)}`); continue; }
    if (f.op === 'in') { params.push(f.val || []); clauses.push(`${q(f.col)} = ANY($${params.length})`); continue; }
    const sql = OP_SQL[f.op];
    if (!sql) throw new Error('unsupported op: ' + f.op);
    params.push(f.val); clauses.push(`${q(f.col)} ${sql} $${params.length}`);
  }
  return clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
}
function selectCols(sel: string): string {
  if (!sel || sel === '*') return '*';
  return sel.split(',').map((c) => q(c.trim())).join(', ');
}

// Never leak the password hash to the client. This used to live inline in the 'select' branch
// only, but insert/upsert/update/delete all append `RETURNING *` and returned their rows
// unfiltered — so a write against app_users handed back every scrypt hash it touched. Applied at
// every exit point instead. Removing a field no client has ever read: no caller changes.
function redact(table: string, rows: any[]): void {
  if (table !== 'app_users' || !Array.isArray(rows)) return;
  rows.forEach((row: any) => { if (row) delete row.password_hash; });
}

export async function runQuery(d: any): Promise<{ data: any; error: any; count: number | null }> {
  try {
    const table = String(d.table || '');
    if (!TABLES.has(table)) throw new Error('unknown table: ' + table);
    const action = d.action || 'select';
    const params: any[] = [];

    if (action === 'select') {
      let sql = `SELECT ${selectCols(d.select)} FROM ${q(table)}` + buildWhere(d.filters, params);
      if (Array.isArray(d.order) && d.order.length)
        sql += ' ORDER BY ' + d.order.map((o: any) => `${q(o.col)} ${o.asc ? 'ASC' : 'DESC'}`).join(', ');
      const effectiveLimit = d.limit != null ? Math.min(Number(d.limit), MAX_SELECT_LIMIT) : MAX_SELECT_LIMIT;
      sql += ` LIMIT ${effectiveLimit}`;
      if (d.offset != null) sql += ` OFFSET ${Number(d.offset)}`;
      const r = await pool.query(sql, params);
      redact(table, r.rows);
      return { data: d.single ? (r.rows[0] ?? null) : r.rows, error: null, count: r.rowCount };
    }

    if (action === 'insert' || action === 'upsert') {
      const rows = Array.isArray(d.values) ? d.values : [d.values];
      if (!rows.length) return { data: d.returning ? [] : null, error: null, count: 0 };
      // A value written as {preserve: v} means: insert v for a NEW row, but on conflict keep the
      // existing row's value when it is non-empty. This is how a sync seeds a field without
      // clobbering a human's later correction (first user: leads.sugar_poll vs the advisor).
      const preserveCols = new Set<string>();
      const unwrap = (v: any) => {
        if (v !== null && typeof v === 'object' && !Array.isArray(v) && 'preserve' in v && Object.keys(v).length === 1) return { v: v.preserve, p: true };
        return { v, p: false };
      };
      const cols: string[] = Array.from(new Set<string>(rows.flatMap((r: any) => Object.keys(r) as string[]))).filter((c: string) => IDENT.test(c));
      const tuples = rows.map((row: any) =>
        '(' + cols.map((c: string) => { const u = unwrap(row[c]); if (u.p) preserveCols.add(c); params.push(coerce(u.v)); return '$' + params.length; }).join(',') + ')');
      let sql = `INSERT INTO ${q(table)} (${cols.map(q).join(',')}) VALUES ${tuples.join(',')}`;
      if (action === 'upsert') {
        const oc = String(d.onConflict || '').split(',').map((c) => c.trim()).filter(Boolean);
        const conflict = oc.length ? `(${oc.map(q).join(',')})` : '';
        const setCols = cols.filter((c) => !oc.includes(c));
        if (d.ignoreDuplicates || !setCols.length) sql += ` ON CONFLICT ${conflict} DO NOTHING`;
        else sql += ` ON CONFLICT ${conflict} DO UPDATE SET ${setCols.map((c) =>
          preserveCols.has(c)
            ? `${q(c)}=COALESCE(NULLIF(${q(table)}.${q(c)},''),EXCLUDED.${q(c)})`
            : `${q(c)}=EXCLUDED.${q(c)}`).join(',')}`;
      }
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      redact(table, r.rows);
      return { data: d.returning ? (d.single ? (r.rows[0] ?? null) : r.rows) : null, error: null, count: r.rowCount };
    }

    if (action === 'update') {
      const vals = d.values || {};
      const cols = Object.keys(vals).filter((c) => IDENT.test(c));
      const setSql = cols.map((c) => { params.push(coerce(vals[c])); return `${q(c)}=$${params.length}`; }).join(', ');
      let sql = `UPDATE ${q(table)} SET ${setSql}` + buildWhere(d.filters, params);
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      redact(table, r.rows);
      return { data: d.returning ? (d.single ? (r.rows[0] ?? null) : r.rows) : null, error: null, count: r.rowCount };
    }

    if (action === 'delete') {
      let sql = `DELETE FROM ${q(table)}` + buildWhere(d.filters, params);
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      redact(table, r.rows);
      return { data: d.returning ? r.rows : null, error: null, count: r.rowCount };
    }

    throw new Error('unknown action: ' + action);
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'query error' }, count: null };
  }
}
