import {
  composeManualStandup,
  STANDUP_UPDATE_COLUMNS,
  type ComposeManualStandupInput,
  type StandupSections,
  type StandupUpdateRow,
} from '@/features/standup/lib/compose-standup';
import type { Workday } from '@/features/workday/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  sections: StandupSections
): Promise<{ standup: StandupUpdateRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('standup_updates')
    .upsert(
      {
        user_id: userId,
        workday,
        yesterday_text: sections.yesterday,
        today_text: sections.today,
        blockers_text: sections.blockers,
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

export function mergeStandupSections(
  composed: StandupSections,
  saved: StandupUpdateRow | null
): StandupSections {
  if (!saved) {
    return composed;
  }
  return {
    yesterday: saved.yesterday_text,
    today: saved.today_text,
    blockers: saved.blockers_text,
  };
}

export async function loadOrComposeStandup(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  composeInput: ComposeManualStandupInput
): Promise<{
  sections: StandupSections;
  saved: boolean;
  error: string | null;
}> {
  const { standup, error } = await fetchStandupUpdate(supabase, workday);
  if (error) {
    return {
      sections: composeManualStandup(composeInput),
      saved: false,
      error,
    };
  }
  if (standup) {
    return {
      sections: mergeStandupSections(
        composeManualStandup(composeInput),
        standup
      ),
      saved: true,
      error: null,
    };
  }
  return {
    sections: composeManualStandup(composeInput),
    saved: false,
    error: null,
  };
}
