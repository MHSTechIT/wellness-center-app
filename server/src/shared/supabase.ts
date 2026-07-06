import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client. Prefers server-only env names, but falls back to
// the NEXT_PUBLIC_* names so a single shared .env works for client and server.
// A service-role key is used if provided (recommended for a backend); otherwise
// it degrades to the anon key, matching the previous behaviour.
const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'public-anon-placeholder';

export const supabase = createClient(url, key);
