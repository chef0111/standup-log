import type { SignalDisposition } from '@/features/standup/types/activity-commit';

export type CommitWorkType =
  | 'feature'
  | 'bug'
  | 'refactor'
  | 'test'
  | 'chore'
  | 'style';

export type GenerateDraftCommitInput = {
  sha: string;
  message: string;
  repository_full_name: string;
  pr_number: number | null;
  pr_title: string | null;
  pr_state?: string | null;
  pr_merged_at?: string | null;
  signal_disposition?: SignalDisposition;
};

export type GenerateDraftNoteInput = {
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
};

export type GenerateDraftRequest = {
  workday: string;
  commits: GenerateDraftCommitInput[];
  notes: GenerateDraftNoteInput[];
};

export type GenerateDraftClassification = {
  sha: string;
  work_type: CommitWorkType;
};

export type GenerateDraftResponse = {
  draft_markdown: string;
  classifications: GenerateDraftClassification[];
};

export type GenerateDraftRateLimitError = {
  error: 'rate_limited';
  retry_after_seconds: number;
  remaining: number;
};

export type GenerateDraftDailyLimitError = {
  error: 'daily_limit';
  retry_after_seconds?: number;
};
