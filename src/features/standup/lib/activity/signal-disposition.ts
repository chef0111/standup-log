import type { SignalDisposition } from '@/features/standup/types/activity-commit';

export type CommitSource = 'default_branch' | 'search';

export type CommitWithSources = {
  pr_state: string | null;
  pr_merged_at: string | null;
  sources: Set<CommitSource>;
};

export function assignSignalDisposition(
  commit: CommitWithSources
): SignalDisposition {
  if (commit.pr_merged_at) {
    return 'shipped';
  }
  if (commit.pr_state?.toLowerCase() === 'open') {
    return 'in_progress';
  }
  if (commit.sources.has('default_branch')) {
    return 'shipped';
  }
  return 'in_progress';
}

export function isMergedPullRequest(input: {
  pr_merged_at: string | null;
  pr_state: string | null;
}): boolean {
  if (input.pr_merged_at) {
    return true;
  }
  return input.pr_state?.toLowerCase() === 'merged';
}

export function isOpenPullRequest(input: {
  pr_number: number | null;
  pr_merged_at: string | null;
  pr_state: string | null;
}): boolean {
  if (input.pr_number == null) {
    return false;
  }
  if (isMergedPullRequest(input)) {
    return false;
  }
  return input.pr_state?.toLowerCase() === 'open';
}
