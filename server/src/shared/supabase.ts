import { runQuery } from './query';

// Drop-in replacement for the Supabase JS client, backed directly by the
// PostgreSQL pool (no HTTP). Exposes the subset of the supabase-js query
// builder that the server (meta sync + telephony) uses, so those modules run
// unchanged against the migrated database.

class QueryBuilder {
  private d: any;
  constructor(table: string) {
    this.d = { table, action: 'select', select: '*', filters: [], order: [], limit: null, offset: null, single: false, values: null, onConflict: null, ignoreDuplicates: false, returning: false };
  }
  select(cols = '*') {
    if (this.d.action === 'select') this.d.select = cols || '*';
    else { this.d.returning = true; if (cols && cols !== '*') this.d.select = cols; }
    return this;
  }
  insert(v: any) { this.d.action = 'insert'; this.d.values = v; return this; }
  update(v: any) { this.d.action = 'update'; this.d.values = v; return this; }
  upsert(v: any, opts?: any) { this.d.action = 'upsert'; this.d.values = v; this.d.onConflict = opts?.onConflict || null; this.d.ignoreDuplicates = !!opts?.ignoreDuplicates; return this; }
  delete() { this.d.action = 'delete'; return this; }
  eq(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'eq', val: v }); return this; }
  neq(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'neq', val: v }); return this; }
  in(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'in', val: v }); return this; }
  lt(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'lt', val: v }); return this; }
  lte(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'lte', val: v }); return this; }
  gt(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'gt', val: v }); return this; }
  gte(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'gte', val: v }); return this; }
  like(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'like', val: v }); return this; }
  ilike(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'ilike', val: v }); return this; }
  is(c: string, v: any) { this.d.filters.push({ type: 'op', col: c, op: 'is', val: v }); return this; }
  not(c: string, op: string, v: any) { this.d.filters.push({ type: 'not', col: c, op, val: v }); return this; }
  or(expr: string) { this.d.filters.push({ type: 'or', expr }); return this; }
  order(c: string, opts?: any) { this.d.order.push({ col: c, asc: !(opts && opts.ascending === false) }); return this; }
  limit(n: number) { this.d.limit = n; return this; }
  range(a: number, b: number) { this.d.offset = a; this.d.limit = b - a + 1; return this; }
  single() { this.d.single = true; return this; }
  maybeSingle() { this.d.single = true; return this; }
  private exec() { if (this.d.action === 'select') this.d.returning = true; return runQuery(this.d); }
  then(resolve: any, reject: any) { return this.exec().then(resolve, reject); }
  catch(reject: any) { return this.exec().catch(reject); }
}

export const supabase: any = {
  from: (table: string) => new QueryBuilder(table),
};
