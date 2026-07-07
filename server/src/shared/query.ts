import { pool } from './db';

// ============================================================
// One SQL engine, shared by the HTTP /db/query gateway (for the browser client)
// and the server-side Supabase-compatible shim (for meta sync / telephony).
// Builds parameterized SQL from a query descriptor and returns { data, error }.
// ============================================================

const TABLES = new Set([
  'leads', 'appointments', 'payments', 'assignees', 'csv_leads', 'csv_import_batches',
  'call_recordings', 'lead_activity', 'app_users', 'app_settings', 'meta_tokens',
  'meta_sync_state', 'source_connections',
]);
const IDENT = /^[a-z_][a-z0-9_]*$/i;
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
  return 'NULL';
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
      if (d.limit != null) sql += ` LIMIT ${Number(d.limit)}`;
      if (d.offset != null) sql += ` OFFSET ${Number(d.offset)}`;
      const r = await pool.query(sql, params);
      // Never leak the password hash to the client.
      if (table === 'app_users') r.rows.forEach((row: any) => { if (row) delete row.password_hash; });
      return { data: d.single ? (r.rows[0] ?? null) : r.rows, error: null, count: r.rowCount };
    }

    if (action === 'insert' || action === 'upsert') {
      const rows = Array.isArray(d.values) ? d.values : [d.values];
      if (!rows.length) return { data: d.returning ? [] : null, error: null, count: 0 };
      const cols: string[] = Array.from(new Set<string>(rows.flatMap((r: any) => Object.keys(r) as string[]))).filter((c: string) => IDENT.test(c));
      const tuples = rows.map((row: any) =>
        '(' + cols.map((c: string) => { params.push(coerce(row[c])); return '$' + params.length; }).join(',') + ')');
      let sql = `INSERT INTO ${q(table)} (${cols.map(q).join(',')}) VALUES ${tuples.join(',')}`;
      if (action === 'upsert') {
        const oc = String(d.onConflict || '').split(',').map((c) => c.trim()).filter(Boolean);
        const conflict = oc.length ? `(${oc.map(q).join(',')})` : '';
        const setCols = cols.filter((c) => !oc.includes(c));
        if (d.ignoreDuplicates || !setCols.length) sql += ` ON CONFLICT ${conflict} DO NOTHING`;
        else sql += ` ON CONFLICT ${conflict} DO UPDATE SET ${setCols.map((c) => `${q(c)}=EXCLUDED.${q(c)}`).join(',')}`;
      }
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      return { data: d.returning ? (d.single ? (r.rows[0] ?? null) : r.rows) : null, error: null, count: r.rowCount };
    }

    if (action === 'update') {
      const vals = d.values || {};
      const cols = Object.keys(vals).filter((c) => IDENT.test(c));
      const setSql = cols.map((c) => { params.push(coerce(vals[c])); return `${q(c)}=$${params.length}`; }).join(', ');
      let sql = `UPDATE ${q(table)} SET ${setSql}` + buildWhere(d.filters, params);
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      return { data: d.returning ? (d.single ? (r.rows[0] ?? null) : r.rows) : null, error: null, count: r.rowCount };
    }

    if (action === 'delete') {
      let sql = `DELETE FROM ${q(table)}` + buildWhere(d.filters, params);
      if (d.returning) sql += ' RETURNING *';
      const r = await pool.query(sql, params);
      return { data: d.returning ? r.rows : null, error: null, count: r.rowCount };
    }

    throw new Error('unknown action: ' + action);
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'query error' }, count: null };
  }
}
