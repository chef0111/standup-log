import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import {
  recordStandupCopy,
  type RecordStandupCopyResult,
} from '@/queries/lib/standup/record-standup-copy';
import { requireAuth } from '@/queries/lib/require-auth';
import type { Workday } from '@/features/standup/types/workday';

import {
  invalidateProfileAfterCopy,
  invalidateStandupAfterWrite,
} from './invalidate-standup-cache';

type RecordCopyInput = {
  workday: Workday;
  draftMarkdown: string;
  formatUsed: CopyFormat;
};

export function useRecordCopyMutation() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workday,
      draftMarkdown,
      formatUsed,
    }: RecordCopyInput): Promise<RecordStandupCopyResult> => {
      const auth = requireAuth(supabase, session);
      const result = await recordStandupCopy(
        auth.supabase,
        auth.session.user.id,
        workday,
        draftMarkdown,
        formatUsed
      );
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, { workday }) => {
      invalidateStandupAfterWrite(queryClient, workday);
      invalidateProfileAfterCopy(queryClient);
    },
  });
}
