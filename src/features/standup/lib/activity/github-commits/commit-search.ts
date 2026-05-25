import {
  assertGithubRateLimit,
  githubHttpErrorMessage,
} from '@/features/standup/lib/activity/github-rate-limit';
import { AppError } from '@/lib/errors';
import {
  dedupeBySha,
  isAuthoredByUser,
  isInWorkdayBounds,
  mapCommitRow,
  parseRepoFullName,
} from './commit-utils';
import { GITHUB_HEADERS, githubAuthHeaders } from './github-auth';
import { fetchCommitPullMeta } from './pull-metadata';
import type { GithubCommitApi, ParsedCommit } from './types';

export function buildSearchQuery(input: {
  repositoryFullName: string;
  authorLogin: string;
}): string {
  const parts = parseRepoFullName(input.repositoryFullName);
  if (!parts) {
    return '';
  }

  return [
    `repo:${parts.owner}/${parts.repo}`,
    `author:${input.authorLogin}`,
  ].join('+');
}

export function buildSearchUrl(q: string, perPage: number): string {
  return `https://api.github.com/search/commits?q=${q}&per_page=${perPage}&sort=author-date&order=desc`;
}

export async function searchCommits(input: {
  token: string;
  repositoryFullName: string;
  authorLogin: string;
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

  const q = buildSearchQuery({
    repositoryFullName: input.repositoryFullName,
    authorLogin: input.authorLogin,
  });
  if (!q) {
    return [];
  }

  const res = await fetch(buildSearchUrl(q, 100), {
    headers: {
      ...githubAuthHeaders(input.token),
      Accept: GITHUB_HEADERS.Accept,
    },
  });
  assertGithubRateLimit(res);

  if (res.status === 401 || res.status === 403) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
  }
  if (res.status === 422) {
    return [];
  }
  if (!res.ok) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
  }

  const body = (await res.json()) as { items?: GithubCommitApi[] };
  const items = Array.isArray(body.items) ? body.items : [];
  const raw: ParsedCommit[] = [];

  for (const row of items) {
    if (!isAuthoredByUser(row, input.githubUserId, input.githubLogin)) {
      continue;
    }
    const base = mapCommitRow(row, input.repositoryFullName);
    if (!base) {
      continue;
    }
    if (!isInWorkdayBounds(base.committed_at, input.since, input.until)) {
      continue;
    }

    if (input.enrichPulls) {
      const pr = await fetchCommitPullMeta(input.token, owner, repo, base.sha);
      raw.push({ ...base, ...pr });
    } else {
      raw.push(base);
    }
  }

  return dedupeBySha(raw);
}
