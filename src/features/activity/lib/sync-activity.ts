import {
  fetchAllRepoCommitsForWorkday,
  type ParsedCommit,
} from '@/features/activity/lib/github-commits';
import {
  ACTIVITY_COMMIT_COLUMNS,
  type ActivityCommitRow,
} from '@/features/activity/types/activity-commit';
import type { SelectedRepository } from '@/features/repositories/types/repository';
import { workdayUtcBounds } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchActivityCommits(
  supabase: SupabaseClient,
  workday: Workday
): Promise<{ commits: ActivityCommitRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('activity_commits')
    .select(ACTIVITY_COMMIT_COLUMNS)
    .eq('workday', workday)
    .order('committed_at', { ascending: false });

  if (error) {
    return { commits: [], error: error.message };
  }
  return { commits: (data ?? []) as ActivityCommitRow[], error: null };
}

export async function syncActivityForWorkday(input: {
  supabase: SupabaseClient;
  token: string;
  userId: string;
  workday: Workday;
  repos: SelectedRepository[];
  githubUserId: number | null;
  githubLogin: string | null;
  timeZone?: string;
}): Promise<{ commits: ActivityCommitRow[]; error: string | null }> {
  const { since, until } = workdayUtcBounds(input.workday, input.timeZone);
  const repoNames = input.repos.map((r) => r.full_name);

  let parsed: ParsedCommit[];
  try {
    parsed = await fetchAllRepoCommitsForWorkday({
      token: input.token,
      repositoryFullNames: repoNames,
      since,
      until,
      githubUserId: input.githubUserId,
      githubLogin: input.githubLogin,
      enrichPulls: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'GitHub sync failed.';
    return { commits: [], error: message };
  }

  if (parsed.length === 0) {
    const existing = await fetchActivityCommits(input.supabase, input.workday);
    return existing;
  }

  const now = new Date().toISOString();
  const rows = parsed.map((c) => ({
    user_id: input.userId,
    workday: input.workday,
    repository_full_name: c.repository_full_name,
    sha: c.sha,
    message: c.message,
    committed_at: c.committed_at,
    html_url: c.html_url,
    author_login: c.author_login,
    pr_number: c.pr_number,
    pr_title: c.pr_title,
    pr_url: c.pr_url,
    pr_state: c.pr_state,
    synced_at: now,
  }));

  const { error: upsertError } = await input.supabase
    .from('activity_commits')
    .upsert(rows, { onConflict: 'user_id,sha' });

  if (upsertError) {
    return { commits: [], error: upsertError.message };
  }

  return fetchActivityCommits(input.supabase, input.workday);
}
