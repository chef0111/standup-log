import type { CopyFormat } from '@/features/standup/lib/format-standup';
import type { Workday } from '@/features/standup/types/workday';

export const PROFILE_HOME_COLUMNS =
  'github_login, avatar_url, github_user_id, onboarding_completed_at, selected_repositories, is_pro, default_copy_format, current_streak, longest_streak, last_streak_workday, reminder_enabled, reminder_time_local' as const;

export type ProfileHomeRow = {
  github_login: string | null;
  avatar_url: string | null;
  github_user_id: number | null;
  onboarding_completed_at: string | null;
  selected_repositories: unknown;
  is_pro: boolean;
  default_copy_format: CopyFormat;
  current_streak: number;
  longest_streak: number;
  last_streak_workday: Workday | null;
  reminder_enabled: boolean;
  reminder_time_local: string;
};
