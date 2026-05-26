import type { StoredWorkType } from '@/features/standup/lib/activity/stored-work-type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateActivityCommitWorkType(
  supabase: SupabaseClient,
  userId: string,
  commitId: string,
  workType: StoredWorkType
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('activity_commits')
    .update({ work_type: workType })
    .eq('id', commitId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}
