import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { StandupHistoryFilterBar } from '@/features/standup/components/history/standup-history-filter-bar';
import { StandupHistoryList } from '@/features/standup/components/history/standup-history-list';
import { useStandupHistory } from '@/features/standup/hooks/use-standup-history';
import {
  createDefaultHistoryFilter,
  filterStandupHistoryItems,
  type StandupHistoryFilterState,
} from '@/features/standup/lib/history/filter-standup-history';
import type { Workday } from '@/features/standup/types/workday';
import { useThemeColor } from '@/hooks/use-theme-color';
import { track } from '@/lib/analytics';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function StandupHistoryScreen() {
  const router = useRouter();
  const { displayName, avatarUrl } = useProfileHeader();
  const { items, pickerBounds, isPro, loading, error } = useStandupHistory();
  const primary = useThemeColor('--color-primary');
  const [filter, setFilter] = React.useState<StandupHistoryFilterState | null>(
    null
  );
  const lastTrackedFilter = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (pickerBounds && filter === null) {
      setFilter(createDefaultHistoryFilter(pickerBounds));
    }
  }, [filter, pickerBounds]);

  useFocusEffect(
    React.useCallback(() => {
      track('standup_history_viewed');
    }, [])
  );

  const filteredItems = React.useMemo(() => {
    if (!filter) {
      return items;
    }
    return filterStandupHistoryItems(items, filter);
  }, [filter, items]);

  React.useEffect(() => {
    if (!filter) {
      return;
    }
    const key = `${filter.preset ?? 'custom'}:${filter.query.trim().length > 0}`;
    if (lastTrackedFilter.current === key) {
      return;
    }
    lastTrackedFilter.current = key;
    track('standup_history_filtered', {
      preset: filter.preset ?? 'custom',
      has_query: filter.query.trim().length > 0,
    });
  }, [filter]);

  const onItemPress = React.useCallback(
    (workday: Workday) => {
      router.push({ pathname: '/standup/read', params: { workday } });
    },
    [router]
  );

  const onClearFilters = React.useCallback(() => {
    if (!pickerBounds) {
      return;
    }
    setFilter(createDefaultHistoryFilter(pickerBounds));
  }, [pickerBounds]);

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
        ) : filter && pickerBounds ? (
          <View className="min-h-0 flex-1 gap-3">
            <StandupHistoryFilterBar
              filter={filter}
              pickerBounds={pickerBounds}
              onFilterChange={setFilter}
            />
            <View className="min-h-0 flex-1">
              <StandupHistoryList
                items={filteredItems}
                totalCount={items.length}
                onItemPress={onItemPress}
                onClearFilters={onClearFilters}
              />
            </View>
          </View>
        ) : null}
      </AppScreenShell>
    </>
  );
}
