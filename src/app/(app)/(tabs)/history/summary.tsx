import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
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

export default function WeeklySummaryScreen() {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const { displayName, avatarUrl } = useProfileHeader();
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);

  useFocusEffect(
    React.useCallback(() => {
      track('weekly_summary_viewed');
    }, [])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Weekly summary', headerShown: false }} />
      <AppScreenShell
        header={
          <ScreenHeader
            eyebrow="Weekly summary"
            title={formatWeekHeroLabel(bounds.weekStart, bounds.weekEnd)}
            subtitle="Activity grouped by Work Type for the current week."
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
