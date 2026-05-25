import {
  assertGithubRateLimit,
  githubHttpErrorMessage,
} from '@/features/standup/lib/activity/github-rate-limit';
import {
  assignSignalDisposition,
  type CommitSource,
} from '@/features/standup/lib/activity/signal-disposition';
import type { ActivityCommitInsert } from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';
import { AppError } from '@/lib/errors';

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
} as const;

const SEARCH_COMMITS_ACCEPT = 'application/vnd.github.cloak-preview+json';

type GithubCommitApi = {
  sha?: string;
  html_url?: string;
  author?: { id?: number; login?: string } | null;
  commit?: {
    message?: string;
    author?: { date?: string; name?: string; email?: string } | null;
  };
};

type GithubPullApi = {
  number?: number;
  title?: string;
  html_url?: string;
  state?: string;
  merged_at?: string | null;
};

export type ParsedCommit = Omit<
  ActivityCommitInsert,
  'user_id' | 'workday' | 'synced_at'
>;

const REPO_SYNC_DELAY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function githubAuthHeaders(token: string): Record<string, string> {
  return {
    ...GITHUB_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

function isAuthoredByUser(
  commit: GithubCommitApi,
  githubUserId: number | null,
  githubLogin: string | null
): boolean {
  if (!commit.author) {
    return false;
  }
  if (
    githubUserId != null &&
    typeof commit.author.id === 'number' &&
    commit.author.id === githubUserId
  ) {
    return true;
  }
  if (
    githubLogin &&
    typeof commit.author.login === 'string' &&
    commit.author.login.toLowerCase() === githubLogin.toLowerCase()
  ) {
    return true;
  }
  return false;
}

export function dedupeCommitsBySha<T extends { sha: string }>(
  commits: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of commits) {
    if (seen.has(row.sha)) {
      continue;
    }
    seen.add(row.sha);
    out.push(row);
  }
  return out;
}

function mapGithubCommitRow(
  row: GithubCommitApi,
  repositoryFullName: string
): ParsedCommit | null {
  if (
    !row.sha ||
    typeof row.html_url !== 'string' ||
    typeof row.commit?.message !== 'string' ||
    typeof row.commit?.author?.date !== 'string'
  ) {
    return null;
  }

  return {
    repository_full_name: repositoryFullName,
    sha: row.sha,
    message: row.commit.message.trim(),
    committed_at: row.commit.author.date,
    html_url: row.html_url,
    author_login:
      typeof row.author?.login === 'string' ? row.author.login : null,
    pr_number: null,
    pr_title: null,
    pr_url: null,
    pr_state: null,
    pr_merged_at: null,
    signal_disposition: 'shipped',
    work_type: null,
  };
}

async function fetchPullDetail(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<Pick<ParsedCommit, 'pr_merged_at' | 'pr_state'>> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
    const res = await fetch(url, { headers: githubAuthHeaders(token) });
    if (!res.ok) {
      return { pr_merged_at: null, pr_state: null };
    }
    const pr = (await res.json()) as GithubPullApi;
    return {
      pr_merged_at:
        typeof pr.merged_at === 'string' ? pr.merged_at : pr.merged_at ?? null,
      pr_state: typeof pr.state === 'string' ? pr.state : null,
    };
  } catch {
    return { pr_merged_at: null, pr_state: null };
  }
}

async function fetchCommitPullMetadata(
  token: string,
  owner: string,
  repo: string,
  sha: string
): Promise<
  Pick<
    ParsedCommit,
    'pr_number' | 'pr_title' | 'pr_url' | 'pr_state' | 'pr_merged_at'
  >
> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/pulls`;
    const res = await fetch(url, { headers: githubAuthHeaders(token) });
    if (!res.ok) {
      return {
        pr_number: null,
        pr_title: null,
        pr_url: null,
        pr_state: null,
        pr_merged_at: null,
      };
    }
    const pulls = (await res.json()) as GithubPullApi[];
    const first = Array.isArray(pulls) ? pulls[0] : undefined;
    if (!first || typeof first.number !== 'number') {
      return {
        pr_number: null,
        pr_title: null,
        pr_url: null,
        pr_state: null,
        pr_merged_at: null,
      };
    }

    const detail = await fetchPullDetail(token, owner, repo, first.number);

    return {
      pr_number: first.number,
      pr_title: typeof first.title === 'string' ? first.title : null,
      pr_url: typeof first.html_url === 'string' ? first.html_url : null,
      pr_state: detail.pr_state ?? (typeof first.state === 'string' ? first.state : null),
      pr_merged_at: detail.pr_merged_at,
    };
  } catch {
    return {
      pr_number: null,
      pr_title: null,
      pr_url: null,
      pr_state: null,
      pr_merged_at: null,
    };
  }
}

async function fetchRepoCommitsPage(
  token: string,
  owner: string,
  repo: string,
  since: string,
  until: string,
  page: number
): Promise<GithubCommitApi[]> {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
  url.searchParams.set('since', since);
  url.searchParams.set('until', until);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', String(page));

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

async function fetchSearchCommitsForWorkday(input: {
  token: string;
  repositoryFullName: string;
  authorLogin: string;
  workday: Workday;
  githubUserId: number | null;
  githubLogin: string | null;
  enrichPulls?: boolean;
}): Promise<ParsedCommit[]> {
  const [owner, repo] = input.repositoryFullName.split('/');
  if (!owner || !repo) {
    return [];
  }

  const q = [
    `repo:${owner}/${repo}`,
    `author:${input.authorLogin}`,
    `committer-date:${input.workday}..${input.workday}`,
  ].join('+');

  const url = new URL('https://api.github.com/search/commits');
  url.searchParams.set('q', q);
  url.searchParams.set('per_page', '100');

  const res = await fetch(url.toString(), {
    headers: {
      ...githubAuthHeaders(input.token),
      Accept: SEARCH_COMMITS_ACCEPT,
    },
  });
  assertGithubRateLimit(res);

  if (res.status === 401 || res.status === 403) {
    throw new AppError('github', githubHttpErrorMessage(res.status));
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
    const base = mapGithubCommitRow(row, input.repositoryFullName);
    if (!base) {
      continue;
    }

    if (input.enrichPulls) {
      const pr = await fetchCommitPullMetadata(
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

  return dedupeCommitsBySha(raw);
}

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

export async function fetchRepoCommitsForWorkday(input: {
  token: string;
  repositoryFullName: string;
  since: string;
  until: string;
  workday: Workday;
  githubUserId: number | null;
  githubLogin: string | null;
  enrichPulls?: boolean;
}): Promise<ParsedCommit[]> {
  const [owner, repo] = input.repositoryFullName.split('/');
  if (!owner || !repo) {
    return [];
  }

  const raw: ParsedCommit[] = [];
  const maxPages = 5;

  for (let page = 1; page <= maxPages; page += 1) {
    const chunk = await fetchRepoCommitsPage(
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
      const base = mapGithubCommitRow(row, input.repositoryFullName);
      if (!base) {
        continue;
      }

      if (input.enrichPulls) {
        const pr = await fetchCommitPullMetadata(
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

  const defaultBranchCommits = dedupeCommitsBySha(raw);

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

  const searchCommits = await fetchSearchCommitsForWorkday({
    token: input.token,
    repositoryFullName: input.repositoryFullName,
    authorLogin: input.githubLogin,
    workday: input.workday,
    githubUserId: input.githubUserId,
    githubLogin: input.githubLogin,
    enrichPulls: input.enrichPulls,
  });

  return mergeHybridCommits(defaultBranchCommits, searchCommits);
}

const CONCURRENCY = 3;

export async function fetchAllRepoCommitsForWorkday(input: {
  token: string;
  repositoryFullNames: string[];
  since: string;
  until: string;
  workday: Workday;
  githubUserId: number | null;
  githubLogin: string | null;
  enrichPulls?: boolean;
}): Promise<ParsedCommit[]> {
  const repos = input.repositoryFullNames;
  const all: ParsedCommit[] = [];

  for (let i = 0; i < repos.length; i += CONCURRENCY) {
    const batch = repos.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((repositoryFullName) =>
        fetchRepoCommitsForWorkday({
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

  return dedupeCommitsBySha(all);
}
