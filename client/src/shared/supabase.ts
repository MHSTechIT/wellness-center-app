// ============================================================
// Postgres-backed drop-in replacement for the Supabase browser client.
// NO @supabase/supabase-js, NO realtime websocket, NO supabase.co calls.
// All data/auth/storage go through our own Express backend (which talks to
// PostgreSQL). The public interface matches the subset of supabase-js the app
// uses, so app.ts needs zero changes.
// ============================================================

const _rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
// "auto" resolves the API from WHEREVER THE PAGE WAS LOADED (that host, port 4100) instead of a
// baked IP. DHCP moved this machine's LAN address twice in one week (.121 -> .3 -> .25), and each
// time every request silently hung against the stale IP until someone edited .env.local. With
// "auto", localhost serves localhost, and a laptop opening http://<ip>:3000 talks to <ip>:4100 -
// whatever the ip happens to be today. "" still means same-origin (the production single-server).
const API_BASE = _rawBase === "auto"
  ? (typeof window !== "undefined" ? window.location.protocol + "//" + window.location.hostname + ":4100" : "")
  : _rawBase;
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
// Tell the server this session is still alive (PRD §16). Without a beat, last_activity_at never
// advances: the staleness sweep then closes every session at its LOGIN time, so the dashboard
// reported real working sessions as 0m and "Session expired" — which is exactly what it did.
// Returns the session id to use from here on: the server re-opens one if this tab's was already
// swept (a laptop reopened after lunch), and that new id has to replace the stored one.
export async function beatSession(): Promise<void> {
  try {
    const s = readSession();
    if (!s?.access_token || s.access_token === "local") return;
    const r = await fetch(api("/auth/heartbeat"), {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ sessionId: s.sessionId || "" }),
    });
    const j = await r.json();
    if (j && j.sessionId && String(j.sessionId) !== String(s.sessionId || "")) {
      saveSession({ ...s, sessionId: String(j.sessionId) });
    }
  } catch { /* a missed beat is recoverable — the next one lands, or the sweep closes it honestly */ }
}

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
      // sessionId ties this browser to the user_sessions row the login just opened, so the
      // heartbeat and the sign-out below update THAT session rather than guessing at one.
      const session = { user: { email: j.email }, access_token: j.token, sessionId: j.sessionId || "" };
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
      if (j.token) saveSession({ user: { email: j.email }, access_token: j.token, sessionId: j.sessionId || "" });
      return { data: { user: { email: j.email } }, error: null };
    } catch (e: any) { return { data: {}, error: { message: e?.message || "network error" } }; }
  },
  async signOut() {
    // Close the activity session BEFORE dropping the token — afterwards there is nothing left to
    // authenticate the call with, and the session would sit "online" until it timed out (§17).
    // Best-effort and awaited only briefly: signing out must never hang on monitoring.
    try {
      const s = readSession();
      if (s?.access_token && s.access_token !== "local") {
        await fetch(api("/auth/logout"), {
          method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ sessionId: s.sessionId || "" }), keepalive: true,
        });
      }
    } catch { /* a failed close is swept up by the staleness rule server-side */ }
    clearSession(); return { error: null };
  },
  onAuthStateChange(_cb: any) { return { data: { subscription: { unsubscribe() { /* no-op */ } } } }; },
};

// Base64 for ONE slice. FileReader encodes natively with no intermediate JS string; the chunked
// loop is the fallback for anywhere FileReader is missing. Applied per part, so peak memory is
// one part rather than the whole recording — the old whole-file path built a ~157 MB UTF-16
// string for a 78 MB recording and then two more copies for the base64 and the JSON body.
async function toB64(part: Blob): Promise<string> {
  if (typeof FileReader !== "undefined") {
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => { const s = String(fr.result || ""); const i = s.indexOf(","); resolve(i >= 0 ? s.slice(i + 1) : ""); };
      fr.onerror = () => reject(fr.error || new Error("could not read the file"));
      fr.readAsDataURL(part);
    });
  }
  const buf = new Uint8Array(await part.arrayBuffer());
  let bin = ""; const CH = 0x8000;
  for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CH)));
  return btoa(bin);
}

// 6 MB of raw bytes becomes ~8 MB of base64 — a request comfortably inside every limit in the
// path. Small enough that nothing in front of the API has an opinion about it; large enough that
// a two-hour recording is ~10 requests, not hundreds.
const PART_BYTES = 6 * 1024 * 1024;
// Below this a single request is simpler and one round trip faster, and it keeps every existing
// caller (payment proofs, report attachments) on exactly the path it has always used.
const CHUNK_ABOVE = 8 * 1024 * 1024;

/** Read a server response that may not be JSON at all. A size cap IN FRONT of the API (nginx and
 *  friends) answers an oversize body with its own HTML page, and r.json() then threw
 *  "Unexpected token '<'" — a parser complaint that reached the user verbatim on a recovered
 *  87-minute recording and told them nothing. Translate it into the real cause instead. */
async function readUploadReply(r: Response, approxMb: number): Promise<any> {
  const ct = r.headers.get("content-type") || "";
  const rawBody = await r.text();
  if (ct.indexOf("json") < 0) {
    const tooBig = r.status === 413 || /too large|entity too large/i.test(rawBody);
    return { error: tooBig
      ? ("Upload rejected as too large (~" + approxMb + " MB). The request was refused before it reached the app, so the size limit in front of the server is what has to allow it. The file is not lost.")
      : ("The server returned an unexpected " + r.status + " response instead of JSON, so the upload did not complete. The file is not lost.") };
  }
  try { return JSON.parse(rawBody); }
  catch (_) { return { error: "The server sent a malformed response (HTTP " + r.status + "). The file is not lost." }; }
}

// ---- Storage (files → backend disk, replaces Supabase Storage) ----
function storageBucket(bucket: string) {
  return {
    /** `onProgress(sent, total)` reports bytes accepted by the server, so a long upload can show
     *  movement instead of looking hung for a minute and a half. */
    async upload(path: string, file: any, _opts?: any, onProgress?: (sent: number, total: number) => void) {
      const full = bucket + "/" + path;
      const size = Number(file && file.size) || 0;
      try {
        // ---- Large file: send it in PARTS. This is what makes duration stop mattering. One
        // request per 6 MB means a two-hour consultation and a two-minute one take the same path,
        // and neither goes anywhere near a body limit. See /storage/upload-part for the rest.
        if (size > CHUNK_ABOVE && typeof file.slice === "function") {
          const uploadId = "up" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
          const parts = Math.ceil(size / PART_BYTES);
          for (let i = 0; i < parts; i++) {
            const slice = file.slice(i * PART_BYTES, Math.min(size, (i + 1) * PART_BYTES));
            const dataB64 = await toB64(slice);
            let j: any = null, lastErr = "";
            // A part is small enough to be worth retrying: a network blip during a long upload
            // should cost one part, not the whole consultation.
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                const r = await fetch(api("/storage/upload-part"), {
                  method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
                  body: JSON.stringify({ uploadId, path: full, seq: i, dataB64, last: i === parts - 1, contentType: file.type || "application/octet-stream" }),
                });
                j = await readUploadReply(r, Math.round(dataB64.length / 1048576));
                if (!j.error) break;
                lastErr = j.error;
              } catch (e: any) { lastErr = e?.message || "network error"; }
              await new Promise((r2) => setTimeout(r2, 400 * (attempt + 1)));
            }
            if (!j || j.error) {
              // Leave no half-written scratch file behind for a recording that never completed.
              try { await fetch(api("/storage/upload-abort"), { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ uploadId }) }); } catch (_) { /* the server sweeps it anyway */ }
              return { data: null, error: { message: (lastErr || "upload failed") + " (part " + (i + 1) + " of " + parts + ")" } };
            }
            if (onProgress) { try { onProgress(Math.min(size, (i + 1) * PART_BYTES), size); } catch (_) { /* reporting must never break the upload */ } }
          }
          return { data: { path: full }, error: null };
        }
        // ---- Small file: one request, exactly the path every other caller has always used. ----
        const dataB64 = await toB64(file);
        const r = await fetch(api("/storage/upload"), { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ path: full, dataB64, contentType: file.type || "application/octet-stream" }) });
        const j: any = await readUploadReply(r, Math.round(dataB64.length / 1048576));
        if (j.error) return { data: null, error: { message: j.error } };
        if (onProgress) { try { onProgress(size, size); } catch (_) { /* as above */ } }
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
    // Files actually present under a folder. Used to recover a file whose URL was never stored -
    // a proof saved as a bare filename can still be found, because the upload path is
    // <bucket>/<leadId>/<timestamp>_<sanitised name>.
    async list(prefix: string) {
      try {
        const r = await fetch(api("/storage/list/" + bucket + "/" + prefix), { headers: authHeaders() });
        if (!r.ok) return { data: [], error: { message: "list failed" } };
        const j = await r.json();
        return { data: (j && j.files) || [], error: null };
      } catch (e: any) { return { data: [], error: { message: e?.message || "list error" } }; }
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
