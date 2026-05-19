import {
  MANUAL_NOTE_COLUMNS,
  type ManualNoteInput,
  type ManualNoteRow,
} from '@/features/notes/types/manual-note';
import type { Workday } from '@/features/workday/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

function trimBody(body: string): string {
  return body.trim();
}

export function validateNoteBody(body: string): string | null {
  if (trimBody(body).length === 0) {
    return 'Note cannot be empty.';
  }
  return null;
}

export async function listNotes(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ notes: ManualNoteRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('manual_notes')
    .select(MANUAL_NOTE_COLUMNS)
    .eq('workday', workday)
    .order('created_at', { ascending: true });

  if (error) {
    return { notes: [], error: error.message };
  }
  return { notes: (data ?? []) as ManualNoteRow[], error: null };
}

export async function listCarryForwardNotes(
  supabase: SupabaseClient,
  beforeWorkday: Workday
): Promise<{ notes: ManualNoteRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('manual_notes')
    .select(MANUAL_NOTE_COLUMNS)
    .eq('is_carry_forward', true)
    .lt('workday', beforeWorkday)
    .order('workday', { ascending: false });

  if (error) {
    return { notes: [], error: error.message };
  }
  return { notes: (data ?? []) as ManualNoteRow[], error: null };
}

export async function createNote(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  input: ManualNoteInput
): Promise<{ note: ManualNoteRow | null; error: string | null }> {
  const validation = validateNoteBody(input.body);
  if (validation) {
    return { note: null, error: validation };
  }

  const { data, error } = await supabase
    .from('manual_notes')
    .insert({
      user_id: userId,
      workday,
      body: trimBody(input.body),
      is_blocker: input.is_blocker,
      is_carry_forward: input.is_carry_forward,
    })
    .select(MANUAL_NOTE_COLUMNS)
    .single();

  if (error) {
    return { note: null, error: error.message };
  }
  return { note: data as ManualNoteRow, error: null };
}

export async function updateNote(
  supabase: SupabaseClient,
  noteId: string,
  input: ManualNoteInput
): Promise<{ note: ManualNoteRow | null; error: string | null }> {
  const validation = validateNoteBody(input.body);
  if (validation) {
    return { note: null, error: validation };
  }

  const { data, error } = await supabase
    .from('manual_notes')
    .update({
      body: trimBody(input.body),
      is_blocker: input.is_blocker,
      is_carry_forward: input.is_carry_forward,
    })
    .eq('id', noteId)
    .select(MANUAL_NOTE_COLUMNS)
    .single();

  if (error) {
    return { note: null, error: error.message };
  }
  return { note: data as ManualNoteRow, error: null };
}

export async function deleteNote(
  supabase: SupabaseClient,
  noteId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('manual_notes')
    .delete()
    .eq('id', noteId);
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
