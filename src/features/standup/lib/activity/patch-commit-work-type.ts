import type { StoredWorkType } from '@/features/standup/lib/activity/stored-work-type';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';

export function patchCommitWorkTypeInList(
  commits: ActivityCommitRow[],
  commitId: string,
  workType: StoredWorkType
): ActivityCommitRow[] {
  return commits.map((commit) =>
    commit.id === commitId ? { ...commit, work_type: workType } : commit
  );
}
