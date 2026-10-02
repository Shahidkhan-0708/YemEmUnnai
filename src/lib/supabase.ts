import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * The Supabase client, or `null` when credentials are missing.
 * Every backend call in the app goes through helpers that treat
 * `null` as "demo mode" so the UI keeps working with mock data.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { storageKey: 'yemunnai-vendor-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 10 } },
      })
    : null;

export const isBackendConfigured = supabase !== null;

export const buyerSupabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { storageKey: 'yemunnai-buyer-auth', persistSession: true, autoRefreshToken: true },
    })
  : null;

if (!isBackendConfigured) {
  console.warn(
    '[YEMEMUNNAI] Supabase not configured — running in demo mode. ' +
      'Copy .env.example to .env.local and add your project URL + anon key.'
  );
}
