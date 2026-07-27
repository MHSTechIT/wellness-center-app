// ============================================================
// Postgres-backed drop-in replacement for the Supabase browser client.
// NO @supabase/supabase-js, NO realtime websocket, NO supabase.co calls.
// All data/auth/storage go through our own Express backend (which talks to
// PostgreSQL). The public interface matches the subset of supabase-js the app
// uses, so app.ts needs zero changes.
// ============================================================

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
const api = (p: string) => API_BASE + p;
const SESSION_KEY = "wos_session";
// Guards against a reload loop: if a stale/invalid token in localStorage keeps getting rejected
// (e.g. after the signed-session-token migration, or a misconfigured SESSION_SECRET server-side),
// every reload would re-send the same bad token, get another 401, and reload again — forever, with
// the user unable to ever reach the login form. Reload at most once per tab; a repeat 401 just
// shows "session expired" on the (now-blank) session instead of looping.
const RELOAD_GUARD_KEY = "wos_401reload";

function readSession(): any {
  if (typeof window === "undefined") return null;
  try { const s = window.localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
// A signed-in session always saves a fresh, presumed-valid token — clear the reload guard so a
// LATER genuine 401 (the token actually expiring) is still allowed its one auto-reload.
function saveSession(sess: any) { try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); window.sessionStorage.removeItem(RELOAD_GUARD_KEY); } catch { /* ignore */ } }
function clearSession() { try { window.localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } }

// The session's access_token is now a real server-issued, HMAC-signed token (see server/src/shared
// /session.ts) — not the old hardcoded "local" string nobody ever validated. Every backend call
// attaches it; the server rejects anything unsigned, expired, or tampered with.
export function authHeaders(): Record<string, string> {
  const s = readSession();
  const t = s?.access_token;
  return t && t !== "local" ? { Authorization: "Bearer " + t } : {};
}

async function dbQuery(descriptor: any): Promise<{ data: any; error: any; count?: number }> {
  try {
    const r = await fetch(api("/db/query"), {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(descriptor),
    });
    if (r.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && !window.sessionStorage.getItem(RELOAD_GUARD_KEY)) {
        try { window.sessionStorage.setItem(RELOAD_GUARD_KEY, "1"); } catch { /* ignore */ }
        window.location.reload();
      }
      return { data: null, error: { message: "Session expired — please sign in again." } };
    }
    return await r.json();
  } catch (e: any) {
    return { data: null, error: { message: e?.message || "network error" } };
  }
}

// Chainable query builder mirroring supabase-js (thenable → await returns {data,error}).
class QueryBuilder {
  private d: any;
  constructor(table: string) {
    this.d = { table, action: "select", select: "*", filters: [], order: [], limit: null, offset: null, single: false, values: null, onConflict: null, ignoreDuplicates: false, returning: false };
  }
  select(cols = "*") {
    if (this.d.action === "select") this.d.select = cols || "*";
    else { this.d.returning = true; if (cols && cols !== "*") this.d.select = cols; }
    return this;
  }
  insert(v: any) { this.d.action = "insert"; this.d.values = v; return this; }
  update(v: any) { this.d.action = "update"; this.d.values = v; return this; }
  upsert(v: any, opts?: any) { this.d.action = "upsert"; this.d.values = v; this.d.onConflict = opts?.onConflict || null; this.d.ignoreDuplicates = !!opts?.ignoreDuplicates; return this; }
  delete() { this.d.action = "delete"; return this; }
  eq(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "eq", val: v }); return this; }
  neq(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "neq", val: v }); return this; }
  in(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "in", val: v }); return this; }
  lt(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "lt", val: v }); return this; }
  lte(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "lte", val: v }); return this; }
  gt(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "gt", val: v }); return this; }
  gte(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "gte", val: v }); return this; }
  like(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "like", val: v }); return this; }
  ilike(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "ilike", val: v }); return this; }
  is(c: string, v: any) { this.d.filters.push({ type: "op", col: c, op: "is", val: v }); return this; }
  not(c: string, op: string, v: any) { this.d.filters.push({ type: "not", col: c, op, val: v }); return this; }
  or(expr: string) { this.d.filters.push({ type: "or", expr }); return this; }
  order(c: string, opts?: any) { this.d.order.push({ col: c, asc: !(opts && opts.ascending === false) }); return this; }
  limit(n: number) { this.d.limit = n; return this; }
  range(a: number, b: number) { this.d.offset = a; this.d.limit = b - a + 1; return this; }
  single() { this.d.single = true; return this; }
  maybeSingle() { this.d.single = true; return this; }
  private exec() { if (this.d.action === "select") this.d.returning = true; return dbQuery(this.d); }
  then(resolve: any, reject?: any) { return this.exec().then(resolve, reject); }
  catch(reject: any) { return this.exec().catch(reject); }
}

// ---- Auth (email/password against app_users, session in localStorage) ----
const auth = {
  async getSession() { return { data: { session: readSession() }, error: null }; },
  async getUser() { const s = readSession(); return { data: { user: s ? s.user : null }, error: null }; },
  async signInWithPassword({ email, password }: any) {
    try {
      const r = await fetch(api("/auth/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (j.error) return { data: { session: null }, error: { message: j.error } };
      const session = { user: { email: j.email }, access_token: j.token };
      saveSession(session);
      return { data: { session }, error: null };
    } catch (e: any) { return { data: { session: null }, error: { message: e?.message || "network error" } }; }
  },
  async signUp({ email, password }: any) {
    try {
      const r = await fetch(api("/auth/signup"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (j.error) return { data: {}, error: { message: j.error } };
      // /auth/signup also returns a session token (the same shape as login) so the new user is
      // signed in immediately instead of needing to log in again right after setting a password.
      if (j.token) saveSession({ user: { email: j.email }, access_token: j.token });
      return { data: { user: { email: j.email } }, error: null };
    } catch (e: any) { return { data: {}, error: { message: e?.message || "network error" } }; }
  },
  async signOut() { clearSession(); return { error: null }; },
  onAuthStateChange(_cb: any) { return { data: { subscription: { unsubscribe() { /* no-op */ } } } }; },
};

// ---- Storage (files → backend disk, replaces Supabase Storage) ----
function storageBucket(bucket: string) {
  return {
    async upload(path: string, file: any, _opts?: any) {
      try {
        const buf = new Uint8Array(await file.arrayBuffer());
        let bin = ""; for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        const dataB64 = btoa(bin);
        const r = await fetch(api("/storage/upload"), { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ path: bucket + "/" + path, dataB64, contentType: file.type || "application/octet-stream" }) });
        const j = await r.json();
        if (j.error) return { data: null, error: { message: j.error } };
        return { data: { path: j.path }, error: null };
      } catch (e: any) { return { data: null, error: { message: e?.message || "upload error" } }; }
    },
    // A plain <img src>/download link can't carry a header, so the file route also accepts the
    // session token as a query param (see server/src/shared/session.ts) — this is what actually
    // closes the "download any patient's file with no auth" hole, not just the upload side.
    getPublicUrl(path: string) {
      const s = readSession(); const t = s?.access_token;
      const q = t && t !== "local" ? ("?token=" + encodeURIComponent(t)) : "";
      return { data: { publicUrl: api("/storage/files/" + bucket + "/" + path) + q } };
    },
    async remove(_paths: string[]) { return { data: null, error: null }; },
  };
}

// ---- Realtime: no-op (removes the supabase websocket entirely). The app
// already refreshes via polling / manual sync, so live updates degrade cleanly.
function channel(_name: string) {
  const ch: any = { on() { return ch; }, subscribe() { return ch; }, unsubscribe() { return ch; } };
  return ch;
}

export const supabase: any = {
  from: (table: string) => new QueryBuilder(table),
  auth,
  storage: { from: (bucket: string) => storageBucket(bucket) },
  channel,
  removeChannel(_ch: any) { /* no-op */ },
  removeAllChannels() { /* no-op */ },
};
