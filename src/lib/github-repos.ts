import { AppError } from '@/lib/errors';
import type { SelectedRepository } from '@/types/repository';

export type GithubRepoRow = SelectedRepository & {
  ownerAvatarUrl: string | null;
};

type GithubRepoApi = {
  id: number;
  full_name?: string;
  private?: boolean;
  owner?: { avatar_url?: string | null };
};

export async function fetchUserRepos(accessToken: string): Promise<GithubRepoRow[]> {
  const all: GithubRepoRow[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const url = new URL('https://api.github.com/user/repos');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('affiliation', 'owner,collaborator,organization_member');

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new AppError('github', 'GitHub rate limit reached. Try again in a few minutes.');
    }

    if (res.status === 401 || res.status === 403) {
      throw new AppError('github', 'GitHub rejected this request. Reconnect your account and try again.');
    }

    if (!res.ok) {
      throw new AppError('github', `GitHub request failed (${res.status}).`);
    }

    const chunk = (await res.json()) as GithubRepoApi[];
    if (!Array.isArray(chunk) || chunk.length === 0) {
      break;
    }

    for (const row of chunk) {
      if (!row?.id || typeof row.full_name !== 'string') {
        continue;
      }
      all.push({
        id: row.id,
        full_name: row.full_name,
        private: Boolean(row.private),
        ownerAvatarUrl: typeof row.owner?.avatar_url === 'string' ? row.owner.avatar_url : null,
      });
    }

    if (chunk.length < 100) {
      break;
    }
  }

  return all;
}
