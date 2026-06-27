import { supabase } from '@/lib/supabase';
import { clickToCall, clickToCallSupport, normalizePhone } from '@/lib/tata';

export const dynamic = 'force-dynamic';

// POST /api/calls/initiate/:contactId  → click-to-call the lead's mobile number.
export async function POST(_req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    const key = process.env.TATA_TELE_API_KEY;
    const agentRaw = process.env.TATA_TELE_DEFAULT_AGENT_NUMBER || '';
    const callerId = process.env.TATA_TELE_CALLER_ID || '';
    if (!key || !agentRaw || !callerId) {
      return Response.json({ ok: false, error: 'Telephony not configured — set TATA_TELE_API_KEY, TATA_TELE_DEFAULT_AGENT_NUMBER and TATA_TELE_CALLER_ID in the environment.' }, { status: 503 });
    }

    const { data } = await supabase.from('leads').select('name,phone').eq('meta_lead_id', contactId).limit(1);
    const lead = data && data[0];
    if (!lead) return Response.json({ ok: false, error: 'Lead not found' }, { status: 404 });

    const destination = normalizePhone(lead.phone);
    if (!destination || destination.length < 13) {
      return Response.json({ ok: false, error: 'This lead has no valid mobile number to call.' }, { status: 400 });
    }
    const agent = normalizePhone(agentRaw) || agentRaw;

    // Primary JSON click_to_call; fall back to the support endpoint if needed.
    let r = await clickToCall({
      agentNumber: agent,
      destinationNumber: destination,
      callerId,
      customIdentifier: { contact_id: contactId, contact_name: lead.name || '', source: 'CRM' },
    });
    if (!r.ok && process.env.TATA_TELE_USE_SUPPORT_FALLBACK === '1') {
      r = await clickToCallSupport({ destinationNumber: callerId, customerNumber: destination, didNumber: callerId });
    }
    if (!r.ok) return Response.json({ ok: false, error: r.error || 'Call could not be placed' }, { status: 502 });

    // Pre-insert a row keyed on call_id so the webhook UPDATEs it (dedup) later.
    if (r.callId) {
      try {
        await supabase.from('call_recordings').upsert({
          call_id: String(r.callId), contact_id: contactId, from_number: agent, to_number: destination,
          agent_number: agent, direction: 'outbound', call_status: 'initiated', raw_payload: r.raw || {},
        }, { onConflict: 'call_id' });
      } catch (_) { /* table not migrated yet — call still placed */ }
    }
    return Response.json({ ok: true, callId: r.callId || null });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'server error' }, { status: 500 });
  }
}
