import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  STANDUP_UPDATE_COLUMNS,
  type StandupUpdateRow,
} from '@/queries/lib/standup/types';

export async function fetchStandupUpdate(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ standup: StandupUpdateRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .eq('workday', workday)
    .maybeSingle();

  if (error) {
    return { standup: null, error: error.message };
  }
  return { standup: (data as StandupUpdateRow | null) ?? null, error: null };
}
