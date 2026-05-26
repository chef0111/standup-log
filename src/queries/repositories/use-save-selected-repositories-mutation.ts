import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { formatRepoLimitError } from '@/features/entitlements/lib/entitlements';
import type { RepositoryPickerMode } from '@/features/repositories/lib/repository-picker-copy';
import type { SelectedRepository } from '@/features/repositories/types/repository';
import { track } from '@/lib/analytics';
import { saveSelectedRepositories } from '@/queries/lib/repositories/save-selected-repositories';
import { requireAuth } from '@/queries/lib/require-auth';
import { activityKeys, profileKeys } from '@/queries/keys';

type SaveRepositoriesInput = {
  repos: SelectedRepository[];
  mode: RepositoryPickerMode;
};

export function useSaveSelectedRepositoriesMutation() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repos, mode }: SaveRepositoriesInput) => {
      const auth = requireAuth(supabase, session);
      const { error } = await saveSelectedRepositories(
        auth.supabase,
        auth.session.user.id,
        { repos, mode }
      );
      if (error) {
        throw new Error(formatRepoLimitError(error));
      }
    },
    onSuccess: (_data, { repos, mode }) => {
      if (mode === 'onboarding') {
        track('onboarding_completed');
      }
      track('repository_selection_completed', { count: repos.length });
      void queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      void queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
