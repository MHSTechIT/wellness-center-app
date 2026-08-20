import { pool } from '../shared/db';

// ============================================================
// DIRECT UPLOAD IN DP — safe, update-only bulk lead editing
//
// The single most destructive thing a bulk importer can do is treat an EMPTY CELL as an
// instruction. A spreadsheet round-trip leaves most cells blank, so "blank means clear it" quietly
// wipes the columns the uploader never intended to touch. Here a blank cell is *no instruction at
// all*: the column is left out of the UPDATE statement entirely, so the database keeps whatever it
// already held. Clearing a value requires the explicit sentinel below, typed deliberately.
//
// The second most destructive is a bad match. Names repeat, and in this database ~17 leads share a
// phone number with another lead — so phone alone cannot identify a record. Matching goes
// lead_id → phone, and any row that resolves to MORE than one lead is refused rather than guessed.
//
// Nothing writes until analyze() has produced a preview the admin has seen and confirmed. apply()
// re-runs the identical analysis server-side rather than trusting whatever the browser posts back,
// so a stale or tampered preview cannot become a different set of writes.
// ============================================================

/** Typed in a cell to deliberately blank a field. A bare empty cell never clears anything. */
export const CLEAR_TOKEN = '#CLEAR';

type FieldKind = 'text' | 'date' | 'ts' | 'bool';
type FieldDef = { col: string; kind: FieldKind; label: string; group: string };

// The CSV contract. Header names are what the user sees in the template; `col` is the database
// column. Only columns listed here can ever be written — an unknown header is reported and ignored,
// so a stray column in someone's spreadsheet can never reach the database.
export const FIELDS: Record<string, FieldDef> = {
  // -- identity (used to match; never written) is handled separately, not here --
  name:            { col: 'name',           kind: 'text', label: 'Lead Name',            group: 'Lead Details' },
  email:           { col: 'email',          kind: 'text', label: 'Email',                group: 'Lead Details' },
  city:            { col: 'city',           kind: 'text', label: 'City',                 group: 'Lead Details' },
  street:          { col: 'street',         kind: 'text', label: 'Street',               group: 'Lead Details' },
  language:        { col: 'language',       kind: 'text', label: 'Language',             group: 'Lead Details' },
  sugar_poll:      { col: 'sugar_poll',     kind: 'text', label: 'Sugar Level',          group: 'Lead Details' },
  source:          { col: 'source',         kind: 'text', label: 'Lead Source',          group: 'Lead Source' },
  campaign:        { col: 'campaign',       kind: 'text', label: 'Campaign',             group: 'Lead Source' },
  ad_name:         { col: 'ad_name',        kind: 'text', label: 'Ad Name',              group: 'Lead Source' },
  form_name:       { col: 'form_name',      kind: 'text', label: 'Form Name',            group: 'Lead Source' },
  service:         { col: 'service',        kind: 'text', label: 'Service',              group: 'Program Details' },
  assigned_to:     { col: 'assigned_to',    kind: 'text', label: 'Advisor',              group: 'Advisor' },
  call_status:     { col: 'call_status',    kind: 'text', label: 'Call Status',          group: 'Call Status' },
  next_followup:   { col: 'next_followup',  kind: 'ts',   label: 'Follow-up Date',       group: 'Follow-up' },
  lead_date:       { col: 'lead_date',      kind: 'date', label: 'Lead Date',            group: 'Lead Dates' },
  assigned_at:     { col: 'assigned_at',    kind: 'ts',   label: 'Assigned Date',        group: 'Activity Dates' },
  visited_at:      { col: 'visited_at',     kind: 'ts',   label: 'Visited Date',         group: 'Appointment Dates' },
  confirmed_at:    { col: 'confirmed_at',   kind: 'ts',   label: 'Confirmed Date',       group: 'Appointment Dates' },
  enrolled_at:     { col: 'enrolled_at',    kind: 'ts',   label: 'Enrolled Date',        group: 'Enrolled Status' },
};

// Header order in the downloadable template. Identity first so the file reads left-to-right the way
// somebody fills it in.
export const TEMPLATE_HEADERS = ['lead_id', 'phone', ...Object.keys(FIELDS)];

export type RowIssue = 'ok' | 'create' | 'not_found' | 'ambiguous' | 'duplicate_in_file' | 'invalid' | 'no_change';
export type Change = { field: string; label: string; from: string; to: string; value?: string; skip?: true };
export type RowResult = {
  rowNo: number;
  leadId: string | null;      // meta_lead_id of the matched lead
  name: string;
  phone: string;
  status: RowIssue;
  matchedBy: 'lead_id' | 'phone' | null;
  changes: Change[];
  message?: string;
};
export type PreviewResult = {
  ok: boolean;
  error?: string;
  unknownColumns: string[];
  counts: {
    totalRows: number; matched: number; toUpdate: number; toCreate: number; noChange: number;
    notFound: number; ambiguous: number; duplicateInFile: number; invalid: number; skippedCells: number;
    dateChanges: number; advisorChanges: number; statusChanges: number;
  };
  rows: RowResult[];
};

// ---------- CSV parsing ----------
/**
 * RFC4180-ish parser: handles quoted fields containing commas, newlines and doubled quotes.
 * Written out rather than split(',') because a lead name like "Kumar, S." would otherwise shift
 * every following column by one and silently write values into the wrong fields.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQuotes = false;
  const s = text.replace(/^﻿/, '');   // strip the BOM Excel writes
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

// ---------- value coercion ----------
const p2 = (n: number) => String(n).padStart(2, '0');

/**
 * Parse a user-typed date. Accepts dd-mm-yyyy / dd/mm/yyyy (what Indian spreadsheets produce),
 * yyyy-mm-dd, and "01-Aug-2026". Returns YYYY-MM-DD, or null when it cannot be read.
 *
 * DAY-FIRST is assumed for the ambiguous dd/mm vs mm/dd case, because this clinic writes dates that
 * way — 05-08-2026 here means 5 August, not 8 May. Guessing the other way would move a lead's date
 * by months without anything looking wrong.
 */
export function parseDate(v: string): string | null {
  const t = String(v || '').trim();
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // TWO-DIGIT YEARS are accepted. The app's own downloadable template writes dates as "02-Apr-26",
  // so refusing them meant the importer could not read the file it had just handed the uploader --
  // 9 of 10 rows in a real upload failed on lead_date alone. Years map to 2000-2068 / 1969-1999,
  // the usual split; every date this clinic imports is recent, so a small number is this century.
  // \d{4} FIRST in the alternation: with \d{2} first the regex matches "20" of "2026" and a
  // four-digit year silently becomes 2020. Caught by round-tripping 02-Apr-2026.
  const yr = (y: string) => (y.length === 4 ? y : String(+y <= 68 ? 2000 + +y : 1900 + +y));
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})/);
  if (m) return `${yr(m[3])}-${p2(+m[2])}-${p2(+m[1])}`;
  m = t.match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{4}|\d{2})/);
  if (m) {
    const mo = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      .indexOf(m[2].slice(0, 3).toLowerCase());
    if (mo >= 0) return `${yr(m[3])}-${p2(mo + 1)}-${p2(+m[1])}`;
  }
  return null;
}

/**
 * Parse a date+time into an ISO instant. A bare date is taken as 00:00 IST, and every value is
 * anchored to +05:30 explicitly — without that the server's own timezone decides, and a follow-up
 * typed as "06-Aug 09:00" would land on a different day for anyone reading it in IST.
 */
export function parseTs(v: string): string | null {
  const t = String(v || '').trim();
  if (!t) return null;
  const d = parseDate(t);
  if (!d) return null;
  const tm = t.match(/(\d{1,2}):(\d{2})/);
  const hh = tm ? p2(Math.min(23, +tm[1])) : '00';
  const mi = tm ? p2(Math.min(59, +tm[2])) : '00';
  const iso = `${d}T${hh}:${mi}:00+05:30`;
  return isNaN(new Date(iso).getTime()) ? null : iso;
}

const TRUE_SET = new Set(['yes', 'y', 'true', '1', 'enrolled', 'assigned']);
const FALSE_SET = new Set(['no', 'n', 'false', '0']);
export function parseBool(v: string): boolean | null {
  const t = String(v || '').trim().toLowerCase();
  if (TRUE_SET.has(t)) return true;
  if (FALSE_SET.has(t)) return false;
  return null;
}

/**
 * A DATE column comes back from node-postgres as a JS Date, not a string — so String(v).slice(0,10)
 * yields "Sun Aug 02", which both displayed wrongly AND could never equal the incoming
 * "2026-08-05". That made every lead_date look changed, so an update-mode run would have rewritten
 * the column on every matched row whether or not the value actually differed.
 */
function toYmd(v: any): string {
  if (v instanceof Date) {
    // Read the calendar date in IST — a Date at 2026-08-05T00:00+05:30 is 04 Aug in UTC, and this
    // column means a Chennai day.
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(v);
    } catch { return v.toISOString().slice(0, 10); }
  }
  return String(v || '').slice(0, 10);
}

/** Display form for the preview's old→new columns. */
function show(v: any, kind: FieldKind): string {
  if (v === null || v === undefined || v === '') return '—';
  if (kind === 'date') return toYmd(v);
  if (kind === 'ts') {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(new Date(v as any));
    } catch { return String(v); }
  }
  if (kind === 'bool') return v ? 'Yes' : 'No';
  return String(v);
}

/** Same-value check, per kind — so "2026-08-06" vs a timestamptz of the same instant is no change. */
function sameValue(dbVal: any, newVal: any, kind: FieldKind): boolean {
  if (dbVal === null || dbVal === undefined) return newVal === null;
  if (newVal === null) return false;
  if (kind === 'ts') {
    const a = new Date(dbVal as any).getTime(), b = new Date(newVal as any).getTime();
    return !isNaN(a) && !isNaN(b) && a === b;
  }
  if (kind === 'date') return toYmd(dbVal) === toYmd(newVal);
  return String(dbVal).trim() === String(newVal).trim();
}

const digits = (s: any) => String(s || '').replace(/\D/g, '');
/** Last 10 digits — the app stores phones with and without the +91 country code. */
const phoneKey = (s: any) => { const d = digits(s); return d.length >= 10 ? d.slice(-10) : d; };

export type ImportOpts = {
  /** 'keep' leaves lead_date exactly as it is; 'update' takes it from the file. Default keep. */
  leadDateMode?: 'keep' | 'update';
  by?: string;
  fileName?: string;
};

/**
 * Validate, match and diff — WITHOUT writing anything. This is what the preview screen renders and
 * what apply() re-runs before it commits.
 */
// "Some values could not be read" told the uploader nothing: with ten rows all reading the same
// sentence there is no way to know which column is wrong, and the fix becomes guesswork. Name the
// columns and quote the value, so the CSV can be corrected without opening the code.
function unreadableMsg(changes: Change[]): string {
  const bad = changes.filter((c) => String(c.to).startsWith('⚠'));
  if (!bad.length) return 'Some values could not be read';
  const parts = bad.slice(0, 3).map((c) => {
    const m = /⚠ unreadable: "(.*)", skipped$/.exec(String(c.to));
    return c.field + ' = "' + (m ? m[1] : '?') + '"';
  });
  return 'Skipped ' + parts.join(', ')
    + (bad.length > 3 ? ' and ' + (bad.length - 3) + ' more' : '')
    + ' — left unchanged; the rest of the row is imported';
}

// ---- Misplaced-value rescue -------------------------------------------------------------------
// A CSV filled in by hand puts values where they read naturally, not where the schema wants them:
// a real upload arrived with assigned_at = "Pavithra" and enrolled_at = "L1 Enrolled" in every row,
// and all ten were refused because a name is not a timestamp. Rejecting the file is correct but
// useless — the uploader knows what they meant.
//
// So a value that cannot be parsed for its own column is offered to the column it clearly belongs
// to: a known staff name becomes the Advisor, an enrolment phrase becomes the Call Status. Only
// when the destination is EMPTY in the file. If the CSV already states an advisor, a second name in
// the wrong column is a contradiction the uploader must settle — silently overwriting "sugashini"
// with "Pavithra" would be a guess about who owns the lead, and that is not ours to make.
type Rescue = { field: string; value: string; note: string };
function rescueValue(raw: string, staff: Map<string, string>): Rescue | null {
  const t = String(raw || '').trim();
  if (!t) return null;
  const known = staff.get(t.toLowerCase());
  if (known) return { field: 'assigned_to', value: known, note: 'read as the Advisor' };
  // "L1 Enrolled", "L1 + L2 Enrolled", "Enrolled - L2" ... all state the same fact: enrolled.
  if (/enroll?ed/i.test(t)) return { field: 'call_status', value: 'Enrolled', note: 'read as the Call Status' };
  return null;
}

export async function analyze(csvText: string, opts: ImportOpts = {}): Promise<PreviewResult> {
  const leadDateMode = opts.leadDateMode === 'update' ? 'update' : 'keep';
  const empty: PreviewResult['counts'] = {
    totalRows: 0, matched: 0, toUpdate: 0, toCreate: 0, noChange: 0, notFound: 0, ambiguous: 0,
    duplicateInFile: 0, invalid: 0, skippedCells: 0, dateChanges: 0, advisorChanges: 0, statusChanges: 0,
  };

  const grid = parseCsv(csvText);
  if (grid.length < 2) return { ok: false, error: 'The file has no data rows.', unknownColumns: [], counts: empty, rows: [] };

  const headers = grid[0].map((h) => String(h || '').trim().toLowerCase().replace(/\s+/g, '_'));
  const body = grid.slice(1);
  if (!headers.includes('lead_id') && !headers.includes('phone')) {
    return { ok: false, error: 'The file needs a lead_id or phone column to identify each lead.', unknownColumns: [], counts: empty, rows: [] };
  }
  const unknownColumns = headers.filter((h) => h && h !== 'lead_id' && h !== 'phone' && !FIELDS[h]);

  // Fetch every candidate lead in ONE pass rather than a query per row — 400 rows would otherwise be
  // 400 round trips, and the preview has to be fast enough that people actually look at it.
  const idsWanted = new Set<string>(), phonesWanted = new Set<string>();
  const idIdx = headers.indexOf('lead_id'), phIdx = headers.indexOf('phone');
  for (const r of body) {
    const id = idIdx >= 0 ? String(r[idIdx] || '').trim() : '';
    const ph = phIdx >= 0 ? phoneKey(r[phIdx]) : '';
    if (id) idsWanted.add(id);
    if (ph) phonesWanted.add(ph);
  }
  const cols = ['meta_lead_id', 'name', 'phone', 'is_assigned', ...Object.values(FIELDS).map((f) => f.col)];
  const uniqCols = Array.from(new Set(cols));
  const { rows: dbRows } = await pool.query(
    `SELECT ${uniqCols.map((c) => `"${c}"`).join(', ')} FROM leads
      WHERE meta_lead_id = ANY($1)
         OR right(regexp_replace(coalesce(phone,''), '\\D', '', 'g'), 10) = ANY($2)`,
    [Array.from(idsWanted), Array.from(phonesWanted)]
  );
  // Staff names the rescue can resolve against: both lists, because an advisor may exist as a
  // user without an assignee mirror (and vice versa).
  const staff = new Map<string, string>();
  try {
    const { rows: st } = await pool.query(
      `SELECT name FROM assignees WHERE COALESCE(is_active, true)
        UNION SELECT name FROM app_users WHERE COALESCE(active, true)`);
    for (const r of st) { const nm = String(r.name || '').trim(); if (nm) staff.set(nm.toLowerCase(), nm); }
  } catch { /* no staff list = no rescue; the row still reports the unreadable value */ }
  const byId = new Map<string, any>();
  const byPhone = new Map<string, any[]>();
  for (const d of dbRows) {
    byId.set(String(d.meta_lead_id), d);
    const k = phoneKey(d.phone);
    if (k) { const list = byPhone.get(k) || []; list.push(d); byPhone.set(k, list); }
  }

  // A lead appearing twice in the SAME file is refused on both rows: the second row would silently
  // overwrite the first, and there is no way to know which the uploader meant.
  const seenKey = new Map<string, number>();
  const results: RowResult[] = [];
  const counts = { ...empty, totalRows: body.length };

  body.forEach((r, i) => {
    const rowNo = i + 2;                       // 1-based, +1 for the header — matches the spreadsheet
    const cell = (h: string) => { const ix = headers.indexOf(h); return ix >= 0 ? String(r[ix] ?? '').trim() : ''; };
    const rawId = idIdx >= 0 ? String(r[idIdx] || '').trim() : '';
    const rawPh = phIdx >= 0 ? String(r[phIdx] || '').trim() : '';
    const pk = phoneKey(rawPh);
    const base: RowResult = { rowNo, leadId: null, name: cell('name') || '', phone: rawPh, status: 'ok', matchedBy: null, changes: [] };

    if (!rawId && !pk) {
      counts.invalid++; results.push({ ...base, status: 'invalid', message: 'No lead_id or phone in this row' }); return;
    }
    // The template ships two filled sample rows so every column shows the shape of its value.
    // They must never be imported: unmatched rows now CREATE leads, so a template returned with
    // the examples still in it would manufacture fake clients. Skipped silently, by the marker
    // the template writes into the name.
    if (String(base.name || '').toUpperCase().startsWith(SAMPLE_MARK)) return;
    const dupKey = rawId ? 'id:' + rawId : 'ph:' + pk;
    if (seenKey.has(dupKey)) {
      counts.duplicateInFile++;
      results.push({ ...base, status: 'duplicate_in_file', message: 'Also appears on row ' + seenKey.get(dupKey) });
      return;
    }
    seenKey.set(dupKey, rowNo);

    // MATCH: lead_id first — it is unique. Phone is the fallback and is refused when more than one
    // lead carries it, rather than picking one.
    let lead: any = null, matchedBy: RowResult['matchedBy'] = null;
    if (rawId && byId.has(rawId)) { lead = byId.get(rawId); matchedBy = 'lead_id'; }
    else if (pk) {
      const list = byPhone.get(pk) || [];
      if (list.length === 1) { lead = list[0]; matchedBy = 'phone'; }
      else if (list.length > 1) {
        counts.ambiguous++;
        results.push({ ...base, status: 'ambiguous', message: list.length + ' leads share this phone — resolve by lead_id' });
        return;
      }
    }
    if (!lead) {
      // NO MATCH = A NEW LEAD. Every non-empty cell becomes a value on a brand-new row; a blank cell
      // is left NULL rather than written as an empty string, so the new lead carries only what the
      // file actually stated. lead_date is NOT gated by leadDateMode here: there is no existing date
      // to keep, so the CSV's date is the only one there can be.
      const creates: Change[] = [];
      let badNew = false;
      for (const [header, def] of Object.entries(FIELDS)) {
        if (!headers.includes(header)) continue;
        const raw = cell(header);
        if (raw === '' || raw.toUpperCase() === CLEAR_TOKEN) continue;   // nothing to clear on a new lead
        let next: any;
        if (def.kind === 'date') next = parseDate(raw);
        else if (def.kind === 'ts') next = parseTs(raw);
        else if (def.kind === 'bool') next = parseBool(raw);
        else next = raw;
        if (next === null) {
          const rx = rescueValue(raw, staff);
          // Only when the destination column is empty in this file - see rescueValue.
          if (rx && !cell(rx.field)) {
            const rdef = FIELDS[rx.field];
            creates.push({ field: rx.field, label: rdef.label, from: '—',
                           to: rx.value + ' (from ' + header + ', ' + rx.note + ')', value: rx.value });
            continue;
          }
          creates.push({ field: header, label: def.label, from: '—', to: '⚠ unreadable: "' + raw + '", skipped', skip: true });
          badNew = true; continue;
        }
        creates.push({ field: header, label: def.label, from: '—', to: show(next, def.kind) });
      }
      // A value that cannot be read is never guessed at — a name sitting in a timestamp column is
      // still never written into one. But refusing the whole ROW over it was too blunt: a file where
      // every row carried one stray name lost nine perfectly good columns with it, and the uploader
      // had no way forward but to hand-correct the file first. So the unreadable CELL is dropped, the
      // rest of the row is imported, and the preview names what was left out.
      const good = creates.filter((c) => !c.skip);
      counts.skippedCells += creates.length - good.length;
      if (!good.length) {
        counts.invalid++;
        results.push({ ...base, status: 'invalid', changes: creates, message: unreadableMsg(creates) });
        return;
      }
      counts.toCreate++;
      results.push({ ...base, status: 'create', changes: creates,
                     message: badNew ? 'New lead — ' + unreadableMsg(creates) : 'New lead — will be created' });
      return;
    }

    counts.matched++;
    const changes: Change[] = [];
    for (const [header, def] of Object.entries(FIELDS)) {
      if (!headers.includes(header)) continue;                    // column absent from the file
      const raw = cell(header);
      if (raw === '') continue;                                   // BLANK = keep existing. The rule.
      if (header === 'lead_date' && leadDateMode === 'keep') continue;   // gated by the batch setting

      let next: any;
      if (raw.toUpperCase() === CLEAR_TOKEN) next = null;         // the deliberate clear
      else if (def.kind === 'date') next = parseDate(raw);
      else if (def.kind === 'ts') next = parseTs(raw);
      else if (def.kind === 'bool') next = parseBool(raw);
      else next = raw;

      if (next === null && raw.toUpperCase() !== CLEAR_TOKEN) {
        const rx = rescueValue(raw, staff);
        if (rx && !cell(rx.field)) {
          const rdef = FIELDS[rx.field];
          if (!sameValue(lead[rdef.col], rx.value, rdef.kind)) {
            changes.push({ field: rx.field, label: rdef.label, from: show(lead[rdef.col], rdef.kind),
                           to: rx.value + ' (from ' + header + ', ' + rx.note + ')', value: rx.value });
          }
          continue;
        }
        changes.push({ field: header, label: def.label, from: show(lead[def.col], def.kind), to: '⚠ unreadable: "' + raw + '", skipped', skip: true });
        continue;
      }
      if (sameValue(lead[def.col], next, def.kind)) {
        // One exception: the advisor is already recorded but is_assigned is false, so the lead
        // appears in NO advisor's list (every advisor view filters on is_assigned=true).
        // Re-stating the same advisor in the CSV is how an uploader repairs that — surface it as
        // a real change so apply() rewrites the visibility flags.
        if (header === 'assigned_to' && next && lead.is_assigned === false) {
          changes.push({ field: header, label: def.label, from: show(lead[def.col], def.kind) + ' (hidden from advisor lists)', to: show(next, def.kind) + ' (visible)' });
        }
        continue;
      }
      changes.push({ field: header, label: def.label, from: show(lead[def.col], def.kind), to: show(next, def.kind) });
    }

    const bad = changes.some((c) => c.skip);
    counts.skippedCells += changes.filter((c) => c.skip).length;
    const applying = changes.filter((c) => !c.skip);
    if (!applying.length) {
      // Nothing survives: either the row said nothing new, or all it said was unreadable.
      if (bad) { counts.invalid++; results.push({ ...base, leadId: String(lead.meta_lead_id), name: lead.name || base.name, status: 'invalid', matchedBy, changes, message: unreadableMsg(changes) }); return; }
      counts.noChange++; results.push({ ...base, leadId: String(lead.meta_lead_id), name: lead.name || base.name, status: 'no_change', matchedBy, changes: [] }); return;
    }

    counts.toUpdate++;
    for (const c of applying) {
      const k = FIELDS[c.field].kind;
      if (k === 'date' || k === 'ts') counts.dateChanges++;
      if (c.field === 'assigned_to') counts.advisorChanges++;
      if (c.field === 'call_status' || c.field === 'enrolled_at') counts.statusChanges++;
    }
    results.push({ ...base, leadId: String(lead.meta_lead_id), name: lead.name || base.name, status: 'ok', matchedBy, changes,
                   message: bad ? unreadableMsg(changes) : undefined });
  });

  return { ok: true, unknownColumns, counts, rows: results };
}

export type ApplyResult = { ok: boolean; error?: string; batchId?: string; updated: number; created?: number; preview: PreviewResult };

/**
 * Apply the update. Re-analyses server-side rather than trusting a posted preview, then writes every
 * matched lead inside ONE transaction — so a failure halfway leaves the database exactly as it was
 * rather than half-updated.
 */
export async function apply(csvText: string, opts: ImportOpts = {}): Promise<ApplyResult> {
  const preview = await analyze(csvText, opts);
  if (!preview.ok) return { ok: false, error: preview.error, updated: 0, preview };

  const doRows = preview.rows.filter((r) => r.status === 'ok' && r.changes.length && r.leadId);
  const newRows = preview.rows.filter((r) => r.status === 'create');
  if (!doRows.length && !newRows.length) return { ok: true, updated: 0, preview };

  // Re-derive the typed values from the file for the rows we are about to write. The preview holds
  // DISPLAY strings ("06 Aug 2026, 09:00"), which must never be what reaches the database.
  const grid = parseCsv(csvText);
  const headers = grid[0].map((h) => String(h || '').trim().toLowerCase().replace(/\s+/g, '_'));
  const leadDateMode = opts.leadDateMode === 'update' ? 'update' : 'keep';
  const byRowNo = new Map<number, string[]>();
  grid.slice(1).forEach((r, i) => byRowNo.set(i + 2, r));

  const client = await pool.connect();
  let updated = 0, created = 0, batchId: string | undefined;
  try {
    await client.query('BEGIN');
    const b = await client.query(
      `INSERT INTO lead_import_batches (file_name, uploaded_by, lead_date_mode, total_rows, matched,
                                        updated_rows, not_found, ambiguous, duplicate_rows, invalid_rows, summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [opts.fileName || 'upload.csv', opts.by || 'Admin', leadDateMode, preview.counts.totalRows,
       preview.counts.matched, doRows.length, newRows.length, preview.counts.ambiguous,
       preview.counts.duplicateInFile, preview.counts.invalid, JSON.stringify(preview.counts)]
    );
    batchId = String(b.rows[0].id);

    for (const rr of doRows) {
      const raw = byRowNo.get(rr.rowNo); if (!raw) continue;
      const cell = (h: string) => { const ix = headers.indexOf(h); return ix >= 0 ? String(raw[ix] ?? '').trim() : ''; };
      const sets: string[] = [], vals: any[] = [];
      let advSet: 'on' | 'off' | null = null;
      for (const c of rr.changes) {
        if (c.skip) continue;                 // unreadable in the file - reported, never written
        const def = FIELDS[c.field];
        // c.value is a rescued value (a name found in a timestamp column): it is NOT in this
        // column of the file, so re-reading the cell would silently drop the change.
        const cellVal = c.value ?? cell(c.field);
        if (cellVal === '') continue;
        if (c.field === 'lead_date' && leadDateMode === 'keep') continue;
        let v: any;
        if (cellVal.toUpperCase() === CLEAR_TOKEN) v = null;
        else if (def.kind === 'date') v = parseDate(cellVal);
        else if (def.kind === 'ts') v = parseTs(cellVal);
        else if (def.kind === 'bool') v = parseBool(cellVal);
        else v = cellVal;
        vals.push(v);
        sets.push(`"${def.col}" = $${vals.length}`);
        if (c.field === 'assigned_to') advSet = v ? 'on' : 'off';
      }
      // Assignment implies visibility: every advisor view lists only is_assigned=true leads, and an
      // assigned lead must leave the pool. Without this, a CSV-assigned lead exists but shows nowhere.
      // Clearing the advisor (#CLEAR) flips it back to unassigned. assigned_at is deliberately NOT
      // auto-stamped (a historical import must not eat today's auto-assign allocation) — provide the
      // assigned_at column in the file when the date matters.
      if (advSet === 'on') sets.push(`is_assigned = true`, `in_pool = false`);
      else if (advSet === 'off') sets.push(`is_assigned = false`);
      if (!sets.length) continue;
      vals.push(rr.leadId);
      // ONLY the columns present in this row are named. Nothing else on the lead is touched, which
      // is what makes a blank cell a no-op rather than a deletion.
      await client.query(`UPDATE leads SET ${sets.join(', ')} WHERE meta_lead_id = $${vals.length}`, vals);
      updated++;

      for (const c of rr.changes) {
        await client.query(
          `INSERT INTO lead_import_changes (batch_id, lead_id, lead_name, field, old_value, new_value)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [batchId, rr.leadId, rr.name || '', c.label, c.from, c.to]
        );
      }
    }


    // ---- CREATE the rows that matched no existing lead ----
    // Same transaction as the updates: a file that half-applied would leave the uploader unable to
    // tell which half. Only columns the CSV actually stated are named, so an omitted field is NULL
    // on the new lead rather than an empty string.
    for (const rr of newRows) {
      const raw = byRowNo.get(rr.rowNo); if (!raw) continue;
      const cell = (h: string) => { const ix = headers.indexOf(h); return ix >= 0 ? String(raw[ix] ?? '').trim() : ''; };
      const cols: string[] = ['meta_lead_id'], vals: any[] = [];
      // Its own id space, so an imported lead is never mistaken for a Meta-synced one and the sync's
      // prune (which deletes rows it no longer sees on Meta) cannot reach it.
      vals.push('csv-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
      const put = (col: string, v: any) => { vals.push(v); cols.push(col); };
      if (rr.phone) put('phone', rr.phone);
      let advOn = false;
      for (const c of rr.changes) {
        if (c.skip) continue;
        const def = FIELDS[c.field];
        const cv = c.value ?? cell(c.field);
        if (cv === '' || cv.toUpperCase() === CLEAR_TOKEN) continue;
        let v: any;
        if (def.kind === 'date') v = parseDate(cv);
        else if (def.kind === 'ts') v = parseTs(cv);
        else if (def.kind === 'bool') v = parseBool(cv);
        else v = cv;
        if (v === null) continue;
        put(def.col, v);
        if (c.field === 'assigned_to' && v) advOn = true;
      }
      // Assignment implies visibility, exactly as on the update path: an assigned lead must be
      // visible to its advisor and out of the pool; an unassigned one goes to the pool so it can be
      // allocated rather than existing nowhere.
      put('is_assigned', advOn);
      put('in_pool', !advOn);
      const ph = vals.map((_, ix) => '$' + (ix + 1)).join(', ');
      await client.query(
        `INSERT INTO leads (${cols.map((c) => '"' + c + '"').join(', ')}) VALUES (${ph})
         ON CONFLICT (meta_lead_id) DO NOTHING`, vals);
      created++;
      for (const c of rr.changes) {
        await client.query(
          `INSERT INTO lead_import_changes (batch_id, lead_id, lead_name, field, old_value, new_value)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [batchId, String(vals[0]), rr.name || '', c.label, 'new lead', c.to]);
      }
    }
    await client.query('UPDATE lead_import_batches SET updated_rows = $1 WHERE id = $2', [updated + created, batchId]);
    await client.query('COMMIT');
  } catch (e: any) {
    try { await client.query('ROLLBACK'); } catch { /* nothing committed */ }
    return { ok: false, error: e?.message || 'update failed', updated: 0, preview };
  } finally {
    client.release();
  }

  return { ok: true, batchId, updated, created, preview };
}

/** The reusable template: the header row plus TWO fully-filled sample rows.
 *
 * Every column carries a realistic, correctly-FORMATTED value. A template that left the date columns
 * blank is how a real upload arrived with assigned_at = "Pavithra" and enrolled_at = "L1 Enrolled" -
 * with nothing to copy from, people put the nearest thing they had into the nearest column, and all
 * ten rows were refused. Showing the shape of each value removes the guess.
 *
 * The sample rows are IGNORED on upload (see SAMPLE_MARK): unmatched rows now CREATE leads, so a
 * template returned with the examples still in it would otherwise manufacture two fake clients.
 */
const CRLF = String.fromCharCode(13) + String.fromCharCode(10);
export const SAMPLE_MARK = 'SAMPLE ROW';
export function templateCsv(): string {
  const esc = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
  const samples: Record<string, string>[] = [
    {
      lead_id: '', phone: '9876543210', name: SAMPLE_MARK + ' 1 - delete before uploading',
      email: 'client@example.com', city: 'Chennai', street: 'T Nagar', language: 'Tamil',
      sugar_poll: '150-250', source: 'Meta Ads', campaign: 'DW - Winner Ad', ad_name: 'LLW OGA 1',
      form_name: 'NSI - Direct Walkin', service: 'Diabetes Counselling', assigned_to: 'sugashini',
      call_status: 'Follow Up', next_followup: '13-Aug-26 11:00', lead_date: '05-Aug-26',
      assigned_at: '06-Aug-26 09:30', visited_at: '', confirmed_at: '', enrolled_at: '',
    },
    {
      lead_id: '1629105685312206', phone: '9840100420', name: SAMPLE_MARK + ' 2 - delete before uploading',
      email: '', city: 'Chennai', street: '', language: 'English', sugar_poll: 'Above 250',
      source: 'Walk-in / Referral / Telecalling', campaign: '', ad_name: '', form_name: '',
      service: 'Physiotherapy', assigned_to: 'Gayathri', call_status: 'Visited',
      next_followup: '', lead_date: '02-Apr-26', assigned_at: '02-Apr-26 10:15',
      visited_at: '10-Aug-26 17:00', confirmed_at: '09-Aug-26 12:00', enrolled_at: '11-Aug-26 18:30',
    },
  ];
  const rows = [TEMPLATE_HEADERS.map(esc).join(',')];
  for (const row of samples) rows.push(TEMPLATE_HEADERS.map((h) => esc(row[h] ?? '')).join(','));
  return rows.join(CRLF);
}
