import { useQueries } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import {
  listCarryForwardNotes,
  listNotes,
} from '@/queries/lib/notes/notes-api';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { notesKeys } from '@/queries/keys';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';
import { categorizeError, userFacingMessage } from '@/lib/errors';

function formatNotesError(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return userFacingMessage(
    categorizeError(error instanceof Error ? error.message : error)
  );
}

export function useManualNotesQuery(workday: Workday) {
  const { supabase, session } = useAuth();
  const enabled = isAuthReady(supabase, session);

  const [notesQuery, carryForwardQuery] = useQueries({
    queries: [
      {
        queryKey: notesKeys.workday(workday),
        enabled,
        queryFn: async (): Promise<ManualNoteRow[]> => {
          const auth = requireAuth(supabase, session);
          const { notes, error } = await listNotes(auth.supabase, workday);
          if (error) {
            throw new Error(error);
          }
          return notes;
        },
      },
      {
        queryKey: notesKeys.carryForward(workday),
        enabled,
        queryFn: async (): Promise<ManualNoteRow[]> => {
          const auth = requireAuth(supabase, session);
          const { notes, error } = await listCarryForwardNotes(
            auth.supabase,
            workday
          );
          if (error) {
            throw new Error(error);
          }
          return notes;
        },
      },
    ],
  });

  const error =
    formatNotesError(notesQuery.error) ??
    formatNotesError(carryForwardQuery.error);

  return {
    notes: notesQuery.data ?? [],
    carryForwardNotes: carryForwardQuery.data ?? [],
    loading: notesQuery.isLoading || carryForwardQuery.isLoading,
    error,
    refetch: async () => {
      await Promise.all([notesQuery.refetch(), carryForwardQuery.refetch()]);
    },
  };
}
