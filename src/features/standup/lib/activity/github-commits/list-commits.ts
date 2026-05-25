import {
  assertGithubRateLimit,
  githubHttpErrorMessage,
} from '@/features/standup/lib/activity/github-rate-limit';
import { AppError } from '@/lib/errors';
import {
  dedupeBySha,
  isAuthoredByUser,
  mapCommitRow,
  parseRepoFullName,
} from './commit-utils';
import { githubAuthHeaders } from './github-auth';
import { fetchCommitPullMeta } from './pull-metadata';
import type { GithubCommitApi, ParsedCommit } from './types';

const MAX_PAGES = 5;

export async function listCommitsPage(
  token: string,
  owner: string,
  repo: string,
  since: string,
  until: string,
  page: number,
  ref?: string
): Promise<GithubCommitApi[]> {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
  url.searchParams.set('since', since);
  url.searchParams.set('until', until);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', String(page));
  if (ref) {
    url.searchParams.set('sha', ref);
  }

  const res = await fetch(url.toString(), {
    headers: githubAuthHeaders(token),
  });
  assertGithubRateLimit(res);

  if (res.status === 401 || res.status === 403) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
  }
  if (!res.ok) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
  }

  const chunk = (await res.json()) as GithubCommitApi[];
  return Array.isArray(chunk) ? chunk : [];
}

export async function fetchDefaultBranchCommits(input: {
  token: string;
  repositoryFullName: string;
  since: string;
  until: string;
  githubUserId: number | null;
  githubLogin: string | null;
  enrichPulls?: boolean;
}): Promise<ParsedCommit[]> {
  const parts = parseRepoFullName(input.repositoryFullName);
  if (!parts) {
    return [];
  }
  const { owner, repo } = parts;

  const raw: ParsedCommit[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const chunk = await listCommitsPage(
      input.token,
      owner,
      repo,
      input.since,
      input.until,
      page
    );
    if (chunk.length === 0) {
      break;
    }

    for (const row of chunk) {
      if (!isAuthoredByUser(row, input.githubUserId, input.githubLogin)) {
        continue;
      }
      const base = mapCommitRow(row, input.repositoryFullName);
      if (!base) {
        continue;
      }

      if (input.enrichPulls) {
        const pr = await fetchCommitPullMeta(
          input.token,
          owner,
          repo,
          base.sha
        );
        raw.push({ ...base, ...pr });
      } else {
        raw.push(base);
      }
    }

    if (chunk.length < 100) {
      break;
    }
  }

  return dedupeBySha(raw);
}
