import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Reads synced Meta leads from Supabase (fast). The heavy Meta crawl happens in
// /api/meta/sync, which upserts into the `leads` table.
export async function GET() {
  try {
    // Pull all Meta-sourced leads (paged out of Supabase's 1000-row default cap).
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await supabase
        .from('leads')
        .select('meta_lead_id,name,phone,email,source,lead_date,campaign,campaign_id,ad_account_id,ad_account_name,form_name,service,language,is_valid,is_duplicate,is_assigned,created_at')
        .eq('source', 'Meta Ads')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw new Error(error.message);
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
        service: r.service || 'Diabetes',
        lang: r.language || 'Tamil',
        received,
        createdAt,
        adAccountName: r.ad_account_name || '',
        isValid: r.is_valid,
        isDuplicate: r.is_duplicate,
        isAssigned: r.is_assigned
      };
    });

    // Last sync info
    let lastSync: any = null;
    try {
      const { data } = await supabase
        .from('meta_sync_state')
        .select('finished_at,status,leads_synced,accounts_accessible')
        .order('started_at', { ascending: false })
        .limit(1);
      lastSync = data?.[0] || null;
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
