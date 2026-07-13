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
  const key = process.env.TATA_TELE_API_KEY;
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
  const key = process.env.TATA_TELE_API_KEY;
  if (!key) return { ok: false, error: 'TATA_TELE_API_KEY not configured' };
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
  const key = process.env.TATA_TELE_API_KEY;
  if (!key) return { ok: false, error: 'TATA_TELE_API_KEY not configured' };
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
export async function downloadRecordingToStorage(url: string, callId: string): Promise<{ publicUrl: string; path: string } | null> {
  if (!url || !callId) return null;
  const key = process.env.TATA_TELE_API_KEY || '';
  const hasToken = /[?&]token=/i.test(url);
  const headers: Record<string, string> = {};
  if (!hasToken && key) headers['Authorization'] = key;
  let buf: Buffer;
  try {
    const res = await fetch(url, { headers, redirect: 'follow' });   // fetch follows redirects
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
