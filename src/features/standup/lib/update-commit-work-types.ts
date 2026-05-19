import type { CommitWorkType } from '@/features/standup/lib/ai-draft-types';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateCommitWorkTypes(
  supabase: SupabaseClient,
  userId: string,
  classifications: { sha: string; work_type: CommitWorkType | string }[]
): Promise<{ error: string | null }> {
  for (const { sha, work_type } of classifications) {
    const { error } = await supabase
      .from('activity_commits')
      .update({ work_type })
      .eq('user_id', userId)
      .eq('sha', sha);

    if (error) {
      return { error: error.message };
    }
  }

  return { error: null };
}
