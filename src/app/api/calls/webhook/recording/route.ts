import { after } from 'next/server';
import { supabase } from '@/shared/supabase';
import { pickAlias, digits10, downloadRecordingToStorage, normalizeCallStatus, isTerminalStatus, callStatusLabel, formatDuration } from '@/server/tata';

export const dynamic = 'force-dynamic';

// POST /api/calls/webhook/recording  — Smartflo posts here when a call ends.
// NO auth (Smartflo can't authenticate). Ack 200 immediately, process via after().
export async function POST(req: Request) {
  let payload: any = {};
  try { payload = await req.json(); }
  catch (_) { try { const t = await req.text(); payload = Object.fromEntries(new URLSearchParams(t)); } catch (__) { payload = {}; } }

  after(async () => { try { await processRecording(payload); } catch (_) { /* swallow — webhook already acked */ } });

  return Response.json({ ok: true });
}

async function processRecording(p: any) {
  const callId = pickAlias(p, ['call_id', 'callId', 'uuid', 'id']);
  if (!callId) return;
  const recUrl = pickAlias(p, ['recording_url', 'recordingUrl', 'recording', 'file']);
  const duration = Number(pickAlias(p, ['call_duration', 'duration', 'billsec']) || 0) || 0;
  const fromNum = pickAlias(p, ['caller_number', 'from', 'caller_id']);
  const toNum = pickAlias(p, ['destination_number', 'to', 'callee']);
  const direction = pickAlias(p, ['direction', 'call_type']);
  const status = pickAlias(p, ['call_status', 'status', 'event']);

  // Resolve the contact: 1) custom_identifier.contact_id  2) phone match (last 10).
  let contactId: string | null = null;
  const ci = p && p.custom_identifier;
  if (ci && (ci.contact_id != null)) contactId = String(ci.contact_id);
  if (!contactId && toNum) {
    const d10 = digits10(toNum);
    if (d10) {
      try {
        const { data } = await supabase.from('leads').select('meta_lead_id').ilike('phone', '%' + d10 + '%').limit(1);
        if (data && data[0]) contactId = data[0].meta_lead_id;
      } catch (_) {}
    }
  }

  const norm = normalizeCallStatus(status, duration, direction);

  // Read the prior status (if any) so we only log the outcome to Activity once,
  // even though Smartflo may POST several times per call (ring → answer → hangup).
  let prevNorm = '';
  try {
    const { data: ex } = await supabase.from('call_recordings').select('contact_id,call_status').eq('call_id', String(callId)).limit(1);
    if (ex && ex[0]) {
      prevNorm = normalizeCallStatus(ex[0].call_status || '', 0, direction);
      if (!contactId && ex[0].contact_id) contactId = String(ex[0].contact_id);   // recover contact from the pre-insert
    }
  } catch (_) {}

  // Dedup on call_id: upsert merges into the pre-inserted 'initiated' row if present.
  const row: any = {
    call_id: String(callId), contact_id: contactId, recording_url: recUrl || null,
    duration_seconds: duration, from_number: fromNum || null, to_number: toNum || null,
    direction: direction || null, call_status: norm, raw_payload: p,
  };
  try { await supabase.from('call_recordings').upsert(row, { onConflict: 'call_id' }); } catch (_) { return; }

  // Log the call outcome into the lead's Activity History — once, on the first
  // terminal event (answered / missed / rejected / busy / no-answer / failed).
  if (contactId && isTerminalStatus(norm) && !isTerminalStatus(prevNorm)) {
    const dir = /in\b|inbound|incoming/.test(String(direction || '').toLowerCase()) ? 'Incoming' : 'Outgoing';
    const dur = duration ? (' · ' + formatDuration(duration)) : '';
    const desc = dir + ' call — ' + callStatusLabel(norm) + dur;
    try {
      await supabase.from('lead_activity').insert({
        lead_id: String(contactId), action: 'Call', field: 'Call ' + callStatusLabel(norm),
        old_value: null, new_value: desc, actor: 'Telephony', created_at: new Date().toISOString(),
      });
    } catch (_) { /* lead_activity not migrated — recording row still captured the outcome */ }
  }

  // Re-host the recording (background, already inside after()).
  if (recUrl) {
    const dl = await downloadRecordingToStorage(recUrl, String(callId));
    if (dl) {
      try { await supabase.from('call_recordings').update({ recording_url: dl.publicUrl, recording_path: dl.path }).eq('call_id', String(callId)); } catch (_) {}
    }
  }
}
