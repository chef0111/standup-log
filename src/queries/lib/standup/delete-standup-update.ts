import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteStandupUpdate(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('standup_updates')
    .delete()
    .eq('workday', workday);

  return { error: error?.message ?? null };
}
