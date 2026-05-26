import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import {
  createNote,
  deleteNote,
  updateNote,
} from '@/queries/lib/notes/notes-api';
import type {
  ManualNoteInput,
  ManualNoteRow,
} from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';
import { requireAuth } from '@/queries/lib/require-auth';

import { invalidateNotesForWorkday } from './invalidate-notes-cache';

type CreateNoteInput = {
  workday: Workday;
  input: ManualNoteInput;
};

type UpdateNoteInput = {
  workday: Workday;
  noteId: string;
  input: ManualNoteInput;
};

type DeleteNoteInput = {
  workday: Workday;
  noteId: string;
};

export function useManualNoteMutations(workday: Workday) {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: async ({
      workday: noteWorkday,
      input,
    }: CreateNoteInput): Promise<ManualNoteRow> => {
      const auth = requireAuth(supabase, session);
      const { note, error } = await createNote(
        auth.supabase,
        auth.session.user.id,
        noteWorkday,
        input
      );
      if (error || !note) {
        throw new Error(error ?? 'Could not create note.');
      }
      return note;
    },
    onSuccess: (_data, { workday: noteWorkday }) => {
      invalidateNotesForWorkday(queryClient, noteWorkday);
    },
  });

  const editNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      input,
    }: UpdateNoteInput): Promise<ManualNoteRow> => {
      const auth = requireAuth(supabase, session);
      const { note, error } = await updateNote(auth.supabase, noteId, input);
      if (error || !note) {
        throw new Error(error ?? 'Could not update note.');
      }
      return note;
    },
    onSuccess: (_data, { workday: noteWorkday }) => {
      invalidateNotesForWorkday(queryClient, noteWorkday);
    },
  });

  const removeNoteMutation = useMutation({
    mutationFn: async ({ noteId }: DeleteNoteInput) => {
      const auth = requireAuth(supabase, session);
      const { error } = await deleteNote(auth.supabase, noteId);
      if (error) {
        throw new Error(error);
      }
    },
    onSuccess: (_data, { workday: noteWorkday }) => {
      invalidateNotesForWorkday(queryClient, noteWorkday);
    },
  });

  const addNote = async (input: ManualNoteInput) => {
    try {
      const note = await addNoteMutation.mutateAsync({ workday, input });
      return { note, error: null as string | null };
    } catch (error) {
      return {
        note: null,
        error: error instanceof Error ? error.message : 'Could not create note.',
      };
    }
  };

  const editNote = async (noteId: string, input: ManualNoteInput) => {
    try {
      const note = await editNoteMutation.mutateAsync({
        workday,
        noteId,
        input,
      });
      return { note, error: null as string | null };
    } catch (error) {
      return {
        note: null,
        error: error instanceof Error ? error.message : 'Could not update note.',
      };
    }
  };

  const removeNote = async (noteId: string) => {
    try {
      await removeNoteMutation.mutateAsync({ workday, noteId });
      return { error: null as string | null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Could not delete note.',
      };
    }
  };

  return {
    addNote,
    editNote,
    removeNote,
    isSaving:
      addNoteMutation.isPending ||
      editNoteMutation.isPending ||
      removeNoteMutation.isPending,
  };
}
