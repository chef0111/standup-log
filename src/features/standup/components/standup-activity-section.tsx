import { ActivityTerminal } from '@/features/activity';
import { signInWithGitHub } from '@/features/auth';
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
    refreshActivity,
  } = useStandup();

  return (
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
      onManageRepos={() => router.push('/(app)/settings')}
    />
  );
}
