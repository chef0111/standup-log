import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { saveStandupUpdate } from '@/queries/lib/standup/save-standup-update';
import type { StandupUpdateRow } from '@/queries/lib/standup/types';
import { requireAuth } from '@/queries/lib/require-auth';
import type { Workday } from '@/features/standup/types/workday';

import { invalidateStandupAfterWrite } from './invalidate-standup-cache';

type SaveStandupInput = {
  workday: Workday;
  draftMarkdown: string;
};

export function useSaveStandupMutation() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workday,
      draftMarkdown,
    }: SaveStandupInput): Promise<StandupUpdateRow | null> => {
      const auth = requireAuth(supabase, session);
      const { standup, error } = await saveStandupUpdate(
        auth.supabase,
        auth.session.user.id,
        workday,
        draftMarkdown
      );
      if (error) {
        throw new Error(error);
      }
      return standup;
    },
    onSuccess: (_data, { workday }) => {
      invalidateStandupAfterWrite(queryClient, workday);
    },
  });
}
