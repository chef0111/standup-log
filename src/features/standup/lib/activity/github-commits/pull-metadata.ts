import { githubAuthHeaders } from './github-auth';
import type { GithubPullApi, ParsedCommit } from './types';

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
        typeof pr.merged_at === 'string'
          ? pr.merged_at
          : (pr.merged_at ?? null),
      pr_state: typeof pr.state === 'string' ? pr.state : null,
    };
  } catch {
    return { pr_merged_at: null, pr_state: null };
  }
}

export async function fetchCommitPullMeta(
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
      pr_state:
        detail.pr_state ??
        (typeof first.state === 'string' ? first.state : null),
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
