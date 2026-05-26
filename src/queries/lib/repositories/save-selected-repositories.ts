import type { RepositoryPickerMode } from '@/features/repositories/lib/repository-picker-copy';
import type { SelectedRepository } from '@/features/repositories/types/repository';
import type { SupabaseClient } from '@supabase/supabase-js';

type SaveSelectedRepositoriesInput = {
  repos: SelectedRepository[];
  mode: RepositoryPickerMode;
};

export async function saveSelectedRepositories(
  supabase: SupabaseClient,
  userId: string,
  { repos, mode }: SaveSelectedRepositoriesInput
): Promise<{ error: string | null }> {
  const payload =
    mode === 'onboarding'
      ? {
          selected_repositories: repos,
          onboarding_completed_at: new Date().toISOString(),
        }
      : { selected_repositories: repos };

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  return { error: error?.message ?? null };
}
