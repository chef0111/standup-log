import {
  PLAIN_COPY_FORMAT,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { nextStreakState } from '@/features/standup/lib/streak';
import type { Workday } from '@/features/standup/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

import { STANDUP_UPDATE_COLUMNS } from './types';

const PROFILE_STREAK_COLUMNS =
  'current_streak, longest_streak, last_streak_workday' as const;

export type RecordStandupCopyResult = {
  streakIncremented: boolean;
  currentStreak: number;
  error: string | null;
};

export async function recordStandupCopy(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  draftMarkdown: string,
  formatUsed: CopyFormat = PLAIN_COPY_FORMAT
): Promise<RecordStandupCopyResult> {
  const { data: standup, error: fetchError } = await supabase
    .from('standup_updates')
    .select(STANDUP_UPDATE_COLUMNS)
    .eq('user_id', userId)
    .eq('workday', workday)
    .maybeSingle();

  if (fetchError) {
    return {
      streakIncremented: false,
      currentStreak: 0,
      error: fetchError.message,
    };
  }

  const alreadyCopied = Boolean(standup?.copied_at);
  const copiedAt = standup?.copied_at ?? new Date().toISOString();

  if (standup) {
    const { error: updateError } = await supabase
      .from('standup_updates')
      .update({
        draft_markdown: draftMarkdown,
        format_used: formatUsed,
        ...(alreadyCopied ? {} : { copied_at: copiedAt }),
      })
      .eq('id', standup.id);

    if (updateError) {
      return {
        streakIncremented: false,
        currentStreak: 0,
        error: updateError.message,
      };
    }
  } else {
    const { error: insertError } = await supabase
      .from('standup_updates')
      .insert({
        user_id: userId,
        workday,
        draft_markdown: draftMarkdown,
        copied_at: copiedAt,
        format_used: formatUsed,
      });

    if (insertError) {
      return {
        streakIncremented: false,
        currentStreak: 0,
        error: insertError.message,
      };
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_STREAK_COLUMNS)
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return {
      streakIncremented: false,
      currentStreak: 0,
      error: profileError?.message ?? 'Profile not found',
    };
  }

  const streak = nextStreakState(
    {
      currentStreak: profile.current_streak ?? 0,
      longestStreak: profile.longest_streak ?? 0,
      lastStreakWorkday: profile.last_streak_workday,
    },
    workday,
    alreadyCopied
  );

  if (streak.streakIncremented) {
    const { error: streakError } = await supabase
      .from('profiles')
      .update({
        current_streak: streak.currentStreak,
        longest_streak: streak.longestStreak,
        last_streak_workday: streak.lastStreakWorkday,
      })
      .eq('id', userId);

    if (streakError) {
      return {
        streakIncremented: false,
        currentStreak: profile.current_streak ?? 0,
        error: streakError.message,
      };
    }
  }

  return {
    streakIncremented: streak.streakIncremented,
    currentStreak: streak.currentStreak,
    error: null,
  };
}
