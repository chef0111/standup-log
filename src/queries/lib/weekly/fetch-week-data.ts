import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { StandupUpdateRow } from '@/queries/lib/standup/types';
import { STANDUP_UPDATE_COLUMNS } from '@/queries/lib/standup/types';

export async function fetchStandupsForWeek(
  supabase: SupabaseClient,
  weekStart: Workday,
  weekEnd: Workday
): Promise<{ standups: StandupUpdateRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .gte('workday', weekStart)
    .lte('workday', weekEnd)
    .order('workday', { ascending: true });

  if (error) {
    return { standups: [], error: error.message };
  }
  return { standups: (data as StandupUpdateRow[]) ?? [], error: null };
}

export type ActivityCommitWithWorkType = {
  workday: Workday;
  work_type: string | null;
};

export async function fetchActivityCommitsForWeek(
  supabase: SupabaseClient,
  weekStart: Workday,
  weekEnd: Workday
): Promise<{
  commits: ActivityCommitWithWorkType[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('activity_commits')
    .select('workday, work_type')
    .gte('workday', weekStart)
    .lte('workday', weekEnd);

  if (error) {
    return { commits: [], error: error.message };
  }
  return {
    commits: (data as ActivityCommitWithWorkType[]) ?? [],
    error: null,
  };
}
