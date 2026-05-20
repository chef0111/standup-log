import { ActivityTerminal } from '@/features/activity';
import { WorkTypePickerSheet } from '@/features/activity/components/work-type-picker-sheet';
import { updateActivityCommitWorkType } from '@/features/activity/lib/update-activity-commit-work-type';
import type {
  ActivityCommitRow,
  StoredWorkType,
} from '@/features/activity/types/activity-commit';
import { signInWithGitHub, useAuth } from '@/features/auth';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useStandup } from '../context/standup';

export function StandupActivitySection() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const {
    workday,
    commits,
    loadingActivity,
    syncing,
    tokenLoading,
    token,
    activityError,
    refreshActivity,
  } = useStandup();

  const [editingCommit, setEditingCommit] =
    React.useState<ActivityCommitRow | null>(null);
  const [workTypeSaving, setWorkTypeSaving] = React.useState(false);
  const [workTypeError, setWorkTypeError] = React.useState<string | null>(null);

  const handleSaveWorkType = async (workType: StoredWorkType) => {
    if (!supabase || !session || !editingCommit) {
      return;
    }
    setWorkTypeSaving(true);
    setWorkTypeError(null);
    const { error } = await updateActivityCommitWorkType(
      supabase,
      session.user.id,
      editingCommit.id,
      workType
    );
    setWorkTypeSaving(false);
    if (error) {
      setWorkTypeError(error);
      return;
    }
    setEditingCommit(null);
    refreshActivity();
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
