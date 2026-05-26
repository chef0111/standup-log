import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import { deleteStandupUpdate } from '@/queries/lib/standup/delete-standup-update';
import { fetchStandupUpdate } from '@/queries/lib/standup/fetch-standup-update';
import { fetchStandupsInHistory } from '@/queries/lib/standup/fetch-standups-in-history';
import {
  STANDUP_UPDATE_COLUMNS,
  type StandupUpdateRow,
} from '@/queries/lib/standup/types';

export type { StandupUpdateRow } from '@/queries/lib/standup/types';
export { STANDUP_UPDATE_COLUMNS } from '@/queries/lib/standup/types';
export { fetchStandupUpdate } from '@/queries/lib/standup/fetch-standup-update';
export { fetchStandupsInHistory } from '@/queries/lib/standup/fetch-standups-in-history';
export { deleteStandupUpdate } from '@/queries/lib/standup/delete-standup-update';

/** @deprecated Use mutation hook after standup-mutations todo */
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
