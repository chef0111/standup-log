import type { Workday } from '@/features/workday/types/workday';

export type ActivityCommitRow = {
  id: string;
  user_id: string;
  workday: Workday;
  repository_full_name: string;
  sha: string;
  message: string;
  committed_at: string;
  html_url: string;
  author_login: string | null;
  pr_number: number | null;
  pr_title: string | null;
  pr_url: string | null;
  pr_state: string | null;
  synced_at: string;
  created_at: string;
};

export type ActivityCommitInsert = Omit<
  ActivityCommitRow,
  'id' | 'synced_at' | 'created_at'
>;

export const ACTIVITY_COMMIT_COLUMNS =
  'id, user_id, workday, repository_full_name, sha, message, committed_at, html_url, author_login, pr_number, pr_title, pr_url, pr_state, synced_at, created_at' as const;
