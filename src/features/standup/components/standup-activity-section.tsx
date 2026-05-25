import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { ActivityTerminal } from '@/features/standup/components/activity/activity-terminal';
import { WorkTypePickerSheet } from '@/features/standup/components/activity/work-type-picker-sheet';
import type { StoredWorkType } from '@/features/standup/lib/activity/stored-work-type';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useStandup } from '../context/standup';

export function StandupActivitySection() {
  const router = useRouter();
  const {
    workday,
    commits,
    loadingActivity,
    syncing,
    tokenLoading,
    token,
    activityError,
    rateLimitResetAt,
    refreshActivity,
    updateCommitWorkType,
  } = useStandup();

  const [editingCommit, setEditingCommit] =
    React.useState<ActivityCommitRow | null>(null);
  const [workTypeSaving, setWorkTypeSaving] = React.useState(false);
  const [workTypeError, setWorkTypeError] = React.useState<string | null>(null);

  const handleSaveWorkType = async (workType: StoredWorkType) => {
    const commit = editingCommit;
    if (!commit) {
      return;
    }

    setWorkTypeSaving(true);
    setWorkTypeError(null);
    setEditingCommit(null);

    const { error } = await updateCommitWorkType(commit.id, workType);
    setWorkTypeSaving(false);

    if (error) {
      setEditingCommit(commit);
      setWorkTypeError(error);
    }
  };

  return (
    <>
      <ActivityTerminal
        workday={workday}
        commits={commits}
        loading={loadingActivity}
        syncing={syncing}
        tokenLoading={tokenLoading}
        hasToken={Boolean(token)}
        error={activityError}
        rateLimitResetAt={rateLimitResetAt}
        emptyMessage="No commits for this Workday yet. Refresh to pull feature-branch work, or add a manual note."
        onRefresh={refreshActivity}
        onReconnect={() => void signInWithGitHub()}
        onManageRepos={() => router.push('/settings/repositories')}
        onEditWorkType={setEditingCommit}
      />

      <WorkTypePickerSheet
        open={editingCommit != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCommit(null);
            setWorkTypeError(null);
          }
        }}
        commit={editingCommit}
        saving={workTypeSaving}
        error={workTypeError}
        onSave={handleSaveWorkType}
      />
    </>
  );
}
