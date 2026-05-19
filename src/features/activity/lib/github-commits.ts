import type { ActivityCommitInsert } from '@/features/activity/types/activity-commit';
import { AppError } from '@/lib/errors';

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
} as const;

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
};

export type ParsedCommit = Omit<
  ActivityCommitInsert,
  'user_id' | 'workday' | 'synced_at'
>;

function checkRateLimit(res: Response): void {
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining === '0') {
    throw new AppError(
      'github',
      'GitHub rate limit reached. Try again in a few minutes.'
    );
  }
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

async function fetchCommitPullMetadata(
  token: string,
  owner: string,
  repo: string,
  sha: string
): Promise<
  Pick<ParsedCommit, 'pr_number' | 'pr_title' | 'pr_url' | 'pr_state'>
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
      };
    }
    const pulls = (await res.json()) as GithubPullApi[];
    const first = Array.isArray(pulls) ? pulls[0] : undefined;
    if (!first) {
      return {
        pr_number: null,
        pr_title: null,
        pr_url: null,
        pr_state: null,
      };
    }
    return {
      pr_number: typeof first.number === 'number' ? first.number : null,
      pr_title: typeof first.title === 'string' ? first.title : null,
      pr_url: typeof first.html_url === 'string' ? first.html_url : null,
      pr_state: typeof first.state === 'string' ? first.state : null,
    };
  } catch {
    return {
      pr_number: null,
      pr_title: null,
      pr_url: null,
      pr_state: null,
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
  checkRateLimit(res);

  if (res.status === 401 || res.status === 403) {
    throw new AppError(
      'github',
      'GitHub rejected this request. Reconnect your account and try again.'
    );
  }
  if (!res.ok) {
    throw new AppError('github', `GitHub request failed (${res.status}).`);
  }

  const chunk = (await res.json()) as GithubCommitApi[];
  return Array.isArray(chunk) ? chunk : [];
}

export async function fetchRepoCommitsForWorkday(input: {
  token: string;
  repositoryFullName: string;
  since: string;
  until: string;
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
      if (
        !row.sha ||
        typeof row.html_url !== 'string' ||
        typeof row.commit?.message !== 'string' ||
        typeof row.commit?.author?.date !== 'string'
      ) {
        continue;
      }
      if (!isAuthoredByUser(row, input.githubUserId, input.githubLogin)) {
        continue;
      }

      const base: ParsedCommit = {
        repository_full_name: input.repositoryFullName,
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
      };

      if (input.enrichPulls) {
        const pr = await fetchCommitPullMetadata(
          input.token,
          owner,
          repo,
          row.sha
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

  return dedupeCommitsBySha(raw);
}

const CONCURRENCY = 3;

export async function fetchAllRepoCommitsForWorkday(input: {
  token: string;
  repositoryFullNames: string[];
  since: string;
  until: string;
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
          githubUserId: input.githubUserId,
          githubLogin: input.githubLogin,
          enrichPulls: input.enrichPulls,
        })
      )
    );
    for (const chunk of results) {
      all.push(...chunk);
    }
  }

  return dedupeCommitsBySha(all);
}
