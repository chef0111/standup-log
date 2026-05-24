import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import {
  AppScreenShell,
  ScreenHero,
} from '@/features/shell/components/app-screen-shell';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { WeeklySummaryView } from '@/features/standup/components/weekly/weekly-summary-view';
import { getCurrentWeekBounds } from '@/features/standup/lib/weekly/week-bounds';
import { track } from '@/lib/analytics';
import { Stack, useFocusEffect } from 'expo-router';
import * as React from 'react';

function formatWeekHeroLabel(weekStart: string, weekEnd: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(y, m - 1, d));
  };
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

export default function WeeklyScreen() {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const tabBarPadding = useTabBarScrollPadding();
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);

  useFocusEffect(
    React.useCallback(() => {
      track('weekly_summary_viewed');
    }, [])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Weekly', headerShown: false }} />
      <AppScreenShell
        hero={
          <ScreenHero
            eyebrow="Weekly summary"
            title={formatWeekHeroLabel(bounds.weekStart, bounds.weekEnd)}
            subtitle="Activity grouped by Work Type for the current week."
          />
        }
        scrollProps={{
          contentContainerStyle: { paddingBottom: tabBarPadding },
        }}
      >
        <WeeklySummaryView onUpgrade={() => setUpgradeOpen(true)} />
      </AppScreenShell>

      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="weekly"
      />
    </>
  );
}
