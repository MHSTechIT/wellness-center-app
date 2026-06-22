import { syncMetaLeadsToSupabase, getMetaToken } from '@/lib/meta';

export const dynamic = 'force-dynamic';
// Hobby plan caps function duration at 60s. (On Pro+ this can be raised, but
// values above the plan limit fail the Vercel build.) Long crawls are best run
// locally or on a paid plan / background job.
export const maxDuration = 60;

async function runSync() {
  const token = await getMetaToken();
  const adAccountIds = (process.env.META_TARGET_AD_ACCOUNTS || '').split(',').filter(Boolean);
  const pageIds = (process.env.META_PAGE_IDS || process.env.META_PAGE_ID || '').split(',').filter(Boolean);

  if (pageIds.length === 0) {
    return Response.json({ error: 'No page IDs configured' }, { status: 500 });
  }

  const stats = await syncMetaLeadsToSupabase(adAccountIds, pageIds, token);
  return Response.json({ ok: true, syncedAt: new Date().toISOString(), stats });
}

// GET and POST both trigger a sync (GET makes it cron/curl friendly).
export async function GET() {
  try {
    return await runSync();
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    return await runSync();
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
