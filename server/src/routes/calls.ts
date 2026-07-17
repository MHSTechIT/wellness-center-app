import type { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';
import {
  tataConfig,
  clickToCall,
  clickToCallSupport,
  normalizePhone,
  pickAlias,
  digits10,
  downloadRecordingToStorage,
  normalizeCallStatus,
  isTerminalStatus,
  callStatusLabel,
  formatDuration,
  fetchCallRecords,
} from '../services/tata';

// ============================================================
// POST /api/calls/initiate/:contactId — click-to-call the lead's mobile.
// ============================================================
async function initiate(req: Request, res: Response) {
  try {
    const contactId = req.params.contactId;
    // Which PAGE triggered the call (advisor / coach / reception) — each can be configured
    // with its own extension + caller ID in .env.local (tata_tele_*_<role>), so the call
    // rings the right desk phone and shows the right caller ID for that team.
    const role = String((req.query.role as string) || req.body?.role || '').trim().toLowerCase();
    const cfg = tataConfig(role);   // reads .env.local (tata_tele_*[_role]) with UPPERCASE fallback
    const key = cfg.apiKey;
    const extRaw = cfg.extension;
    const agentMobileRaw = cfg.agentNumber;
    const callerId = cfg.callerId;
    const useExt = !!extRaw;
    const agent = useExt ? extRaw : normalizePhone(agentMobileRaw) || agentMobileRaw;
    if (!key || !agent || !callerId) {
      res.status(503).json({ ok: false, error: 'Telephony not configured — set tata_tele_api_key, tata_tele_default_extension_number and tata_tele_caller_id in .env.local.' });
      return;
    }

    const { data } = await supabase.from('leads').select('name,phone').eq('meta_lead_id', contactId).limit(1);
    const lead = data && data[0];
    if (!lead) { res.status(404).json({ ok: false, error: 'Lead not found' }); return; }

    const destination = normalizePhone(lead.phone);
    if (!destination || destination.length < 13) {
      res.status(400).json({ ok: false, error: 'This lead has no valid mobile number to call.' });
      return;
    }

    if (!useExt) {
      const agentDigits = agentMobileRaw.replace(/\D/g, '');
      const agentValid = [10, 11, 12].indexOf(agentDigits.length) >= 0 && /^\+91[6-9]\d{9}$/.test(agent);
      if (!agentValid) {
        res.status(400).json({
          ok: false,
          error: 'TATA_TELE_DEFAULT_AGENT_NUMBER ("' + agentMobileRaw + '") is not a valid mobile. It normalised to "' + agent + '". Set it to your real 10-digit mobile (e.g. +919XXXXXXXXX), or use TATA_TELE_DEFAULT_EXTENSION_NUMBER for an agent extension.',
          agent, agentRaw: agentMobileRaw, config: 'agent_number',
        });
        return;
      }
    }

    console.log('[call-initiate] contact=%s role=%s agent=%s(%s) callerId=%s dest=%s', contactId, role || '(default)', agent, useExt ? 'ext' : 'mobile', callerId, destination);

    let r = await clickToCall({
      agentNumber: agent,
      destinationNumber: destination,
      callerId,
      customIdentifier: { contact_id: contactId, contact_name: lead.name || '', source: 'CRM' },
    });
    if (!r.ok && cfg.useSupportFallback) {
      r = await clickToCallSupport({ destinationNumber: callerId, customerNumber: destination, didNumber: callerId });
    }
    console.log('[call-initiate] smartflo ok=%s status=%s callId=%s raw=%j', r.ok, r.status, r.callId, r.raw);
    if (!r.ok) { res.status(502).json({ ok: false, error: r.error || 'Call could not be placed', provider: r.raw, providerStatus: r.status }); return; }

    const logId = r.callId ? String(r.callId) : ('init-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    let logged = true;
    try {
      const { error } = await supabase.from('call_recordings').upsert({
        call_id: logId, contact_id: contactId, from_number: agent, to_number: destination,
        agent_number: agent, direction: 'outbound', call_status: 'initiated', raw_payload: r.raw || {},
      }, { onConflict: 'call_id' });
      if (error) logged = false;
    } catch (_) { logged = false; }
    res.json({ ok: true, callId: r.callId || null, logged, agent, agentType: useExt ? 'ext' : 'mobile', callerId, role: role || null, provider: r.raw });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}

// ============================================================
// POST /api/calls/webhook/recording — Smartflo posts when a call ends.
// NO auth. Ack 200 immediately, then process in the background.
// ============================================================
async function webhook(req: Request, res: Response) {
  const payload: any = req.body && Object.keys(req.body).length ? req.body : {};
  res.json({ ok: true });
  // Fire-and-forget (Express has no next/after; the response is already sent).
  processRecording(payload).catch(() => {});
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

  let contactId: string | null = null;
  const ci = p && p.custom_identifier;
  if (ci && ci.contact_id != null) contactId = String(ci.contact_id);
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

  let prevNorm = '';
  try {
    const { data: ex } = await supabase.from('call_recordings').select('contact_id,call_status').eq('call_id', String(callId)).limit(1);
    if (ex && ex[0]) {
      prevNorm = normalizeCallStatus(ex[0].call_status || '', 0, direction);
      if (!contactId && ex[0].contact_id) contactId = String(ex[0].contact_id);
    }
  } catch (_) {}

  const row: any = {
    call_id: String(callId), contact_id: contactId, recording_url: recUrl || null,
    duration_seconds: duration, from_number: fromNum || null, to_number: toNum || null,
    direction: direction || null, call_status: norm, raw_payload: p,
  };
  try { await supabase.from('call_recordings').upsert(row, { onConflict: 'call_id' }); } catch (_) { return; }

  if (contactId && isTerminalStatus(norm) && !isTerminalStatus(prevNorm)) {
    const dir = /in\b|inbound|incoming/.test(String(direction || '').toLowerCase()) ? 'Incoming' : 'Outgoing';
    const dur = duration ? ' · ' + formatDuration(duration) : '';
    const desc = dir + ' call — ' + callStatusLabel(norm) + dur;
    try {
      await supabase.from('lead_activity').insert({
        lead_id: String(contactId), action: 'Call', field: 'Call ' + callStatusLabel(norm),
        old_value: null, new_value: desc, actor: 'Telephony', created_at: new Date().toISOString(),
      });
    } catch (_) {}
  }

  if (recUrl) {
    const dl = await downloadRecordingToStorage(recUrl, String(callId));
    if (dl) {
      try { await supabase.from('call_recordings').update({ recording_url: dl.publicUrl, recording_path: dl.path }).eq('call_id', String(callId)); } catch (_) {}
    }
  }
}

// ============================================================
// PUT /api/calls/:contactId/latest-type — tag the newest untyped recording.
// ============================================================
async function latestType(req: Request, res: Response) {
  try {
    const contactId = req.params.contactId;
    const body = req.body || {};
    const callType = body && body.callType ? String(body.callType) : '';
    if (!callType) { res.status(400).json({ ok: false, error: 'callType is required' }); return; }

    const { data, error } = await supabase
      .from('call_recordings')
      .select('id')
      .eq('contact_id', contactId)
      .or('call_type.is.null,call_type.eq.')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) { res.status(200).json({ ok: false, error: error.message }); return; }
    const rec = data && data[0];
    if (!rec) { res.status(404).json({ ok: false, error: 'No untyped recording to tag' }); return; }

    const upd = await supabase.from('call_recordings').update({ call_type: callType }).eq('id', rec.id);
    if (upd.error) { res.status(200).json({ ok: false, error: upd.error.message }); return; }
    res.json({ ok: true, id: rec.id, callType });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}

// ============================================================
// GET /api/calls/:contactId/recordings — list this lead's recordings.
// ============================================================
async function recordings(req: Request, res: Response) {
  try {
    const contactId = req.params.contactId;
    const { data, error } = await supabase
      .from('call_recordings')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    if (error) { res.status(200).json({ ok: false, error: error.message, recordings: [] }); return; }
    res.json({ ok: true, recordings: data || [] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'server error', recordings: [] });
  }
}

// ============================================================
// GET /api/calls/:contactId/sync — PULL final call status + recordings from Smartflo's CDR API
// and sync them into call_recordings for this lead. This makes calls resolve (Answered/Missed…)
// and recordings appear even when the push webhook never arrives (e.g. localhost / no webhook URL).
// Matches CDR records to the lead by the customer's phone number.
// ============================================================
async function syncProvider(req: Request, res: Response) {
  try {
    const contactId = req.params.contactId;
    const { data } = await supabase.from('leads').select('phone').eq('meta_lead_id', contactId).limit(1);
    const lead = data && data[0];
    const phone10 = lead ? digits10(lead.phone) : '';
    if (!phone10) { res.json({ ok: false, error: 'lead has no phone number', synced: 0 }); return; }

    // Window: last 30 days (CDR is date-filtered).
    const to = new Date(); const from = new Date(to.getTime() - 30 * 24 * 3600 * 1000);
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    const recs = await fetchCallRecords(fmt(from) + ' 00:00:00', fmt(to) + ' 23:59:59', 2000);
    const mine = recs.filter((r: any) => digits10(r.client_number || r.destination_number || r.to || r.caller_id_num || '') === phone10);

    let synced = 0;
    for (const r of mine) {
      const dur = Number(r.answered_seconds || r.total_call_duration || r.call_duration || 0) || 0;
      const norm = normalizeCallStatus(r.status || r.description, dur, r.direction);
      let createdAt = new Date().toISOString();
      if (r.date && r.time) { const d = new Date(String(r.date) + 'T' + String(r.time) + '+05:30'); if (!isNaN(d.getTime())) createdAt = d.toISOString(); }
      // Smartflo recording URLs self-authenticate via a ?token= param and stream audio/mp3, so
      // the browser plays/downloads them directly — no re-hosting or proxy needed.
      const recUrl: string | null = r.recording_url || null;
      const row: any = {
        call_id: String(r.call_id || r.uuid || r.id), contact_id: contactId,
        recording_url: recUrl, duration_seconds: dur,
        from_number: r.agent_number || null, to_number: r.client_number || null,
        agent_number: r.agent_number || null, direction: r.direction || 'outbound',
        call_status: norm, raw_payload: r, created_at: createdAt,
      };
      try { await supabase.from('call_recordings').upsert(row, { onConflict: 'call_id' }); synced++; } catch (_) {}
    }
    // Drop the transient "initiated" placeholder rows (fallback ids) now that the real CDR rows exist.
    if (synced > 0) { try { await supabase.from('call_recordings').delete().eq('contact_id', contactId).ilike('call_id', 'init-%'); } catch (_) {} }

    res.json({ ok: true, synced, matched: mine.length, scanned: recs.length });
  } catch (e: any) {
    res.json({ ok: false, error: e?.message || 'server error', synced: 0 });
  }
}

export function registerCallRoutes(app: Express) {
  app.post('/api/calls/initiate/:contactId', initiate);
  app.post('/api/calls/webhook/recording', webhook);
  app.put('/api/calls/:contactId/latest-type', latestType);
  app.get('/api/calls/:contactId/recordings', recordings);
  app.get('/api/calls/:contactId/sync', syncProvider);
}
