import { after } from 'next/server';
import { supabase } from '@/lib/supabase';
import { pickAlias, digits10, downloadRecordingToStorage } from '@/lib/tata';

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

  // Dedup on call_id: upsert merges into the pre-inserted 'initiated' row if present.
  const row: any = {
    call_id: String(callId), contact_id: contactId, recording_url: recUrl || null,
    duration_seconds: duration, from_number: fromNum || null, to_number: toNum || null,
    direction: direction || null, call_status: status || null, raw_payload: p,
  };
  try { await supabase.from('call_recordings').upsert(row, { onConflict: 'call_id' }); } catch (_) { return; }

  // Re-host the recording (background, already inside after()).
  if (recUrl) {
    const dl = await downloadRecordingToStorage(recUrl, String(callId));
    if (dl) {
      try { await supabase.from('call_recordings').update({ recording_url: dl.publicUrl, recording_path: dl.path }).eq('call_id', String(callId)); } catch (_) {}
    }
  }
}
