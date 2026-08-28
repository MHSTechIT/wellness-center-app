import type { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';
import { requireAuth } from '../shared/session';
import {
  tataConfig,
  tataConfigForUser,
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
  configuredCallerNumbers,
  isOwnCallRecord,
  hangupCall,
  liveCalls,
  findLiveCallFor,} from '../services/tata';

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
    // Per-user DID/extension (Settings → Users & Assignees), falling back to the role env vars and
    // then the unsuffixed base. Resolved from the SESSION email that requireAuth already verified —
    // never from the request body, since /db/query lets any authenticated user write app_users, so
    // a client-supplied DID would let anyone place calls under someone else's caller ID.
    const cfg = await tataConfigForUser(req.user?.email, role);
    const key = cfg.apiKey;
    const extRaw = cfg.extension;
    const agentMobileRaw = cfg.agentNumber;
    const callerId = cfg.callerId;
    const useExt = !!extRaw;
    const agent = useExt ? extRaw : normalizePhone(agentMobileRaw) || agentMobileRaw;
    if (!key || !agent || !callerId) {
      const missing = [!key && 'API key', !agent && 'agent extension/number', !callerId && 'caller ID'].filter(Boolean).join(', ');
      res.status(503).json({ ok: false, error: 'Telephony not configured — missing: ' + missing + '. Set this user\'s DID and Extension in Settings → Users & Assignees, or set tata_tele_api_key / tata_tele_default_extension_number / tata_tele_caller_id (optionally per-role, e.g. _' + (role || 'advisor') + ') in the server environment. Check /api/calls/config-status?role=' + (role || '') + '.' });
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
    if (!r.ok) {
      // Smartflo's raw strings are accurate but unactionable on their own — "Agent is Offline"
      // reached the user as a bare red toast with no way to know WHICH phone was rung or what to
      // do about it (reported 28-Aug-2026). Click-to-call rings the AGENT extension first and only
      // bridges the customer once it answers, so an unregistered softphone fails every call while
      // the identical request succeeds minutes later once someone logs in. Name the extension, say
      // whose it is, and point at the two places that fix it.
      const providerMsg = String(r.error || '');
      let errMsg = providerMsg || 'Call could not be placed';
      if (/agent\s*(is\s*)?offline|agent\s*not\s*(available|online)/i.test(providerMsg)) {
        errMsg = 'Agent is offline — Smartflo could not ring extension ' + agent + ', so the call was never placed. '
          + 'Click-to-call rings that extension first and only then the customer, so it has to be logged in and Available in the Tata/Smartflo agent app (softphone or desk phone). '
          + (cfg.perUser
              ? 'That is your own extension from Settings → Users & Assignees.'
              : 'That is the shared ' + (role || 'default') + ' extension — everyone on this page dials through it. Set your own DID + Extension in Settings → Users & Assignees so calls ring your phone instead.');
      }
      res.status(502).json({ ok: false, error: errMsg, provider: r.raw, providerStatus: r.status, agent, perUser: !!cfg.perUser });
      return;
    }

    const logId = r.callId ? String(r.callId) : ('init-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    let logged = true;
    try {
      const { error } = await supabase.from('call_recordings').upsert({
        call_id: logId, contact_id: contactId, from_number: agent, to_number: destination,
        agent_number: agent, direction: 'outbound', call_status: 'initiated', raw_payload: r.raw || {},
        // WHO clicked Call — requireAuth already decoded this from the session token, so it costs
        // nothing to capture. It is the only reliable per-individual identity available: the Tata
        // extension/caller ID are configured per ROLE (all advisors share one), and Smartflo's own
        // CDR agent_number doesn't map to any advisor's phone on file either. This is what lets the
        // Advisor dashboard show "MY calls", not "calls to leads assigned to me" (see app.ts
        // _loadAdvCallStats — the bug this closes: a call someone else placed was being counted
        // against whichever advisor the lead happens to be assigned to today).
        initiated_by_email: req.user?.email || null, initiated_by_name: req.user?.name || null,
        // The provider's originate reference. /v1/call/hangup accepts it, so storing it is what
        // lets End Call drop THIS call later even if the browser reloaded in between.
        provider_ref_id: r.refId || null,
      }, { onConflict: 'call_id' });
      if (error) logged = false;
    } catch (_) { logged = false; }
    res.json({ ok: true, callId: r.callId || null, refId: r.refId || null, logId, destination, logged, agent, agentType: useExt ? 'ext' : 'mobile', callerId, role: role || null, provider: r.raw });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}

// ============================================================
// POST /api/calls/hangup — drop a live call from the app's own End Call button.
// Click-to-call places the agent leg on a real handset, so nothing in the browser can end it; only
// the provider can tear the bridge down. Smartflo's /v1/call/hangup takes either identifier, so we
// try the originate ref_id first and fall back to the live-call list for a real call_id (an
// answered leg can outlive its originate reference). A 200 only means ACCEPTED, so the response
// also reports whether the line is actually gone from live_calls — the UI states the difference
// instead of claiming success it cannot see.
// ============================================================
async function hangup(req: Request, res: Response) {
  try {
    const refId = String(req.body?.refId || '').trim() || null;
    const callIdIn = String(req.body?.callId || '').trim() || null;
    const destination = String(req.body?.destination || '').trim();
    if (!refId && !callIdIn && !destination) { res.status(400).json({ ok: false, error: 'Nothing to hang up — no call reference was supplied.' }); return; }

    let live = await liveCalls();
    let liveMatch = destination ? findLiveCallFor(live, destination) : null;
    // Nothing live for this lead: the call already ended on its own (the usual case when someone
    // hangs up the handset first). Report it as ended rather than as a failed hangup.
    if (!liveMatch && !refId && !callIdIn) { res.json({ ok: true, alreadyEnded: true, verified: true }); return; }

    let r = await hangupCall({ callId: callIdIn || (liveMatch && (liveMatch.call_id || liveMatch.callId)) || null, refId });
    if (!r.ok && !callIdIn) {
      const cid = liveMatch && (liveMatch.call_id || liveMatch.callId);
      if (cid) r = await hangupCall({ callId: String(cid) });
    }

    // Verify against the provider rather than trusting the acknowledgement.
    let verified = false;
    if (r.ok && destination) {
      await new Promise((rs) => setTimeout(rs, 1200));
      live = await liveCalls();
      verified = !findLiveCallFor(live, destination);
    }
    if (!r.ok && destination) {
      live = await liveCalls();
      if (!findLiveCallFor(live, destination)) { res.json({ ok: true, alreadyEnded: true, verified: true }); return; }
    }
    console.log('[call-hangup] ref=%s callId=%s dest=%s ok=%s verified=%s raw=%j', refId, callIdIn, destination, r.ok, verified, r.raw);
    if (!r.ok) { res.status(502).json({ ok: false, error: r.error || 'The provider would not end the call', provider: r.raw }); return; }
    res.json({ ok: true, verified });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}

// ============================================================
// POST /api/calls/webhook/recording — Smartflo posts when a call ends.
// Called by Tata's servers, not a logged-in browser, so it can't use requireAuth (no session) —
// it needs its own proof this really came from Tata instead. Smartflo doesn't sign requests, so
// the standard fallback is a shared secret embedded in the webhook URL you register with them:
// set TATA_WEBHOOK_SECRET and register .../webhook/recording?secret=<that value> as the callback
// URL in the Smartflo dashboard. Until TATA_WEBHOOK_SECRET is set, this stays open (so the
// integration doesn't silently stop working) but logs a loud warning on every call so the gap is
// visible in the server logs rather than invisible.
// ============================================================
let _warnedWebhookOpen = false;
async function webhook(req: Request, res: Response) {
  const expected = process.env.TATA_WEBHOOK_SECRET;
  if (expected) {
    const got = typeof req.query.secret === 'string' ? req.query.secret : '';
    if (got !== expected) { res.status(403).json({ ok: false }); return; }
  } else if (!_warnedWebhookOpen) {
    _warnedWebhookOpen = true;
    // Repeated every 30 minutes, not once at boot: a single line in a log nobody scrolls back
    // through is how this stayed open. Until the secret is set, anyone who knows the URL can POST
    // a call record and inflate an advisor's numbers.
    const nag = () => console.warn(
      '[wellness-api] SECURITY: TATA_WEBHOOK_SECRET is not set - /api/calls/webhook/recording '
      + 'accepts UNAUTHENTICATED posts, so anyone who knows the URL can write call history. '
      + 'Set TATA_WEBHOOK_SECRET in the environment and append ?secret=<value> to the URL '
      + 'configured in the Tata/Smartflo console.');
    nag();
    setInterval(nag, 30 * 60 * 1000).unref();
  }
  const payload: any = req.body && Object.keys(req.body).length ? req.body : {};
  res.json({ ok: true });
  // Fire-and-forget (Express has no next/after; the response is already sent).
  processRecording(payload).catch(() => {});
}

async function processRecording(p: any) {
  const callId = pickAlias(p, ['call_id', 'callId', 'uuid', 'id']);
  if (!callId) return;
  const recUrl = pickAlias(p, ['recording_url', 'recordingUrl', 'recording', 'file']);
  // Prefer actual TALK time over ring/setup time — see the matching fix + full explanation in
  // syncProvider below. pickAlias (unlike `||`) already treats a real 0 correctly (it only skips a
  // key that is null/undefined/''), so listing 'answered_seconds' first is enough here; unlike
  // syncProvider there was no `||` chain bug to fix, just a missing alias.
  const duration = Number(pickAlias(p, ['answered_seconds', 'call_duration', 'duration', 'billsec']) || 0) || 0;
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
  // NEVER write initiated_by_* here. Only /api/calls/initiate may set them, at the moment somebody
  // actually clicks Call — that is what makes their absence trustworthy evidence that a call came
  // from an external line rather than this app. The upsert below builds its SET clause from this
  // row's own keys, so omitting them leaves an existing stamp untouched when the provider later
  // reports on a call the app DID place.
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
    // This matches Smartflo's CDR to a lead PURELY by the customer's phone number — the whole
    // Tata account's call history to that number, from ANY agent/extension/softphone, not just
    // calls placed through this app's Call button. Reported: Vasanthan's Call History showed 3
    // calls from "Gayathri-Extension" that no one placed from our CRM — this endpoint had
    // unconditionally inserted every CDR match as if it were our own call activity.
    //
    // The fix: only ever CREATE a new call_recordings row when it corresponds to a placeholder
    // OUR /api/calls/initiate already wrote (the 'init-...' row, stamped with initiated_by_email
    // at the moment Call was clicked — see initiate()). A CDR record with no such placeholder to
    // match is a call this app never triggered and is skipped entirely — it will not appear in
    // Call History or count toward any KPI. A CDR record whose call_id we ALREADY have (already
    // synced, or a rare case where Tata's click-to-call response gave us the real id up front)
    // still just updates that existing row as before.
    const mine = recs.filter((r: any) => digits10(r.client_number || r.destination_number || r.to || r.caller_id_num || '') === phone10);

    const { data: existingRows } = await supabase.from('call_recordings').select('id,call_id,created_at,initiated_by_email,initiated_by_name').eq('contact_id', contactId);
    const knownCallIds = new Set((existingRows || []).filter((x: any) => !String(x.call_id || '').startsWith('init-')).map((x: any) => String(x.call_id)));
    const placeholders = (existingRows || [])
      .filter((x: any) => String(x.call_id || '').startsWith('init-'))
      .map((x: any) => ({ ...x, used: false, t: new Date(x.created_at).getTime() }));
    // A placeholder and its real CDR row are the SAME dial, so they should be very close in time —
    // the placeholder is written the instant Call is clicked; Smartflo's own timestamp for that
    // dial can't be far off. 10 minutes generously covers clock skew and a slow-to-connect call
    // without being wide enough to misattribute a genuinely different, later call to the number.
    const MATCH_WINDOW_MS = 10 * 60 * 1000;
    const consumedPlaceholderIds: string[] = [];
    const ownNumbers = await configuredCallerNumbers();

    let synced = 0, skippedExternal = 0;
    for (const r of mine) {
      // answered_seconds is the actual TALK time (0 when the call was never picked up);
      // total_call_duration / call_duration include ring/setup time and are non-zero even for a
      // pure miss. `||` treats a genuine 0 as "missing" and falls through to those ring-time
      // fields, which is exactly backwards — confirmed against live data: every one of Vasanthan's
      // 3 calls (and 54 of 89 "answered" rows clinic-wide) has raw status "missed" / "Call missed
      // by customer" and answered_seconds=0, but a non-zero call_duration (1-46s of ringing before
      // hangup) made this line compute a fake talk time, which then made normalizeCallStatus's
      // "duration>0 → answered" shortcut override the correct "missed" classification. Use ?? so a
      // real 0 stays 0, and only an ABSENT field (undefined/null — a provider response that omits
      // answered_seconds entirely) falls back to the ring-time fields as a last resort.
      const dur = Number(r.answered_seconds ?? r.total_call_duration ?? r.call_duration ?? 0) || 0;
      const norm = normalizeCallStatus(r.status || r.description, dur, r.direction);
      let createdAt = new Date().toISOString();
      if (r.date && r.time) { const d = new Date(String(r.date) + 'T' + String(r.time) + '+05:30'); if (!isNaN(d.getTime())) createdAt = d.toISOString(); }
      const callId = String(r.call_id || r.uuid || r.id);

      let initiatedByEmail: string | null = null, initiatedByName: string | null = null;
      if (!knownCallIds.has(callId)) {
        // Brand-new call_id — two INDEPENDENT ways to recognise this as a call this app placed:
        // (a) it correlates with a placeholder /api/calls/initiate wrote for this lead within the
        //     match window — the strongest signal, since it also tells us WHICH advisor's login
        //     triggered it (inherited below for the personal Connected-Calls KPI).
        // (b) its extension_c2c / caller_id_num / did_number matches one of this clinic's
        //     configured Tata extensions/caller IDs (isOwnCallRecord) — proven reliable against
        //     real data: a confirmed-genuine call matched exactly, three confirmed-external calls
        //     ("Gayathri-Extension") matched neither field on any of them. This doesn't identify
        //     WHICH advisor (several share one role's extension), only that the call came from a
        //     line this clinic controls, so it's accepted for visibility without attribution.
        // Neither signal firing means this app never triggered the call — skip it entirely rather
        // than let it appear in this lead's history.
        const t = new Date(createdAt).getTime();
        let best: any = null, bestDiff = Infinity;
        for (const p of placeholders) {
          if (p.used) continue;
          const diff = Math.abs(p.t - t);
          if (diff <= MATCH_WINDOW_MS && diff < bestDiff) { best = p; bestDiff = diff; }
        }
        if (best) {
          best.used = true;
          consumedPlaceholderIds.push(best.id);
          initiatedByEmail = best.initiated_by_email || null;
          initiatedByName = best.initiated_by_name || null;
        } else if (!isOwnCallRecord(r, ownNumbers)) {
          skippedExternal++; continue;
        }
      }

      // Smartflo recording URLs self-authenticate via a ?token= param and stream audio/mp3, so
      // the browser plays/downloads them directly — no re-hosting or proxy needed.
      const recUrl: string | null = r.recording_url || null;
      const row: any = {
        call_id: callId, contact_id: contactId,
        recording_url: recUrl, duration_seconds: dur,
        from_number: r.agent_number || null, to_number: r.client_number || null,
        agent_number: r.agent_number || null, direction: r.direction || 'outbound',
        call_status: norm, raw_payload: r, created_at: createdAt,
        // Only set on a genuinely new row (a matched placeholder) — omitted for an update to an
        // already-known row, so the generic upsert's dynamic SET clause (built from the row's own
        // keys) never touches an existing initiated_by_* value it wasn't given.
        ...(initiatedByEmail || initiatedByName ? { initiated_by_email: initiatedByEmail, initiated_by_name: initiatedByName } : {}),
      };
      try { await supabase.from('call_recordings').upsert(row, { onConflict: 'call_id' }); synced++; } catch (_) {}
    }
    // Remove exactly the placeholders that were matched and replaced above — never a blanket
    // "every init-% row for this contact", so an unmatched placeholder (its CDR record hasn't
    // appeared yet, or Smartflo simply never reports the call) survives for a later sync attempt
    // instead of silently vanishing.
    if (consumedPlaceholderIds.length) { try { await supabase.from('call_recordings').delete().in('id', consumedPlaceholderIds); } catch (_) {} }

    res.json({ ok: true, synced, matched: mine.length, scanned: recs.length, skippedExternal });
  } catch (e: any) {
    res.json({ ok: false, error: e?.message || 'server error', synced: 0 });
  }
}

// GET /api/calls/config-status[?role=advisor|coach|reception] — reports WHICH telephony config
// values are present for a role (booleans only, NEVER the secret values), so operators can verify
// the deployed server's environment is configured without exposing the API key / caller IDs.
async function configStatus(req: Request, res: Response) {
  const role = String((req.query.role as string) || '').trim().toLowerCase();
  // Report readiness for the CALLER, not just the role: with per-user DIDs, the role env can be
  // fully configured while this individual still cannot dial (or vice versa). `perUser` says which
  // layer answered. Booleans only — never the DID/extension/key values themselves.
  const cfg: any = await tataConfigForUser(req.user?.email, role);
  res.json({
    ok: true,
    role: role || '(default)',
    user: req.user?.email || null,
    perUser: !!cfg.perUser,
    hasApiKey: !!cfg.apiKey,
    hasExtension: !!cfg.extension,
    hasAgentNumber: !!cfg.agentNumber,
    hasCallerId: !!cfg.callerId,
    ready: !!(cfg.apiKey && (cfg.extension || cfg.agentNumber) && cfg.callerId),
  });
}

export function registerCallRoutes(app: Express) {
  // requireAuth on every staff-facing route — placing a call, reading recordings, and the config
  // diagnostic were all previously reachable with no credentials. The webhook is deliberately NOT
  // gated by requireAuth: it's called by the telephony provider, not a logged-in browser session —
  // it gets its own signature/shared-secret verification instead (see webhook()).
  app.post('/api/calls/initiate/:contactId', requireAuth, initiate);
  app.post('/api/calls/hangup', requireAuth, hangup);
  app.post('/api/calls/webhook/recording', webhook);
  app.put('/api/calls/:contactId/latest-type', requireAuth, latestType);
  app.get('/api/calls/:contactId/recordings', requireAuth, recordings);
  app.get('/api/calls/:contactId/sync', requireAuth, syncProvider);
  app.get('/api/calls/config-status', requireAuth, configStatus);
}
