import { supabase } from '@/shared/supabase';

export const dynamic = 'force-dynamic';

// PUT /api/calls/:contactId/latest-type   body { callType }
// Tags the most recent recording for the contact whose call_type is null/empty.
export async function PUT(req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const { contactId } = await params;
    const body = await req.json().catch(() => ({}));
    const callType = (body && body.callType) ? String(body.callType) : '';
    if (!callType) return Response.json({ ok: false, error: 'callType is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('call_recordings')
      .select('id')
      .eq('contact_id', contactId)
      .or('call_type.is.null,call_type.eq.')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return Response.json({ ok: false, error: error.message }, { status: 200 });
    const rec = data && data[0];
    if (!rec) return Response.json({ ok: false, error: 'No untyped recording to tag' }, { status: 404 });

    const upd = await supabase.from('call_recordings').update({ call_type: callType }).eq('id', rec.id);
    if (upd.error) return Response.json({ ok: false, error: upd.error.message }, { status: 200 });
    return Response.json({ ok: true, id: rec.id, callType });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'server error' }, { status: 500 });
  }
}
