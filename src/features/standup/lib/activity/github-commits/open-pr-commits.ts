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
import { githubAuthHeaders } from './github-auth';
import { listCommitsPage } from './list-commits';
import type { GithubPullApi, ParsedCommit } from './types';

const MAX_PAGES = 5;

async function fetchOpenPulls(
  token: string,
  owner: string,
  repo: string
): Promise<GithubPullApi[]> {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/pulls`);
  url.searchParams.set('state', 'open');
  url.searchParams.set('per_page', '100');

  const res = await fetch(url.toString(), {
    headers: githubAuthHeaders(token),
  });
  assertGithubRateLimit(res);

  if (res.status === 401 || res.status === 403) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
  }
  if (!res.ok) {
    return [];
  }

  const pulls = (await res.json()) as GithubPullApi[];
  return Array.isArray(pulls) ? pulls : [];
}

export async function fetchOpenPrCommits(input: {
  token: string;
  repositoryFullName: string;
  since: string;
  until: string;
  githubUserId: number | null;
  githubLogin: string;
}): Promise<ParsedCommit[]> {
  const parts = parseRepoFullName(input.repositoryFullName);
  if (!parts) {
    return [];
  }
  const { owner, repo } = parts;

  const pulls = await fetchOpenPulls(input.token, owner, repo);
  const authoredPulls = pulls.filter(
    (pull) =>
      typeof pull.head?.ref === 'string' &&
      pull.head.ref.length > 0 &&
      pull.user?.login?.toLowerCase() === input.githubLogin.toLowerCase()
  );

  const raw: ParsedCommit[] = [];

  for (const pull of authoredPulls) {
    if (typeof pull.number !== 'number') {
      continue;
    }

    const prMeta = {
      pr_number: pull.number,
      pr_title: typeof pull.title === 'string' ? pull.title : null,
      pr_url: typeof pull.html_url === 'string' ? pull.html_url : null,
      pr_state: typeof pull.state === 'string' ? pull.state : 'open',
      pr_merged_at:
        typeof pull.merged_at === 'string'
          ? pull.merged_at
          : (pull.merged_at ?? null),
    };

    const headRef = pull.head!.ref!;

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const chunk = await listCommitsPage(
        input.token,
        owner,
        repo,
        input.since,
        input.until,
        page,
        headRef
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
        if (!isInWorkdayBounds(base.committed_at, input.since, input.until)) {
          continue;
        }
        raw.push({ ...base, ...prMeta });
      }

      if (chunk.length < 100) {
        break;
      }
    }
  }

  return dedupeBySha(raw);
}
