import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import { STANDUP_UPDATE_COLUMNS, type StandupUpdateRow } from './types';

export async function saveStandupUpdate(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  draftMarkdown: string
): Promise<{ standup: StandupUpdateRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .upsert(
      {
        user_id: userId,
        workday,
        draft_markdown: draftMarkdown,
      },
      { onConflict: 'user_id,workday' }
    )
    .select(STANDUP_UPDATE_COLUMNS)
    .single();

  if (error) {
    return { standup: null, error: error.message };
  }
  return { standup: data as StandupUpdateRow, error: null };
}
