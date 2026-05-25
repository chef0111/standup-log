import { dedupeBySha } from './commit-utils';
import { fetchRepoCommits } from './fetch-repo-commits';
import { sleep } from './github-auth';
import type { AllReposCommitFetchInput, ParsedCommit } from './types';

const CONCURRENCY = 3;
const REPO_SYNC_DELAY_MS = 200;

export async function fetchAllRepoCommits(
  input: AllReposCommitFetchInput
): Promise<ParsedCommit[]> {
  const repos = input.repositoryFullNames;
  const all: ParsedCommit[] = [];

  for (let i = 0; i < repos.length; i += CONCURRENCY) {
    const batch = repos.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((repositoryFullName) =>
        fetchRepoCommits({
          token: input.token,
          repositoryFullName,
          since: input.since,
          until: input.until,
          workday: input.workday,
          githubUserId: input.githubUserId,
          githubLogin: input.githubLogin,
          enrichPulls: input.enrichPulls,
        })
      )
    );
    for (const chunk of results) {
      all.push(...chunk);
    }
    if (i + CONCURRENCY < repos.length) {
      await sleep(REPO_SYNC_DELAY_MS);
    }
  }

  return dedupeBySha(all);
}
