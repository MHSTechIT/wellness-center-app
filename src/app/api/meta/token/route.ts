import { supabase } from '@/shared/supabase';
import { checkTokenValidity, exchangeForLongLivedToken } from '@/server/meta';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokenChecks: any[] = [];

    const tokenSources = [
      { type: 'system', token: process.env.META_SYSTEM_ACCESS_TOKEN },
      { type: 'page', token: process.env.META_PAGE_ACCESS_TOKEN },
      { type: 'user', token: process.env.META_ACCESS_TOKEN }
    ];

    for (const src of tokenSources) {
      if (!src.token) continue;
      const status = await checkTokenValidity(src.token);
      const expiresAt = status.expiresAt ? new Date(status.expiresAt) : null;
      const isExpiringSoon = expiresAt && (expiresAt.getTime() - Date.now()) < 24 * 60 * 60 * 1000;

      tokenChecks.push({
        type: src.type,
        valid: status.valid,
        expiresAt: status.expiresAt || 'never',
        expiringSoon: !!isExpiringSoon,
        scopes: status.scopes
      });

      // Auto-refresh if expiring within 24 hours
      if (status.valid && isExpiringSoon) {
        try {
          const refreshed = await exchangeForLongLivedToken(src.token);
          await supabase.from('meta_tokens').insert({
            token_type: `${src.type}_long_lived`,
            access_token: refreshed.token,
            expires_at: refreshed.expiresIn
              ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
              : null,
            is_active: true
          });
          // Deactivate older tokens of same type
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

    // Check saved tokens in Supabase
    let savedTokens: any[] = [];
    try {
      const { data } = await supabase
        .from('meta_tokens')
        .select('id, token_type, expires_at, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      savedTokens = data || [];
    } catch (_) {}

    return Response.json({
      tokens: tokenChecks,
      savedTokens,
      checkedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
      return Response.json({ error: 'Missing META_APP_ID or META_APP_SECRET' }, { status: 500 });
    }

    const results: any[] = [];
    const tokensToRefresh = [
      { type: 'user', token: process.env.META_ACCESS_TOKEN },
      { type: 'page', token: process.env.META_PAGE_ACCESS_TOKEN }
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
          is_active: true
        });
        results.push({ type: src.type, success: true, expiresIn: refreshed.expiresIn });
      } catch (e: any) {
        results.push({ type: src.type, success: false, error: e.message });
      }
    }

    return Response.json({ results, refreshedAt: new Date().toISOString() });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
