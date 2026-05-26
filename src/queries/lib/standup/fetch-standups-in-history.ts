import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  STANDUP_UPDATE_COLUMNS,
  type StandupUpdateRow,
} from '@/queries/lib/standup/types';

export async function fetchStandupsInHistory(
  supabase: SupabaseClient,
  minimumWorkday: Workday,
  maximumWorkday: Workday
): Promise<{ standups: StandupUpdateRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .gte('workday', minimumWorkday)
    .lte('workday', maximumWorkday)
    .order('workday', { ascending: false });

  if (error) {
    return { standups: [], error: error.message };
  }
  return { standups: (data as StandupUpdateRow[]) ?? [], error: null };
}
