import { useAuth } from '@/context/auth';
import {
  createNote,
  deleteNote,
  listCarryForwardNotes,
  listNotes,
  updateNote,
} from '@/features/standup/lib/notes/notes-api';
import type {
  ManualNoteInput,
  ManualNoteRow,
} from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';
import * as React from 'react';

export function useManualNotes(workday: Workday) {
  const { supabase, session } = useAuth();
  const [notes, setNotes] = React.useState<ManualNoteRow[]>([]);
  const [carryForwardNotes, setCarryForwardNotes] = React.useState<
    ManualNoteRow[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [dayResult, carryResult] = await Promise.all([
      listNotes(supabase, workday),
      listCarryForwardNotes(supabase, workday),
    ]);
    setNotes(dayResult.notes);
    setCarryForwardNotes(carryResult.notes);
    setError(dayResult.error ?? carryResult.error);
    setLoading(false);
  }, [supabase, workday]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const addNote = React.useCallback(
    async (input: ManualNoteInput) => {
      if (!supabase || !session) {
        return { error: 'Not signed in.' };
      }
      const { note, error: createError } = await createNote(
        supabase,
        session.user.id,
        workday,
        input
      );
      if (createError) {
        return { error: createError };
      }
      await reload();
      return { note, error: null };
    },
    [supabase, session, workday, reload]
  );

  const editNote = React.useCallback(
    async (noteId: string, input: ManualNoteInput) => {
      if (!supabase) {
        return { error: 'Not signed in.' };
      }
      const { note, error: updateError } = await updateNote(
        supabase,
        noteId,
        input
      );
      if (updateError) {
        return { error: updateError };
      }
      await reload();
      return { note, error: null };
    },
    [supabase, reload]
  );

  const removeNote = React.useCallback(
    async (noteId: string) => {
      if (!supabase) {
        return { error: 'Not signed in.' };
      }
      const { error: deleteError } = await deleteNote(supabase, noteId);
      if (deleteError) {
        return { error: deleteError };
      }
      await reload();
      return { error: null };
    },
    [supabase, reload]
  );

  return {
    notes,
    carryForwardNotes,
    loading,
    error,
    reload,
    addNote,
    editNote,
    removeNote,
  };
}
