import { supabase } from '@/shared/supabase';

export const dynamic = 'force-dynamic';

// Reads synced Meta leads from Supabase (fast). The heavy Meta crawl happens in
// /api/meta/sync, which upserts into the `leads` table.
export async function GET() {
  try {
    // Pull all Meta-sourced leads (paged out of Supabase's 1000-row default cap).
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];
    // Fetch one page, retrying on transient network errors ("fetch failed").
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
        callStatus: r.call_status || ''
      };
    });

    // Last sync info — the latest SUCCESSFUL sync. A sync that's still 'running' or
    // that timed out has no finished_at, which would wrongly show "Not synced yet".
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
      // Fallback: no success row yet but leads exist → use the newest lead's time.
      if (!lastSync && all.length) {
        lastSync = { finished_at: all[0].created_at || all[0].lead_date, status: 'success', leads_synced: all.length };
      }
    } catch (_) {}

    const adAccountIds = (process.env.META_TARGET_AD_ACCOUNTS || '').split(',').filter(Boolean);

    return Response.json({
      leads,
      count: leads.length,
      fetchedAt: new Date().toISOString(),
      adAccounts: adAccountIds.length,
      lastSync
    });
  } catch (err: any) {
    return Response.json({ error: err.message, leads: [] }, { status: 500 });
  }
}
