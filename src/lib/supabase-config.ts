/**
 * Supabase environment for the Expo client (publishable URL + anon key only).
 */

export function getSupabaseUrl(): string | undefined {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

/** Prefer EXPO_PUBLIC_SUPABASE_ANON_KEY; fall back to legacy EXPO_PUBLIC_SUPABASE_KEY. */
export function getSupabaseAnonKey(): string | undefined {
  const preferred = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof preferred === 'string' && preferred.length > 0) {
    return preferred;
  }
  const legacy = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  return typeof legacy === 'string' && legacy.length > 0 ? legacy : undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
