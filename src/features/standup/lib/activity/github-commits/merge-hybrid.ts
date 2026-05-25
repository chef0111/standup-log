import {
  assignSignalDisposition,
  type CommitSource,
} from '@/features/standup/lib/activity/signal-disposition';
import type { ParsedCommit } from './types';

export function mergeHybridCommits(
  defaultBranchCommits: ParsedCommit[],
  searchCommits: ParsedCommit[]
): ParsedCommit[] {
  const sourceBySha = new Map<string, Set<CommitSource>>();
  const commitBySha = new Map<string, ParsedCommit>();

  for (const commit of defaultBranchCommits) {
    sourceBySha.set(commit.sha, new Set(['default_branch']));
    commitBySha.set(commit.sha, commit);
  }

  for (const commit of searchCommits) {
    const sources = sourceBySha.get(commit.sha) ?? new Set<CommitSource>();
    sources.add('search');
    sourceBySha.set(commit.sha, sources);

    const existing = commitBySha.get(commit.sha);
    if (!existing) {
      commitBySha.set(commit.sha, commit);
      continue;
    }

    commitBySha.set(commit.sha, {
      ...existing,
      pr_number: existing.pr_number ?? commit.pr_number,
      pr_title: existing.pr_title ?? commit.pr_title,
      pr_url: existing.pr_url ?? commit.pr_url,
      pr_state: existing.pr_state ?? commit.pr_state,
      pr_merged_at: existing.pr_merged_at ?? commit.pr_merged_at,
    });
  }

  return [...commitBySha.values()].map((commit) => {
    const sources = sourceBySha.get(commit.sha) ?? new Set<CommitSource>();
    return {
      ...commit,
      signal_disposition: assignSignalDisposition({
        pr_state: commit.pr_state,
        pr_merged_at: commit.pr_merged_at,
        sources,
      }),
    };
  });
}
