import { createClient } from '@supabase/supabase-js';

// Fall back to a syntactically-valid placeholder so the production build never
// crashes when env vars are absent (e.g. before they're configured in Vercel).
// At runtime, set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY for
// real connectivity; otherwise queries fail gracefully and the UI degrades.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
