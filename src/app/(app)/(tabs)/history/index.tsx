import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { StandupHistoryList } from '@/features/standup/components/history/standup-history-list';
import { useStandupHistory } from '@/features/standup/hooks/use-standup-history';
import type { Workday } from '@/features/standup/types/workday';
import { useThemeColor } from '@/hooks/use-theme-color';
import { track } from '@/lib/analytics';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function StandupHistoryScreen() {
  const router = useRouter();
  const { displayName, avatarUrl } = useProfileHeader();
  const { items, isPro, loading, error } = useStandupHistory();
  const primary = useThemeColor('--color-primary');

  useFocusEffect(
    React.useCallback(() => {
      track('standup_history_viewed');
    }, [])
  );

  const onItemPress = React.useCallback(
    (workday: Workday) => {
      router.push({ pathname: '/standup/read', params: { workday } });
    },
    [router]
  );

  const historySubtitle = isPro
    ? 'Full history of saved standups, newest first.'
    : 'Last 30 days of saved standups, newest first.';

  return (
    <>
      <Stack.Screen options={{ title: 'History', headerShown: false }} />
      <AppScreenShell
        header={
          <ScreenHeader
            eyebrow="Standup history"
            title="Past standups"
            subtitle={historySubtitle}
            showThemeToggle={false}
            trailing={
              <ProfileAvatar
                avatarUrl={avatarUrl}
                displayName={displayName}
                size="sm"
              />
            }
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : error ? (
          <View className="gap-4 p-4">
            <Text selectable className="text-destructive text-sm">
              {error}
            </Text>
            <Button
              variant="outline"
              size="pill"
              onPress={() => router.push('/standup')}
            >
              <Text>Generate standup</Text>
            </Button>
          </View>
        ) : (
          <StandupHistoryList items={items} onItemPress={onItemPress} />
        )}
      </AppScreenShell>
    </>
  );
}
