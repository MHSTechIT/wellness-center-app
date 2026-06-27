import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/calls/:contactId/recordings  → list this lead's call recordings (newest first).
export async function GET(_req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    const { data, error } = await supabase
      .from('call_recordings')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    if (error) return Response.json({ ok: false, error: error.message, recordings: [] }, { status: 200 });
    return Response.json({ ok: true, recordings: data || [] });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'server error', recordings: [] }, { status: 500 });
  }
}
