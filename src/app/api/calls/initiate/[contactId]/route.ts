import { supabase } from '@/lib/supabase';
import { clickToCall, clickToCallSupport, normalizePhone } from '@/lib/tata';

export const dynamic = 'force-dynamic';

// POST /api/calls/initiate/:contactId  → click-to-call the lead's mobile number.
export async function POST(_req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    const key = process.env.TATA_TELE_API_KEY;
    // Who rings first: an agent EXTENSION (preferred, passed raw) or a mobile (normalised).
    const extRaw = (process.env.TATA_TELE_DEFAULT_EXTENSION_NUMBER || '').trim();
    const agentMobileRaw = (process.env.TATA_TELE_DEFAULT_AGENT_NUMBER || '').trim();
    const callerId = process.env.TATA_TELE_CALLER_ID || '';
    const useExt = !!extRaw;
    const agent = useExt ? extRaw : (normalizePhone(agentMobileRaw) || agentMobileRaw);
    if (!key || !agent || !callerId) {
      return Response.json({ ok: false, error: 'Telephony not configured — set TATA_TELE_API_KEY, TATA_TELE_DEFAULT_EXTENSION_NUMBER (or TATA_TELE_DEFAULT_AGENT_NUMBER) and TATA_TELE_CALLER_ID in the environment.' }, { status: 503 });
    }

    const { data } = await supabase.from('leads').select('name,phone').eq('meta_lead_id', contactId).limit(1);
    const lead = data && data[0];
    if (!lead) return Response.json({ ok: false, error: 'Lead not found' }, { status: 404 });

    const destination = normalizePhone(lead.phone);
    if (!destination || destination.length < 13) {
      return Response.json({ ok: false, error: 'This lead has no valid mobile number to call.' }, { status: 400 });
    }

    // Only sanity-check when a MOBILE agent number is used. Extensions are short
    // codes / agent IDs mapped inside Smartflo, so we pass them through untouched.
    if (!useExt) {
      const agentDigits = agentMobileRaw.replace(/\D/g, '');
      const agentValid = [10, 11, 12].indexOf(agentDigits.length) >= 0 && /^\+91[6-9]\d{9}$/.test(agent);
      if (!agentValid) {
        return Response.json({
          ok: false,
          error: 'TATA_TELE_DEFAULT_AGENT_NUMBER ("' + agentMobileRaw + '") is not a valid mobile. It normalised to "' + agent + '". Set it to your real 10-digit mobile (e.g. +919XXXXXXXXX), or use TATA_TELE_DEFAULT_EXTENSION_NUMBER for an agent extension.',
          agent, agentRaw: agentMobileRaw, config: 'agent_number',
        }, { status: 400 });
      }
    }

    console.log('[call-initiate] contact=%s agent=%s(%s) callerId=%s dest=%s', contactId, agent, useExt ? 'ext' : 'mobile', callerId, destination);

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
    console.log('[call-initiate] smartflo ok=%s status=%s callId=%s raw=%j', r.ok, r.status, r.callId, r.raw);
    if (!r.ok) return Response.json({ ok: false, error: r.error || 'Call could not be placed', provider: r.raw, providerStatus: r.status }, { status: 502 });

    // ALWAYS write a call-log row so the Call Logs panel shows the attempt
    // immediately — even when Smartflo's async dial returns no call_id yet.
    // Keyed on call_id (real if given, else a synthetic 'init-…') so the webhook
    // can UPDATE the same row when the real call_id matches.
    const logId = r.callId ? String(r.callId) : ('init-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    let logged = true;
    try {
      const { error } = await supabase.from('call_recordings').upsert({
        call_id: logId, contact_id: contactId, from_number: agent, to_number: destination,
        agent_number: agent, direction: 'outbound', call_status: 'initiated', raw_payload: r.raw || {},
      }, { onConflict: 'call_id' });
      if (error) logged = false;
    } catch (_) { logged = false; }
    return Response.json({ ok: true, callId: r.callId || null, logged, agent, agentType: useExt ? 'ext' : 'mobile', callerId, provider: r.raw });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'server error' }, { status: 500 });
  }
}
