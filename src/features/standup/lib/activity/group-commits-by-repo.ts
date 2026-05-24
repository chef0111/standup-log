import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';

export type RepoCommitGroup = {
  repositoryFullName: string;
  commits: ActivityCommitRow[];
};

/** Preserves first-seen repo order (typically chronological commit order). */
export function groupCommitsByRepo(
  commits: ActivityCommitRow[]
): RepoCommitGroup[] {
  const order: string[] = [];
  const byRepo = new Map<string, ActivityCommitRow[]>();

  for (const commit of commits) {
    const repo = commit.repository_full_name;
    let group = byRepo.get(repo);
    if (!group) {
      group = [];
      byRepo.set(repo, group);
      order.push(repo);
    }
    group.push(commit);
  }

  return order.map((repositoryFullName) => ({
    repositoryFullName,
    commits: byRepo.get(repositoryFullName) ?? [],
  }));
}
