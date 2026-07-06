import { supabase } from './supabase';

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const FETCH_TIMEOUT = 8000;

// Use globalThis so cache persists across requests in Next.js dev mode
const _g = globalThis as any;
if (!_g.__metaLeadsCacheV3) _g.__metaLeadsCacheV3 = null;
const CACHE_TTL = 600000; // 10 minutes — pagination is expensive, keep results warm
// Only fetch leads newer than this window. Meta returns leads newest-first, so we
// stop paginating a form once we hit older leads. Covers the dashboard's date range.
const LEAD_WINDOW_DAYS = Number(process.env.META_LEAD_WINDOW_DAYS || 400);

function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function getMetaToken(): Promise<string> {
  try {
    const { data } = await supabase
      .from('meta_tokens')
      .select('access_token, expires_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    if (data?.[0]?.access_token) {
      const expiresAt = data[0].expires_at ? new Date(data[0].expires_at) : null;
      if (!expiresAt || expiresAt > new Date()) return data[0].access_token;
    }
  } catch (_) {}

  if (process.env.META_SYSTEM_ACCESS_TOKEN) return process.env.META_SYSTEM_ACCESS_TOKEN;
  if (process.env.META_PAGE_ACCESS_TOKEN) return process.env.META_PAGE_ACCESS_TOKEN;
  if (process.env.META_ACCESS_TOKEN) return process.env.META_ACCESS_TOKEN;
  throw new Error('No Meta access token available');
}

// Follow Meta's cursor-based pagination (paging.next) and collect every page.
// `paging.next` already carries the access_token + cursor, so we fetch it as-is.
async function fetchAllPages(
  initialUrl: string,
  maxPages = 200,
  stopAfterPage?: (pageItems: any[]) => boolean
): Promise<{ items: any[]; error: string | null; pages: number }> {
  const items: any[] = [];
  let url: string | null = initialUrl;
  let pages = 0;
  let error: string | null = null;
  while (url && pages < maxPages) {
    let data: any;
    try {
      const res = await fetchWithTimeout(url);
      data = await res.json();
    } catch (e: any) {
      error = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'fetch failed');
      break;
    }
    if (data?.error) {
      error = data.error.message || 'Meta API error';
      break;
    }
    const pageItems = Array.isArray(data?.data) ? data.data : [];
    items.push(...pageItems);
    pages++;
    // Early stop (e.g. leads older than our window) — Meta returns newest-first.
    if (stopAfterPage && stopAfterPage(pageItems)) break;
    url = data?.paging?.next || null;
  }
  return { items, error, pages };
}

// Candidate tokens to try for the Ads API (campaigns), in priority order.
// ads_read/ads_management is required and the ad-account owner must have granted
// the app access. We try each until one returns campaigns for a given account.
function adsTokenCandidates(): string[] {
  return [
    process.env.META_ACCESS_TOKEN,
    process.env.META_PAGE_ACCESS_TOKEN,
    process.env.META_SYSTEM_ACCESS_TOKEN,
    process.env.META_SYSTEM_ACCESS_TOKEN_1
  ].filter(Boolean) as string[];
}

function adAccountNames(): Record<string, string> {
  const out: Record<string, string> = {};
  (process.env.META_TARGET_AD_ACCOUNT_NAMES || '').split(',').forEach((p) => {
    const idx = p.indexOf(':');
    if (idx > 0) out[p.substring(0, idx).trim()] = p.substring(idx + 1).trim();
  });
  return out;
}

export interface AdAccountCrawl {
  leads: any[];
  accessibleAccounts: { id: string; name: string; ads: number; leads: number }[];
  blockedAccounts: { id: string; reason: string }[];
  adErrors: number;
}

// Crawl PAID leads straight from each target ad account: account → ads → /{ad}/leads.
// This returns only leads attributable to the account's ads (the real "ad-account
// leads"), and is far faster/cleaner than scanning page leadgen forms (which also
// contain organic submissions with no campaign attribution).
export async function crawlAdAccountLeads(adAccountIds: string[]): Promise<AdAccountCrawl> {
  const names = adAccountNames();
  const tokens = adsTokenCandidates();
  const windowCutoff = Date.now() - LEAD_WINDOW_DAYS * 86400000;
  const collected: any[] = [];
  const accessibleAccounts: { id: string; name: string; ads: number; leads: number }[] = [];
  const blockedAccounts: { id: string; reason: string }[] = [];
  let adErrors = 0;

  for (const acctId of adAccountIds) {
    // Find a token that can list this account's ads.
    let token: string | null = null;
    let ads: any[] = [];
    let lastErr = 'no token could read this account';
    for (const tk of tokens) {
      const { items, error } = await fetchAllPages(
        `${GRAPH_API}/act_${acctId}/ads?fields=id,name&limit=200&access_token=${tk}`,
        20
      );
      if (error) { lastErr = error; continue; }
      token = tk; ads = items; break;
    }
    if (!token) { blockedAccounts.push({ id: acctId, reason: lastErr }); continue; }

    // Fetch leads for every ad (batched), within the date window.
    let acctLeadCount = 0;
    const BATCH = 10;
    for (let i = 0; i < ads.length; i += BATCH) {
      const batch = ads.slice(i, i + BATCH);
      const res = await Promise.allSettled(
        batch.map(async (ad: any) => {
          const { items, error } = await fetchAllPages(
            `${GRAPH_API}/${ad.id}/leads?fields=id,created_time,field_data,campaign_id,campaign_name,ad_id,ad_name,form_id&limit=200&access_token=${token}`,
            80,
            (pageItems) => {
              const last = pageItems[pageItems.length - 1];
              return !!last && new Date(last.created_time).getTime() < windowCutoff;
            }
          );
          if (error) return { error };
          return { leads: items.filter((l: any) => new Date(l.created_time).getTime() >= windowCutoff) };
        })
      );
      for (const r of res) {
        if (r.status === 'fulfilled') {
          if ((r.value as any).error) { adErrors++; continue; }
          for (const lead of (r.value as any).leads) {
            collected.push(normalizeLead(lead, lead.ad_name || lead.campaign_name || '', '', { accountId: acctId, accountName: names[acctId] || acctId }));
            acctLeadCount++;
          }
        } else {
          adErrors++;
        }
      }
    }
    accessibleAccounts.push({ id: acctId, name: names[acctId] || acctId, ads: ads.length, leads: acctLeadCount });
  }

  // De-duplicate by Meta lead id (an ad's leads are unique, but guard anyway)
  const seen = new Set<string>();
  const leads = collected.filter((l) => {
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { leads, accessibleAccounts, blockedAccounts, adErrors };
}

// Crawl ALL incoming leads from every leadgen form on the given pages, within the
// date window (newest-first, stop early once older than the window). This is the
// real-time "incoming leads" stream and is what the Live Incoming Feed displays.
export async function crawlPageFormLeads(pageIds: string[], token: string) {
  const windowCutoff = Date.now() - LEAD_WINDOW_DAYS * 86400000;

  // Optional allowlist: only these lead-form IDs (the forms run by the target ad
  // accounts). Empty → all forms on the connected pages.
  const allowList = (process.env.META_TARGET_FORM_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const allowForms = new Set(allowList);

  // ===== Direct-by-form mode (explicit allowlist) =====
  // Fetch EACH allowlisted form's leads directly, trying every available token,
  // so forms on pages the primary token cannot enumerate are still captured.
  if (allowList.length > 0) {
    const tokens = [
      process.env.META_SYSTEM_ACCESS_TOKEN,
      process.env.META_ACCESS_TOKEN,
      process.env.META_PAGE_ACCESS_TOKEN,
      process.env.META_SYSTEM_ACCESS_TOKEN_1
    ].filter(Boolean) as string[];
    const collected: any[] = [];
    let formErrors = 0;
    const pageErrors: { pageId: string; reason: string }[] = [];
    for (const fid of allowList) {
      // Find a token that can read this form, and its name.
      let workTok: string | null = null;
      let formName = fid;
      for (const tk of tokens) {
        try {
          const r = await fetchWithTimeout(`${GRAPH_API}/${fid}?fields=name&access_token=${tk}`);
          const j = await r.json();
          if (!j.error) { workTok = tk; formName = j.name || fid; break; }
        } catch (_) { /* try next token */ }
      }
      if (!workTok) { formErrors++; pageErrors.push({ pageId: fid, reason: 'no token can read this form' }); continue; }
      const { items, error } = await fetchAllPages(
        `${GRAPH_API}/${fid}/leads?fields=id,created_time,field_data,campaign_id,campaign_name,ad_id,ad_name&limit=200&access_token=${workTok}`,
        100,
        (pageItems) => {
          const last = pageItems[pageItems.length - 1];
          return !!last && new Date(last.created_time).getTime() < windowCutoff;
        }
      );
      if (error) { formErrors++; pageErrors.push({ pageId: fid, reason: error }); continue; }
      const within = items.filter((l: any) => new Date(l.created_time).getTime() >= windowCutoff);
      within.forEach((l: any) => collected.push(normalizeLead(l, formName, '')));
    }
    const seenD = new Set<string>();
    const leadsD = collected.filter((l) => { if (seenD.has(l.id)) return false; seenD.add(l.id); return true; });
    leadsD.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { leads: leadsD, formsScanned: allowList.length, formErrors, pageErrors };
  }

  // ===== Page-enumeration mode (no allowlist): scan every form on every page =====
  const formResults = await Promise.allSettled(
    pageIds.map(async (pageId) => {
      const { items, error } = await fetchAllPages(
        `${GRAPH_API}/${pageId}/leadgen_forms?fields=id,name&limit=100&access_token=${token}`,
        20
      );
      return { pageId, forms: items, error };
    })
  );
  const allForms: { pageId: string; formId: string; formName: string }[] = [];
  const pageErrors: { pageId: string; reason: string }[] = [];
  for (const r of formResults) {
    if (r.status === 'fulfilled') {
      if (r.value.error) pageErrors.push({ pageId: r.value.pageId, reason: r.value.error });
      for (const f of r.value.forms) {
        if (allowForms.size > 0 && !allowForms.has(String(f.id))) continue;
        allForms.push({ pageId: r.value.pageId, formId: f.id, formName: f.name });
      }
    }
  }

  const collected: any[] = [];
  let formErrors = 0;
  const BATCH = 12;
  for (let i = 0; i < allForms.length; i += BATCH) {
    const batch = allForms.slice(i, i + BATCH);
    const res = await Promise.allSettled(
      batch.map(async ({ pageId, formId, formName }) => {
        const { items, error } = await fetchAllPages(
          `${GRAPH_API}/${formId}/leads?fields=id,created_time,field_data,campaign_id,campaign_name,ad_id,ad_name&limit=200&access_token=${token}`,
          80,
          (pageItems) => {
            const last = pageItems[pageItems.length - 1];
            return !!last && new Date(last.created_time).getTime() < windowCutoff;
          }
        );
        if (error) return { error };
        const within = items.filter((l: any) => new Date(l.created_time).getTime() >= windowCutoff);
        return { leads: within.map((l: any) => normalizeLead(l, formName, pageId)) };
      })
    );
    for (const r of res) {
      if (r.status === 'fulfilled') {
        if ((r.value as any).error) formErrors++;
        else collected.push(...(r.value as any).leads);
      } else {
        formErrors++;
      }
    }
  }

  const seen = new Set<string>();
  const leads = collected.filter((l) => {
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { leads, formsScanned: allForms.length, formErrors, pageErrors };
}

export async function fetchMetaLeads(adAccountIds: string[], _pageIds: string[], _token: string) {
  if (_g.__metaLeadsCacheV3 && Date.now() - _g.__metaLeadsCacheV3.ts < CACHE_TTL) {
    return _g.__metaLeadsCacheV3.data;
  }
  const crawl = await crawlAdAccountLeads(adAccountIds);
  const result = {
    leads: crawl.leads,
    stats: {
      accessibleAccounts: crawl.accessibleAccounts,
      blockedAccounts: crawl.blockedAccounts,
      adErrors: crawl.adErrors
    }
  };
  _g.__metaLeadsCacheV3 = { data: result, ts: Date.now() };
  return result;
}

// ============================================================
// SYNC: crawl Meta (account → ads → leads) → upsert into Supabase → record state.
// Heavy operation; runs in /api/meta/sync (background/cron), never on page load.
// ============================================================
export async function syncMetaLeadsToSupabase(adAccountIds: string[], _pageIds: string[], _token: string) {
  let syncId: number | null = null;
  try {
    const { data } = await supabase
      .from('meta_sync_state')
      .insert({ status: 'running' })
      .select('id')
      .single();
    syncId = data?.id ?? null;
  } catch (_) {}

  try {
    const pageIds = (_pageIds && _pageIds.length ? _pageIds : (process.env.META_PAGE_IDS || process.env.META_PAGE_ID || '').split(',')).filter(Boolean);

    // PRIMARY source: every incoming lead from the pages' leadgen forms (this is
    // the real-time stream that contains the latest leads, incl. today's).
    const formCrawl = await crawlPageFormLeads(pageIds, _token);

    // ENRICHMENT: paid leads from the accessible ad accounts → attribute by lead id.
    let adCrawl: AdAccountCrawl = { leads: [], accessibleAccounts: [], blockedAccounts: [], adErrors: 0 };
    try { adCrawl = await crawlAdAccountLeads(adAccountIds); } catch (_) {}
    const attrMap = new Map<string, { id: string; name: string }>();
    adCrawl.leads.forEach((l: any) => {
      if (l.adAccountId) attrMap.set(l.id, { id: l.adAccountId, name: l.adAccountName });
    });

    // Only the allowlisted forms' leads are synced. The ad-account crawl is used
    // SOLELY for attribution (attrMap above) — it must NOT add leads from other forms.
    const byId = new Map<string, any>();
    formCrawl.leads.forEach((l: any) => byId.set(l.id, l));

    // Sort oldest-first so duplicate-phone detection keeps the earliest as unique.
    const merged = [...byId.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const phoneSeen = new Set<string>();
    const rows = merged.map((l: any) => {
      const phone = (l.phone || '').trim();
      const isDuplicate = phone !== '' && phoneSeen.has(phone);
      if (phone !== '') phoneSeen.add(phone);
      const attr = attrMap.get(l.id);
      return {
        meta_lead_id: l.id,
        name: l.name || '(no name)',
        phone,
        email: l.email || '',
        source: 'Meta Ads',
        lead_date: String(l.createdAt).substring(0, 10),
        campaign: l.campaignName || l.formName || '—',
        ad_name: l.adName || null,
        sugar_poll: l.sugar || null,
        city: l.city || null,
        street: l.street || null,
        campaign_id: null,
        ad_account_id: attr?.id || l.adAccountId || null,
        ad_account_name: attr?.name || l.adAccountName || null,
        form_name: l.formName || null,
        service: l.service || 'Diabetes',
        language: l.lang || 'Tamil',
        is_valid: phone !== '',
        is_duplicate: isDuplicate,
        // NOTE: do NOT set is_assigned here. Upsert would overwrite the assignment
        // flag on every sync, wiping assignments. Omitting it preserves the existing
        // value on update; new leads use the DB default (false).
        created_at: l.createdAt
      };
    });

    // Prune leads previously synced from now-excluded forms, but NEVER delete a
    // lead the team has already worked: a crawl can miss leads it returned before
    // (pagination / rate limits / time windows), and deleting an assigned/pooled/
    // called lead would wipe its workflow state. When it reappeared in a later
    // crawl it would come back as a fresh, unassigned row — the cause of
    // "assignments disappear after refresh". So a lead is only stale if it is
    // absent from this crawl AND carries no workflow state.
    // pool_added_at counts as workflow state too: a lead that was ever sent to the
    // assignment pool is "worked", even after it is returned to the Live Incoming
    // Feed (in_pool=false) via the "Return to Pool" action — otherwise an out-of-crawl
    // returned lead would be deleted on the very next sync.
    const keepIds = new Set(rows.map((r) => r.meta_lead_id));
    let existingFrom = 0;
    const staleIds: string[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await supabase
        .from('leads')
        .select('meta_lead_id,is_assigned,assigned_to,in_pool,call_status,pool_added_at')
        .eq('source', 'Meta Ads')
        .range(existingFrom, existingFrom + 999);
      if (error) break;
      if (!data || data.length === 0) break;
      data.forEach((r: any) => {
        if (!r.meta_lead_id || keepIds.has(r.meta_lead_id)) return;
        const worked = r.is_assigned || (r.assigned_to && r.assigned_to !== '') || r.in_pool || (r.call_status && r.call_status !== '') || r.pool_added_at;
        if (!worked) staleIds.push(r.meta_lead_id);
      });
      if (data.length < 1000) break;
      existingFrom += 1000;
    }
    for (let i = 0; i < staleIds.length; i += 200) {
      await supabase.from('leads').delete().in('meta_lead_id', staleIds.slice(i, i + 200));
    }

    let upserted = 0;
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const { error } = await supabase
        .from('leads')
        .upsert(chunk, { onConflict: 'meta_lead_id', ignoreDuplicates: false });
      if (error) throw new Error(`Supabase upsert: ${error.message}`);
      upserted += chunk.length;
    }

    const stats = {
      leadsSynced: upserted,
      formsScanned: formCrawl.formsScanned,
      attributedToAccounts: adCrawl.leads.length,
      accessibleAccounts: adCrawl.accessibleAccounts,
      blockedAccounts: adCrawl.blockedAccounts,
      formErrors: formCrawl.formErrors,
      pageErrors: formCrawl.pageErrors
    };

    if (syncId != null) {
      await supabase.from('meta_sync_state').update({
        status: 'success',
        finished_at: new Date().toISOString(),
        leads_synced: upserted,
        forms_scanned: formCrawl.formsScanned,
        campaigns_matched: adCrawl.accessibleAccounts.length,
        accounts_accessible: adCrawl.accessibleAccounts.map((a) => a.name).join(', ')
      }).eq('id', syncId);
    }

    return stats;
  } catch (err: any) {
    if (syncId != null) {
      await supabase.from('meta_sync_state').update({
        status: 'error',
        finished_at: new Date().toISOString(),
        error: err.message
      }).eq('id', syncId);
    }
    throw err;
  }
}

const _pageNames: Record<string, string> = {};
function getPageNames() {
  if (Object.keys(_pageNames).length === 0) {
    (process.env.META_PAGE_NAMES || '').split(',').forEach(p => {
      const idx = p.indexOf(':');
      if (idx > 0) _pageNames[p.substring(0, idx)] = p.substring(idx + 1);
    });
  }
  return _pageNames;
}

// Normalise a Meta lead-form field key: lowercase, ascii-alnum only.
// e.g. "Name (பெயர்)" -> "name", "phone_number" -> "phonenumber".
function _normKey(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Extract real lead attributes from Meta field_data by FUZZY key matching, so
// localized/custom labels (e.g. "Name (பெயர்)", Tamil sugar question) map correctly.
function extractFields(fieldData: any[]) {
  const pairs = (fieldData || []).map((f: any) => ({ k: _normKey(f.name), v: (f.values?.[0] || '').trim() }));
  const first = (test: (k: string) => boolean): string => {
    const hit = pairs.find((p: any) => p.v && test(p.k));
    return hit ? hit.v : '';
  };
  const phone = first((k) => k === 'phonenumber' || k === 'phone' || k.startsWith('phone') || k === 'mobile' || k.startsWith('mobilenumber'));
  // name: a key containing "name" but NOT phone-related
  const name = first((k) => (k === 'name' || k.includes('fullname') || k.includes('firstname') || (k.includes('name') && !k.includes('phone') && !k.includes('username'))));
  const lastName = first((k) => k.includes('lastname'));
  const email = first((k) => k.includes('email'));
  let sugar = first((k) => k.includes('sugar'));
  // clean values like "150-250_sugar_level" -> "150-250"
  sugar = sugar.replace(/[_\s]*sugar[_\s]*level/ig, '').replace(/_/g, ' ').trim();
  const city = first((k) => k === 'city' || k.includes('city'));
  const street = first((k) => k.includes('street') || k.includes('address') || k === 'postcode' || k.includes('postcode') || k.includes('pincode') || k.includes('zip'));
  const lang = first((k) => k.includes('language') || k.includes('preferredlanguage'));
  const service = first((k) => k === 'service' || k.includes('interest') || k.includes('program'));
  let fullName = name;
  if (fullName && lastName && !fullName.includes(lastName)) fullName = (fullName + ' ' + lastName).trim();
  return { name: fullName, phone, email, sugar, city, street, lang, service };
}

function normalizeLead(raw: any, formName: string, pageId: string, attr?: { accountId: string; accountName: string }) {
  const f = extractFields(raw.field_data || []);

  const createdAt = new Date(raw.created_time);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
  let received: string;
  if (diffMin < 1) received = 'now';
  else if (diffMin < 60) received = `${diffMin}m`;
  else if (diffMin < 1440) received = `${Math.floor(diffMin / 60)}h`;
  else received = `${Math.floor(diffMin / 1440)}d`;

  const pn = getPageNames();

  // Real name only — never fall back to the phone (so Lead Name ≠ Phone Number).
  const name = (f.name || '').trim() || '(no name)';

  return {
    id: raw.id,
    name,
    phone: f.phone || '',
    email: f.email || '',
    sugar: f.sugar || '',
    city: f.city || '',
    street: f.street || '',
    source: 'Meta',
    campaign: raw.campaign_name || raw.ad_name || formName || '—',
    service: f.service || 'Diabetes',
    lang: f.lang || 'Tamil',
    received,
    createdAt: raw.created_time,
    formName,
    adName: raw.ad_name || '',
    campaignName: raw.campaign_name || '',
    pageName: pn[pageId] || pageId,
    adAccountId: attr?.accountId || '',
    adAccountName: attr?.accountName || ''
  };
}

export async function checkTokenValidity(token: string): Promise<{ valid: boolean; expiresAt: string | null; scopes: string[] }> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return { valid: false, expiresAt: null, scopes: [] };

  try {
    const res = await fetchWithTimeout(`${GRAPH_API}/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`);
    const data = await res.json();
    if (data.data) {
      return {
        valid: data.data.is_valid,
        expiresAt: data.data.expires_at ? new Date(data.data.expires_at * 1000).toISOString() : null,
        scopes: data.data.scopes || []
      };
    }
  } catch (_) {}
  return { valid: false, expiresAt: null, scopes: [] };
}

export async function exchangeForLongLivedToken(shortToken: string): Promise<{ token: string; expiresIn: number }> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error('Missing app credentials');

  const res = await fetchWithTimeout(
    `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return { token: data.access_token, expiresIn: data.expires_in || 0 };
}
