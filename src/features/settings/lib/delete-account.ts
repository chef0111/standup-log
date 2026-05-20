import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-config';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteAccount(
  supabase: SupabaseClient
): Promise<{ error: string | null }> {
  const baseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!baseUrl || !anonKey) {
    return { error: 'Supabase is not configured.' };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError.message };
  }
  if (!session) {
    return { error: 'Not signed in.' };
  }

  const res = await fetch(`${baseUrl}/functions/v1/delete-account`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return { error: body?.error ?? `Delete failed (${res.status}).` };
  }

  return { error: null };
}
