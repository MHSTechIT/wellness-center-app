import type { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';
import { requireAuth } from '../shared/session';
import {
  syncMetaLeadsToSupabase,
  getMetaToken,
  checkTokenValidity,
  exchangeForLongLivedToken,
  adAccountNames,
  metaTargetAdAccounts,
  metaTargetFormIds,
  fetchCampaignStatuses,
  fetchFormStatuses,
} from '../services/meta';

// ============================================================
// GET /api/meta/leads — read synced Meta leads from Supabase (fast).
// The heavy Meta crawl happens in /api/meta/sync.
// ============================================================
async function getLeads(_req: Request, res: Response) {
  try {
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];
    async function fetchPage(start: number): Promise<any[]> {
      let lastErr: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('source', 'Meta Ads')
            .order('created_at', { ascending: false })
            .range(start, start + pageSize - 1);
          if (error) throw new Error(error.message);
          return data || [];
        } catch (e: any) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
      }
      throw lastErr || new Error('fetch failed');
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await fetchPage(from);
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const now = Date.now();
    const leads = all.map((r) => {
      const createdAt = r.created_at || r.lead_date;
      const diffMin = Math.floor((now - new Date(createdAt).getTime()) / 60000);
      let received: string;
      if (diffMin < 1) received = 'now';
      else if (diffMin < 60) received = `${diffMin}m`;
      else if (diffMin < 1440) received = `${Math.floor(diffMin / 60)}h`;
      else received = `${Math.floor(diffMin / 1440)}d`;
      return {
        id: r.meta_lead_id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        source: 'Meta',
        campaign: r.campaign || '—',
        adName: r.ad_name || '',
        sugar: r.sugar_poll || '',
        city: r.city || '',
        street: r.street || '',
        service: r.service || 'Diabetes',
        lang: r.language || 'Tamil',
        received,
        createdAt,
        adAccountName: r.ad_account_name || '',
        isValid: r.is_valid,
        isDuplicate: r.is_duplicate,
        isAssigned: r.is_assigned,
        inPool: !!r.in_pool,
        poolAddedAt: r.pool_added_at || null,
        assignedTo: r.assigned_to || '',
        assignedAt: r.assigned_at || null,
        callStatus: r.call_status || '',
        // The Advisor's Follow-up table shows the PLANNED date & time. It used to read that from a
        // separate per-advisor detail fetch that only runs when the Advisor-load table renders and
        // only covers that table's (deduped, advisor-filtered) row set — so opening the Follow-up
        // card directly left every row showing "—". Carrying it on the lead itself makes it always
        // present, for every lead, with no ordering dependency.
        nextFollowup: r.next_followup || null,
        enrolledAt: r.enrolled_at || null,
        // The Advisor dashboard's "Visited" card is a JOURNEY milestone (did this lead ever visit),
        // not a current-status bucket — without this field every visited lead that later enrolled
        // read as never-visited and the card sat on 0.
        visitedAt: r.visited_at || null,
        // Set BY HAND from the advisor's Visited-status row (never derived from the call status),
        // so the dashboard's Confirmed card counts only appointments someone actually confirmed.
        confirmedAt: r.confirmed_at || null,
      };
    });

    let lastSync: any = null;
    try {
      const { data } = await supabase
        .from('meta_sync_state')
        .select('finished_at,status,leads_synced,accounts_accessible,error')
        .eq('status', 'success')
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false })
        .limit(1);
      lastSync = data?.[0] || null;
      if (!lastSync && all.length) {
        lastSync = { finished_at: all[0].created_at || all[0].lead_date, status: 'success', leads_synced: all.length };
      }
    } catch (_) {}

    const adAccountIds = metaTargetAdAccounts();
    // Which configured ad accounts the last crawl could NOT read. A token without ads_read on an
    // account makes the sync succeed while silently importing fewer leads — production ran for days
    // reading only "MHS DF 01" and nobody could see why its counts trailed dev. Reporting the gap
    // turns a silent shortfall into something the Lead-import page can say out loud.
    const names = adAccountNames();
    const configured = adAccountIds.map((id) => names[id] || id);
    const reachable = String(lastSync?.accounts_accessible || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const unreadableAccounts = lastSync
      ? configured.filter((n) => !reachable.some((r) => r.toLowerCase() === n.toLowerCase()))
      : [];

    res.json({
      leads,
      count: leads.length,
      fetchedAt: new Date().toISOString(),
      adAccounts: adAccountIds.length,
      configuredAccounts: configured,
      unreadableAccounts,
      lastSync,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, leads: [] });
  }
}

// ============================================================
// GET / POST /api/meta/sync — crawl Meta → upsert into Supabase.
// ============================================================
// A crawl is EXPENSIVE: every allowlisted form paginates up to 80 pages, plus every ad in each
// target account. The client auto-syncs on a 5-minute timer, but that timer runs PER OPEN TAB —
// with a handful of staff tabs (and several devices) open, meta_sync_state showed a full crawl
// roughly every MINUTE, i.e. thousands of Graph calls an hour. That is what exhausts Meta's
// app-level quota and returns "(#4) Application request limit reached" to every subsequent call —
// including the ad-account crawl, which is why attribution silently stopped working.
// One shared minimum interval fixes it for the whole fleet: extra callers get the last result
// instead of starting another crawl. Manual "Sync now" still forces a run.
const SYNC_MIN_INTERVAL_MS = Number(process.env.META_SYNC_MIN_INTERVAL_MS || 5 * 60 * 1000);
let _lastSyncAt = 0;
let _lastSyncStats: any = null;
let _syncInFlight: Promise<any> | null = null;

async function runSync(res: Response, force = false) {
  const token = await getMetaToken();
  const adAccountIds = metaTargetAdAccounts();
  const pageIds = (process.env.META_PAGE_IDS || process.env.META_PAGE_ID || '').split(',').filter(Boolean);

  if (pageIds.length === 0) {
    res.status(500).json({ error: 'No page IDs configured' });
    return;
  }

  // Already crawling → wait for THAT crawl rather than starting a second one in parallel.
  if (_syncInFlight) {
    const stats = await _syncInFlight.catch(() => null);
    res.json({ ok: true, syncedAt: new Date(_lastSyncAt).toISOString(), throttled: true, stats: stats || _lastSyncStats });
    return;
  }
  const age = Date.now() - _lastSyncAt;
  if (!force && _lastSyncAt && age < SYNC_MIN_INTERVAL_MS) {
    res.json({ ok: true, syncedAt: new Date(_lastSyncAt).toISOString(), throttled: true, nextInMs: SYNC_MIN_INTERVAL_MS - age, stats: _lastSyncStats });
    return;
  }

  _syncInFlight = syncMetaLeadsToSupabase(adAccountIds, pageIds, token);
  try {
    const stats = await _syncInFlight;
    _lastSyncAt = Date.now();
    _lastSyncStats = stats;
    res.json({ ok: true, syncedAt: new Date(_lastSyncAt).toISOString(), stats });
  } finally {
    _syncInFlight = null;
  }
}

// ============================================================
// Token checks + auto-refresh. Shared by GET /api/meta/token and the daily
// scheduler (replaces the Vercel cron that hit this endpoint once a day).
// ============================================================
export async function refreshExpiringTokens() {
  const tokenChecks: any[] = [];

  const tokenSources = [
    { type: 'system', token: process.env.META_SYSTEM_ACCESS_TOKEN },
    { type: 'page', token: process.env.META_PAGE_ACCESS_TOKEN },
    { type: 'user', token: process.env.META_ACCESS_TOKEN },
  ];

  for (const src of tokenSources) {
    if (!src.token) continue;
    const status = await checkTokenValidity(src.token);
    const expiresAt = status.expiresAt ? new Date(status.expiresAt) : null;
    const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;

    tokenChecks.push({
      type: src.type,
      valid: status.valid,
      expiresAt: status.expiresAt || 'never',
      expiringSoon: !!isExpiringSoon,
      scopes: status.scopes,
    });

    if (status.valid && isExpiringSoon) {
      try {
        const refreshed = await exchangeForLongLivedToken(src.token);
        await supabase.from('meta_tokens').insert({
          token_type: `${src.type}_long_lived`,
          access_token: refreshed.token,
          expires_at: refreshed.expiresIn
            ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
            : null,
          is_active: true,
        });
        await supabase
          .from('meta_tokens')
          .update({ is_active: false })
          .eq('token_type', `${src.type}_long_lived`)
          .lt('created_at', new Date().toISOString());

        tokenChecks[tokenChecks.length - 1].refreshed = true;
        tokenChecks[tokenChecks.length - 1].newExpiresIn = refreshed.expiresIn;
      } catch (e: any) {
        tokenChecks[tokenChecks.length - 1].refreshError = e.message;
      }
    }
  }

  let savedTokens: any[] = [];
  try {
    const { data } = await supabase
      .from('meta_tokens')
      .select('id, token_type, expires_at, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    savedTokens = data || [];
  } catch (_) {}

  return { tokens: tokenChecks, savedTokens, checkedAt: new Date().toISOString() };
}

async function tokenGet(_req: Request, res: Response) {
  try {
    res.json(await refreshExpiringTokens());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

async function tokenPost(_req: Request, res: Response) {
  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
      res.status(500).json({ error: 'Missing META_APP_ID or META_APP_SECRET' });
      return;
    }

    const results: any[] = [];
    const tokensToRefresh = [
      { type: 'user', token: process.env.META_ACCESS_TOKEN },
      { type: 'page', token: process.env.META_PAGE_ACCESS_TOKEN },
    ];

    for (const src of tokensToRefresh) {
      if (!src.token) continue;
      try {
        const refreshed = await exchangeForLongLivedToken(src.token);
        await supabase.from('meta_tokens').insert({
          token_type: `${src.type}_long_lived`,
          access_token: refreshed.token,
          expires_at: refreshed.expiresIn
            ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
            : null,
          is_active: true,
        });
        results.push({ type: src.type, success: true, expiresIn: refreshed.expiresIn });
      } catch (e: any) {
        results.push({ type: src.type, success: false, error: e.message });
      }
    }

    res.json({ results, refreshedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export function registerMetaRoutes(app: Express) {
  // requireAuth on all of these — the daily token-refresh cron (index.ts) calls
  // refreshExpiringTokens() as a direct in-process function call, never over HTTP, so nothing
  // internal needs these routes open. Previously unauthenticated, /api/meta/sync in particular
  // could be hammered by anyone to trigger the lead-prune path (see the crawl-failure guard fix).
  app.get('/api/meta/leads', requireAuth, getLeads);
  // ?force=1 → a human pressed "Sync now"; bypass the shared interval. The unattended
  // per-tab auto-sync must NOT force, or the throttle it exists for is meaningless.
  app.get('/api/meta/sync', requireAuth, (req, res) => runSync(res, req.query.force === '1').catch((e) => res.status(500).json({ error: e.message })));
  app.post('/api/meta/sync', requireAuth, (req, res) => runSync(res, req.query.force === '1').catch((e) => res.status(500).json({ error: e.message })));
  app.get('/api/meta/token', requireAuth, tokenGet);
  app.post('/api/meta/token', requireAuth, tokenPost);
  // Ad-account id → display name, straight from META_TARGET_AD_ACCOUNT_NAMES.
  // The Meta-leads page used to derive these from leads.ad_account_name, but that column is
  // whatever the LAST crawl happened to write: a sync run before the names map was configured
  // stores the raw account id as the name and overwrites any good value on the next upsert, so the
  // filter fell back to "Account 384231607347196". Serving the mapping directly makes the label
  // independent of crawl history — no re-sync needed for a name change to show up.
  // Live campaign status for the Meta-leads Campaign filter. Never fails the page: on a Graph
  // error it returns an empty list plus the reason, and the filter falls back to the campaign
  // names already present in the synced leads (status simply shows as Unknown).
  app.get('/api/meta/campaigns', requireAuth, async (_req, res) => {
    try {
      const ids = metaTargetAdAccounts();
      res.json(await fetchCampaignStatuses(ids));
    } catch (e: any) {
      res.json({ campaigns: [], errors: [{ account: 'all', reason: e?.message || 'lookup failed' }] });
    }
  });
  // Live status for the allowlisted lead forms. Same failure contract as /campaigns.
  app.get('/api/meta/forms', requireAuth, async (_req, res) => {
    try {
      const ids = metaTargetFormIds();
      res.json(await fetchFormStatuses(ids));
    } catch (e: any) {
      res.json({ forms: [], errors: [{ form: 'all', reason: e?.message || 'lookup failed' }] });
    }
  });
  app.get('/api/meta/accounts', requireAuth, (_req, res) => {
    const names = adAccountNames();
    const ids = metaTargetAdAccounts();
    // Every configured account, plus any name mapped for an account not in the target list.
    const out = Array.from(new Set([...ids, ...Object.keys(names)])).map((id) => ({ id, name: names[id] || id }));
    res.json({ accounts: out });
  });
}
