import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

export type StandupUpdateRow = {
  id: string;
  user_id: string;
  workday: Workday;
  draft_markdown: string;
  copied_at: string | null;
  format_used: string | null;
  created_at: string;
  updated_at: string;
};

export const STANDUP_UPDATE_COLUMNS =
  'id, user_id, workday, draft_markdown, copied_at, format_used, created_at, updated_at' as const;

export async function fetchStandupsInHistory(
  supabase: SupabaseClient,
  minimumWorkday: Workday,
  maximumWorkday: Workday
): Promise<{ standups: StandupUpdateRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .gte('workday', minimumWorkday)
    .lte('workday', maximumWorkday)
    .order('workday', { ascending: false });

  if (error) {
    return { standups: [], error: error.message };
  }
  return { standups: (data as StandupUpdateRow[]) ?? [], error: null };
}

export async function fetchStandupUpdate(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ standup: StandupUpdateRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .eq('workday', workday)
    .maybeSingle();

  if (error) {
    return { standup: null, error: error.message };
  }
  return { standup: (data as StandupUpdateRow | null) ?? null, error: null };
}

export async function saveStandupUpdate(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  draftMarkdown: string
): Promise<{ standup: StandupUpdateRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .upsert(
      {
        user_id: userId,
        workday,
        draft_markdown: draftMarkdown,
      },
      { onConflict: 'user_id,workday' }
    )
    .select(STANDUP_UPDATE_COLUMNS)
    .single();

  if (error) {
    return { standup: null, error: error.message };
  }
  return { standup: data as StandupUpdateRow, error: null };
}

export async function deleteStandupUpdate(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('standup_updates')
    .delete()
    .eq('workday', workday);

  return { error: error?.message ?? null };
}
