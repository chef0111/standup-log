import type { Workday } from '@/features/standup/types/workday';

export type ManualNoteRow = {
  id: string;
  user_id: string;
  workday: Workday;
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
  created_at: string;
  updated_at: string;
};

export const MANUAL_NOTE_COLUMNS =
  'id, user_id, workday, body, is_blocker, is_carry_forward, created_at, updated_at' as const;

export type ManualNoteInput = {
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
};
