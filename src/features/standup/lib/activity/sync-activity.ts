import type { SelectedRepository } from '@/features/repositories/types/repository';
import {
  fetchAllRepoCommitsForWorkday,
  type ParsedCommit,
} from '@/features/standup/lib/activity/github-commits';
import { isGithubRateLimitError } from '@/features/standup/lib/activity/github-rate-limit';
import { workdayUtcBounds } from '@/features/standup/lib/workday/workday';
import {
  ACTIVITY_COMMIT_COLUMNS,
  type ActivityCommitRow,
} from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';
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

async function replaceWorkdayCommits(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
  rows: ParsedCommit[]
): Promise<{ error: string | null }> {
  const incomingShas = rows.map((row) => row.sha);

  if (incomingShas.length === 0) {
    const { error } = await supabase
      .from('activity_commits')
      .delete()
      .eq('user_id', userId)
      .eq('workday', workday);
    return { error: error?.message ?? null };
  }

  const { data: existing, error: selectError } = await supabase
    .from('activity_commits')
    .select('sha, work_type')
    .eq('user_id', userId)
    .eq('workday', workday);

  if (selectError) {
    return { error: selectError.message };
  }

  const staleShas = (existing ?? [])
    .map((row) => row.sha as string)
    .filter((sha) => !incomingShas.includes(sha));

  if (staleShas.length > 0) {
    const { error: deleteError } = await supabase
      .from('activity_commits')
      .delete()
      .eq('user_id', userId)
      .eq('workday', workday)
      .in('sha', staleShas);

    if (deleteError) {
      return { error: deleteError.message };
    }
  }

  const storedWorkTypeBySha = new Map(
    (existing ?? []).map((row) => [
      row.sha as string,
      row.work_type as string | null,
    ])
  );

  const now = new Date().toISOString();
  const upsertRows = rows.map((c) => ({
    user_id: userId,
    workday,
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
    pr_merged_at: c.pr_merged_at,
    signal_disposition: c.signal_disposition,
    work_type: c.work_type ?? storedWorkTypeBySha.get(c.sha) ?? null,
    synced_at: now,
  }));

  const { error: upsertError } = await supabase
    .from('activity_commits')
    .upsert(upsertRows, { onConflict: 'user_id,sha' });

  return { error: upsertError?.message ?? null };
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
}): Promise<{
  commits: ActivityCommitRow[];
  error: string | null;
  rateLimitResetAt?: number | null;
}> {
  const { since, until } = workdayUtcBounds(input.workday, input.timeZone);
  const repoNames = input.repos.map((r) => r.full_name);

  let parsed: ParsedCommit[];
  try {
    parsed = await fetchAllRepoCommitsForWorkday({
      token: input.token,
      repositoryFullNames: repoNames,
      since,
      until,
      workday: input.workday,
      githubUserId: input.githubUserId,
      githubLogin: input.githubLogin,
      enrichPulls: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'GitHub sync failed.';
    return {
      commits: [],
      error: message,
      rateLimitResetAt: isGithubRateLimitError(e) ? e.resetAt : null,
    };
  }

  const { error: replaceError } = await replaceWorkdayCommits(
    input.supabase,
    input.userId,
    input.workday,
    parsed
  );

  if (replaceError) {
    return { commits: [], error: replaceError };
  }

  return fetchActivityCommits(input.supabase, input.workday);
}
