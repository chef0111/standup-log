import type { ActivityCommitInsert } from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';

export type GithubCommitApi = {
  sha?: string;
  html_url?: string;
  author?: { id?: number; login?: string } | null;
  commit?: {
    message?: string;
    author?: { date?: string; name?: string; email?: string } | null;
  };
};

export type GithubPullApi = {
  number?: number;
  title?: string;
  html_url?: string;
  state?: string;
  merged_at?: string | null;
  user?: { login?: string } | null;
  head?: { ref?: string } | null;
};

export type ParsedCommit = Omit<
  ActivityCommitInsert,
  'user_id' | 'workday' | 'synced_at'
>;

export type RepoCommitFetchInput = {
  token: string;
  repositoryFullName: string;
  since: string;
  until: string;
  workday: Workday;
  githubUserId: number | null;
  githubLogin: string | null;
  enrichPulls?: boolean;
};

export type AllReposCommitFetchInput = RepoCommitFetchInput & {
  repositoryFullNames: string[];
};
