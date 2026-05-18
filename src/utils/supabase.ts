import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase-config';

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client, or null when env is not configured (cold start must not throw).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (browserClient) {
    return browserClient;
  }
  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  browserClient = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return browserClient;
}

/** @throws if Supabase is not configured — use only after routing guarantees config. */
export function requireSupabase(): SupabaseClient {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured');
  }
  return client;
}

export { isSupabaseConfigured } from '@/lib/supabase-config';
