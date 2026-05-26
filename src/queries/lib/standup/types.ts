import type { Workday } from '@/features/standup/types/workday';

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
