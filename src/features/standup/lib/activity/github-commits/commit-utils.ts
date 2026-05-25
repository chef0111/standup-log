import type { GithubCommitApi, ParsedCommit } from './types';

export function parseRepoFullName(
  repositoryFullName: string
): { owner: string; repo: string } | null {
  const [owner, repo] = repositoryFullName.split('/');
  if (!owner || !repo) {
    return null;
  }
  return { owner, repo };
}

export function dedupeBySha<T extends { sha: string }>(commits: T[]): T[] {
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

export function isInWorkdayBounds(
  committedAt: string,
  since: string,
  until: string
): boolean {
  const time = Date.parse(committedAt);
  if (Number.isNaN(time)) {
    return false;
  }
  return time >= Date.parse(since) && time < Date.parse(until);
}

export function isAuthoredByUser(
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

export function mapCommitRow(
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
