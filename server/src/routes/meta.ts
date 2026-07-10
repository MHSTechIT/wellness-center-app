import type { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';
import {
  syncMetaLeadsToSupabase,
  getMetaToken,
  checkTokenValidity,
  exchangeForLongLivedToken,
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
        enrolledAt: r.enrolled_at || null,
      };
    });

    let lastSync: any = null;
    try {
      const { data } = await supabase
        .from('meta_sync_state')
        .select('finished_at,status,leads_synced,accounts_accessible')
        .eq('status', 'success')
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false })
        .limit(1);
      lastSync = data?.[0] || null;
      if (!lastSync && all.length) {
        lastSync = { finished_at: all[0].created_at || all[0].lead_date, status: 'success', leads_synced: all.length };
      }
    } catch (_) {}

    const adAccountIds = (process.env.META_TARGET_AD_ACCOUNTS || '').split(',').filter(Boolean);

    res.json({
      leads,
      count: leads.length,
      fetchedAt: new Date().toISOString(),
      adAccounts: adAccountIds.length,
      lastSync,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, leads: [] });
  }
}

// ============================================================
// GET / POST /api/meta/sync — crawl Meta → upsert into Supabase.
// ============================================================
async function runSync(res: Response) {
  const token = await getMetaToken();
  const adAccountIds = (process.env.META_TARGET_AD_ACCOUNTS || '').split(',').filter(Boolean);
  const pageIds = (process.env.META_PAGE_IDS || process.env.META_PAGE_ID || '').split(',').filter(Boolean);

  if (pageIds.length === 0) {
    res.status(500).json({ error: 'No page IDs configured' });
    return;
  }

  const stats = await syncMetaLeadsToSupabase(adAccountIds, pageIds, token);
  res.json({ ok: true, syncedAt: new Date().toISOString(), stats });
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
  app.get('/api/meta/leads', getLeads);
  app.get('/api/meta/sync', (_req, res) => runSync(res).catch((e) => res.status(500).json({ error: e.message })));
  app.post('/api/meta/sync', (_req, res) => runSync(res).catch((e) => res.status(500).json({ error: e.message })));
  app.get('/api/meta/token', tokenGet);
  app.post('/api/meta/token', tokenPost);
}
