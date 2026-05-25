import { assignSignalDisposition } from '@/features/standup/lib/activity/signal-disposition';
import { searchCommits } from './commit-search';
import { dedupeBySha } from './commit-utils';
import { fetchDefaultBranchCommits } from './list-commits';
import { mergeHybridCommits } from './merge-hybrid';
import { fetchOpenPrCommits } from './open-pr-commits';
import type { ParsedCommit, RepoCommitFetchInput } from './types';

export async function fetchRepoCommits(
  input: RepoCommitFetchInput
): Promise<ParsedCommit[]> {
  const defaultBranchCommits = await fetchDefaultBranchCommits({
    token: input.token,
    repositoryFullName: input.repositoryFullName,
    since: input.since,
    until: input.until,
    githubUserId: input.githubUserId,
    githubLogin: input.githubLogin,
    enrichPulls: input.enrichPulls,
  });

  if (!input.githubLogin) {
    return defaultBranchCommits.map((commit) => ({
      ...commit,
      signal_disposition: assignSignalDisposition({
        pr_state: commit.pr_state,
        pr_merged_at: commit.pr_merged_at,
        sources: new Set(['default_branch']),
      }),
    }));
  }

  const [searchResults, openPrResults] = await Promise.all([
    searchCommits({
      token: input.token,
      repositoryFullName: input.repositoryFullName,
      authorLogin: input.githubLogin,
      since: input.since,
      until: input.until,
      githubUserId: input.githubUserId,
      githubLogin: input.githubLogin,
      enrichPulls: input.enrichPulls,
    }),
    fetchOpenPrCommits({
      token: input.token,
      repositoryFullName: input.repositoryFullName,
      since: input.since,
      until: input.until,
      githubUserId: input.githubUserId,
      githubLogin: input.githubLogin,
    }),
  ]);

  return mergeHybridCommits(
    defaultBranchCommits,
    dedupeBySha([...searchResults, ...openPrResults])
  );
}
