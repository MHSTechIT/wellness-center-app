// ============================================================
// Tata Tele / Smartflo click-to-call integration (server-side ONLY).
// The API key never leaves the server. Behaviour mirrors the reference spec:
//  - click_to_call: raw Authorization header (NOT "Bearer"), async dial,
//    custom_identifier echoed back in the webhook, body-level error detection.
//  - recordings re-hosted to Supabase Storage (Vercel has no persistent disk).
// ============================================================
import { supabase } from '../shared/supabase';

const SMARTFLO_URL = 'https://api-smartflo.tatateleservices.com/v1/click_to_call';
const SMARTFLO_SUPPORT_URL = 'https://api-smartflo.tatateleservices.com/v1/click_to_call_support';
const RECORD_BUCKET = 'call-recordings';

// Read an env var by any of the given aliases, returning the first NON-EMPTY value.
// process.env is case-sensitive, so we accept both the lowercase names configured in
// .env.local (tata_tele_api_key, …) and the legacy UPPERCASE names (TATA_TELE_API_KEY, …).
function envAny(...names: string[]): string {
  for (const n of names) { const v = process.env[n]; if (v != null && String(v).trim() !== '') return String(v).trim(); }
  return '';
}

// The single source of truth for Tata Tele credentials/config used by every call path.
// Lowercase (.env.local) names take precedence over the legacy uppercase names.
//
// ROLE-BASED CONFIG: each page (advisor / coach / reception) can click-to-call with its OWN
// agent extension + caller ID — e.g. tata_tele_default_extension_number_advisor,
// tata_tele_caller_id_reception — so calls ring the right desk phone and show the right
// caller ID for that team. A role with no override falls back to the plain (unsuffixed)
// vars, so existing single-config setups keep working unchanged. The API key is shared
// across roles (same Tata account) unless a role-specific key is explicitly set too.
// A role can be written many ways in .env — accept the short form the pages send
// (advisor/coach/reception) AND the descriptive forms operators tend to type
// (health_advisor/health_coach/reception). Each maps to a list of suffix aliases we try.
const ROLE_ALIASES: Record<string, string[]> = {
  advisor: ['advisor', 'health_advisor'],
  coach: ['coach', 'health_coach'],
  reception: ['reception', 'receptionist'],
};

export function tataConfig(role?: string) {
  const r = (role || '').trim().toLowerCase();
  const aliases = ROLE_ALIASES[r] || (r ? [r] : []);
  // For each alias try lowercase (base_alias) then UPPERCASE (BASEUPPER_ALIAS); then fall back
  // to the unsuffixed base (lowercase then UPPERCASE). First non-empty value wins. This lets
  // tata_tele_caller_id_advisor, TATA_TELE_CALLER_ID_HEALTH_ADVISOR, etc. all resolve.
  const resolve = (base: string, baseUpper: string) => {
    const names: string[] = [];
    for (const a of aliases) { names.push(base + '_' + a, baseUpper + '_' + a.toUpperCase()); }
    names.push(base, baseUpper);
    return envAny(...names);
  };
  return {
    apiKey: resolve('tata_tele_api_key', 'TATA_TELE_API_KEY'),
    extension: resolve('tata_tele_default_extension_number', 'TATA_TELE_DEFAULT_EXTENSION_NUMBER'),
    // Smartflo's caller_id (DID) must be plain digits — the working base ID is stored as
    // "919240254219", but the per-role ones were entered as "+9192…". The leading "+" makes
    // Smartflo reject the call ("agent offline"/invalid), which is exactly why Super Admin
    // (base, no "+") dials fine while advisor/coach/reception fail. Strip non-digits so every
    // role dials with the accepted format regardless of how the DID was typed in the env.
    callerId: normalizeCallerId(resolve('tata_tele_caller_id', 'TATA_TELE_CALLER_ID')),
    agentNumber: resolve('tata_tele_default_agent_number', 'TATA_TELE_DEFAULT_AGENT_NUMBER'),
    useSupportFallback: envAny('tata_tele_use_support_fallback', 'TATA_TELE_USE_SUPPORT_FALLBACK') === '1',
    role: r || null,
  };
}

// Caller-ID (DID) normalisation: Smartflo wants plain digits (country code + number), no "+",
// spaces or dashes. Keeps "919240254219" as-is and turns "+919240223973" into "919240223973".
export function normalizeCallerId(raw: string): string { return (raw || '').replace(/\D/g, ''); }

// PER-USER config. DID + extension are now editable per person in Settings → Users & Assignees
// (app_users.tata_did / .tata_extension), so a call rings that individual's desk and shows their
// own caller ID instead of one shared per-role number.
//
// Resolution LAYERS, never replaces: user → role env → base env. A hard switch to user-only would
// 503 every existing account the moment this shipped, since none of them have a DID yet.
//
// The API key is deliberately NOT per-user: it is one account-level secret for the whole clinic,
// and app_users is readable by any authenticated session through the /db/query gateway.
export async function tataConfigForUser(email?: string | null, role?: string) {
  const base = tataConfig(role);
  const e = String(email || '').trim().toLowerCase();
  if (!e) return base;
  try {
    const { data } = await supabase.from('app_users').select('tata_did,tata_extension').eq('email', e).limit(1);
    const u = data && data[0];
    if (!u) return base;
    const did = normalizeCallerId(String(u.tata_did || ''));
    const ext = String(u.tata_extension || '').trim();
    return {
      ...base,
      callerId: did || base.callerId,
      extension: ext || base.extension,
      perUser: !!(did || ext),
    };
  } catch { return base; }
}

// Every extension + caller ID configured for this clinic — the per-role env values AND every
// per-user DID/extension in app_users. Used to recognise a Smartflo CDR record as GENUINELY
// placed through this app's click-to-call — see isOwnCallRecord below for which raw fields to
// compare this against and why. Digits-only, deduped, empty strings dropped.
//
// INACTIVE users are included on purpose: this set also decides whether a HISTORICAL call can be
// re-synced. Filtering to active users would make an ex-employee's past calls fail isOwnCallRecord
// and get silently discarded by syncProvider (skippedExternal), erasing them from Call History.
//
// Cached: syncProvider calls this once per request, and it is now a DB read rather than an env
// lookup. 60s is far shorter than any realistic DID-change-to-next-call gap.
let _numCache: { at: number; set: Set<string> } | null = null;
const NUM_CACHE_MS = 60 * 1000;

function envCallerNumbers(): Set<string> {
  const out = new Set<string>();
  const add = (v: string) => { const d = (v || '').replace(/\D/g, ''); if (d) out.add(d); };
  for (const role of [undefined, 'advisor', 'coach', 'reception']) {
    const cfg = tataConfig(role);
    add(cfg.extension);
    add(cfg.callerId);
  }
  return out;
}

export async function configuredCallerNumbers(nowMs: number = Date.now()): Promise<Set<string>> {
  if (_numCache && nowMs - _numCache.at < NUM_CACHE_MS) return _numCache.set;
  const out = envCallerNumbers();
  try {
    const { data } = await supabase.from('app_users').select('tata_did,tata_extension');
    for (const u of data || []) {
      for (const v of [u.tata_did, u.tata_extension]) {
        const d = String(v || '').replace(/\D/g, '');
        if (d) out.add(d);
      }
    }
  } catch { /* env-only fallback — better than an empty set, which would drop every call */ }
  _numCache = { at: nowMs, set: out };
  return out;
}

// Invalidate after a DID/extension write so the next sync sees it without waiting out the TTL.
export function resetCallerNumberCache() { _numCache = null; }

// Does this Smartflo CDR record match one of OUR configured extensions/caller IDs — i.e. was it
// genuinely dialled through this app's click-to-call, not some other line entirely?
//
// The field that looks obvious, agent_number (and from_number, which mirrors it), is the WRONG
// one to check: it reports whichever physical device/mobile actually rang for that extension,
// which varies by device and never matches the extension/caller-ID strings in .env — confirmed
// against a call we know for certain was genuine (agent_number +918940850291, matching neither
// tata_tele_default_extension_number_advisor=0606089050073 nor
// tata_tele_caller_id_advisor=919240223973). Checking it would hide real calls, not just external
// ones.
//
// extension_c2c and caller_id_num/did_number are the numbers WE told Tata to dial from and show
// to the customer — Smartflo reports these back exactly as configured. Verified on the same two
// calls: the genuine one has extension_c2c=0606089050073 and caller_id_num=+919240223973 (an
// EXACT match to the advisor config); three confirmed-external calls to a different lead (from
// "Gayathri-Extension", never triggered from this app) have extension_c2c=0606089050013 and
// caller_id_num=+919240284585 — matching nothing we configure, on every one of them.
export function isOwnCallRecord(raw: any, known: Set<string>): boolean {
  const cand = [raw?.extension_c2c, raw?.caller_id_num, raw?.did_number];
  for (const c of cand) {
    const d = String(c || '').replace(/\D/g, ''); if (!d) continue;
    if (known.has(d)) return true;
    const last10 = d.slice(-10);
    for (const k of known) { if (k === last10 || k.slice(-10) === last10) return true; }
  }
  return false;
}

// Phone normalisation: strip non-digits, take last 10, prefix +91.
export function normalizePhone(raw: string): string {
  const last10 = (raw || '').replace(/\D/g, '').slice(-10);
  return last10 ? '+91' + last10 : '';
}
export function digits10(raw: string): string { return (raw || '').replace(/\D/g, '').slice(-10); }

// Smartflo can return HTTP 200 with a body-level failure — treat these as failed.
function bodyLooksFailed(text: string): boolean { return /invalid|unauthor|offline|fail/i.test(text || ''); }

export function pickAlias(obj: any, keys: string[]): any {
  for (const k of keys) { if (obj && obj[k] != null && obj[k] !== '') return obj[k]; }
  return null;
}

// Normalise the many raw Smartflo dispositions into one stable status set:
//   answered | missed | rejected | busy | no-answer | failed | initiated | ringing | unknown
// `duration` (talk time / billsec) is a strong signal: any talk time => answered.
export function normalizeCallStatus(raw: string, duration = 0, direction = ''): string {
  const s = String(raw || '').toLowerCase().trim();
  if (duration && Number(duration) > 0) return 'answered';
  if (/answer|complete|success|bridg|connect/.test(s)) return 'answered';
  if (/reject|declin|cancel/.test(s)) return 'rejected';
  if (/busy/.test(s)) return 'busy';
  if (/miss/.test(s)) return /out/.test(String(direction).toLowerCase()) ? 'no-answer' : 'missed';
  if (/no.?ans|noans|unanswer|not.?answer|timeout/.test(s)) {
    return /in\b|inbound|incoming/.test(String(direction).toLowerCase()) ? 'missed' : 'no-answer';
  }
  if (/fail|error|invalid|unreach|offline|congest/.test(s)) return 'failed';
  if (/initiat|origin/.test(s)) return 'initiated';
  if (/ring|dial|progress/.test(s)) return 'ringing';
  return s || 'unknown';
}
// A terminal status is one the call cannot move on from (used for de-duping activity).
export function isTerminalStatus(norm: string): boolean {
  return ['answered', 'missed', 'rejected', 'busy', 'no-answer', 'failed'].indexOf(String(norm)) >= 0;
}
// Human-facing label for a normalised status.
export function callStatusLabel(norm: string): string {
  const m: Record<string, string> = {
    answered: 'Answered', missed: 'Missed', rejected: 'Rejected', busy: 'Busy',
    'no-answer': 'No Answer', failed: 'Failed', initiated: 'Initiated', ringing: 'Ringing', unknown: 'Unknown',
  };
  return m[String(norm)] || (norm ? String(norm) : 'Unknown');
}
// mm:ss from a seconds count.
export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// Pull recent call records (CDR) from Smartflo — the authoritative source for final status +
// recording URL. Used to sync calls that the webhook (push) never delivered (e.g. localhost, or
// missing webhook config). Auth = the raw API key header (same as click_to_call).
const SMARTFLO_RECORDS_URL = 'https://api-smartflo.tatateleservices.com/v1/call/records';
export async function fetchCallRecords(fromDate: string, toDate: string, limit = 1000): Promise<any[]> {
  const key = tataConfig().apiKey;
  if (!key) return [];
  const url = SMARTFLO_RECORDS_URL + '?from_date=' + encodeURIComponent(fromDate) + '&to_date=' + encodeURIComponent(toDate) + '&limit=' + limit;
  try {
    const r = await fetch(url, { headers: { 'Authorization': key, 'Accept': 'application/json' } });
    if (!r.ok) return [];
    const j: any = await r.json();
    return Array.isArray(j.results) ? j.results : [];
  } catch (_) { return []; }
}

export interface CallResult { ok: boolean; callId?: string | null; status?: number; error?: string; raw?: any; }

// Primary: JSON click_to_call. Rings the agent first, then bridges the customer.
export async function clickToCall(opts: { agentNumber: string; destinationNumber: string; callerId: string; customIdentifier: any; }): Promise<CallResult> {
  const key = tataConfig().apiKey;
  if (!key) return { ok: false, error: 'tata_tele_api_key not configured' };
  const body = {
    agent_number: opts.agentNumber,
    destination_number: opts.destinationNumber,
    caller_id: opts.callerId,
    async: 1,
    custom_identifier: opts.customIdentifier,
  };
  let res: Response, text: string;
  try {
    res = await fetch(SMARTFLO_URL, {
      method: 'POST',
      headers: { 'Authorization': key, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    text = await res.text();
  } catch (e: any) { return { ok: false, error: 'network: ' + (e?.message || 'fetch failed') }; }
  let json: any = {}; try { json = JSON.parse(text); } catch (_) { json = {}; }
  if (!res.ok || bodyLooksFailed(text)) {
    return { ok: false, status: res.status, error: (json && (json.message || json.error)) || text || 'call failed', raw: json };
  }
  const callId = json.call_id || json.callId || (json.data && json.data.call_id) || null;
  return { ok: true, callId, raw: json };
}

// Optional fallback: form-urlencoded support endpoint with Bearer auth.
export async function clickToCallSupport(opts: { destinationNumber: string; customerNumber: string; extension?: string; didNumber?: string; }): Promise<CallResult> {
  const key = tataConfig().apiKey;
  if (!key) return { ok: false, error: 'tata_tele_api_key not configured' };
  const form = new URLSearchParams({
    api_key: key,
    destination_number: opts.destinationNumber,
    customer_number: opts.customerNumber,
    extension: opts.extension || '',
    did_number: opts.didNumber || '',
  });
  try {
    const res = await fetch(SMARTFLO_SUPPORT_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const text = await res.text();
    let json: any = {}; try { json = JSON.parse(text); } catch (_) {}
    if (!res.ok || bodyLooksFailed(text)) return { ok: false, status: res.status, error: text || 'call failed', raw: json };
    return { ok: true, callId: json.call_id || json.callId || (json.data && json.data.call_id) || null, raw: json };
  } catch (e: any) { return { ok: false, error: e?.message || 'fetch failed' }; }
}

// Download the recording (follow redirects; add auth header unless URL self-auths
// with ?token=) and re-host it in Supabase Storage. Returns the public URL + path.
// Only ever attach the real Tata API key (or fetch at all, from the webhook path) to a URL on
// Tata's own domain. Without this, the webhook — which has no signature verification and accepts
// a recording_url from whoever posts to it — could be pointed at an attacker's server, which would
// receive the live API key in the Authorization header plus whatever else is reachable via SSRF.
function isTrustedRecordingHost(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === 'tatateleservices.com' || h.endsWith('.tatateleservices.com');
  } catch { return false; }
}

export async function downloadRecordingToStorage(url: string, callId: string): Promise<{ publicUrl: string; path: string } | null> {
  if (!url || !callId) return null;
  if (!isTrustedRecordingHost(url)) return null;
  const key = tataConfig().apiKey;
  const hasToken = /[?&]token=/i.test(url);
  const headers: Record<string, string> = {};
  if (!hasToken && key) headers['Authorization'] = key;
  let buf: Buffer;
  try {
    const res = await fetch(url, { headers, redirect: 'follow' });   // fetch follows redirects — the
    // entry URL is host-checked above; a same-provider redirect (e.g. to a CDN subdomain) is the
    // expected legitimate case and isn't independently re-checked per hop.
    if (!res.ok) return null;
    buf = Buffer.from(await res.arrayBuffer());
  } catch (_) { return null; }
  const ext = /\.wav(\?|$)/i.test(url) ? 'wav' : 'mp3';
  const path = String(callId) + '.' + ext;
  try {
    const up = await supabase.storage.from(RECORD_BUCKET).upload(path, buf, {
      contentType: ext === 'wav' ? 'audio/wav' : 'audio/mpeg', upsert: true,
    });
    if (up.error) return null;
    const { data } = supabase.storage.from(RECORD_BUCKET).getPublicUrl(path);
    return { publicUrl: (data && data.publicUrl) || '', path };
  } catch (_) { return null; }
}
