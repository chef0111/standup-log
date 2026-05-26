import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type AuthContext = {
  supabase: SupabaseClient;
  session: Session;
};

export function requireAuth(
  supabase: SupabaseClient | null,
  session: Session | null
): AuthContext {
  if (!supabase || !session) {
    throw new Error('Not signed in.');
  }
  return { supabase, session };
}

export function isAuthReady(
  supabase: SupabaseClient | null,
  session: Session | null
): supabase is SupabaseClient {
  return Boolean(supabase && session);
}
