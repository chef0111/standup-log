import { Text } from '@/components/ui/text';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { FREE_TIER_WORKDAY_HISTORY_DAYS } from '@/features/entitlements/lib/entitlements';
import {
  AppScreenShell,
  ScreenHero,
} from '@/features/shell/components/app-screen-shell';
import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { StandupDraftSection } from '@/features/standup/components/standup-draft-section';
import { StandupNoteEditor } from '@/features/standup/components/standup-note-editor';
import { StandupOfflineBanner } from '@/features/standup/components/standup-offline-banner';
import { StandupSourcesSection } from '@/features/standup/components/standup-sources-section';
import { StandupStickyActions } from '@/features/standup/components/standup-sticky-actions';
import { WorkdayDatePicker } from '@/features/standup/components/workday/workday-date-picker';
import { StandupProvider, useStandup } from '@/features/standup/context/standup';
import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import { Stack } from 'expo-router';
import * as React from 'react';

function StandupHero() {
  const { workday, pickerBounds, isPro, onWorkdayChange } = useStandup();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  return (
    <>
      <ScreenHero
        eyebrow="Standup"
        title={formatWorkdayHeading(workday)}
        subtitle="Draft first, then pull from activity and notes."
        trailing={
          <WorkdayDatePicker
            key={workday}
            workday={workday}
            bounds={pickerBounds}
            onWorkdayChange={onWorkdayChange}
            tone="hero"
          />
        }
      >
        {!isPro ? (
          <Text className="text-xs leading-relaxed text-white/60">
            Free: last {FREE_TIER_WORKDAY_HISTORY_DAYS} days.{' '}
            <Text
              className="text-xs text-white underline"
              onPress={() => setUpgradeOpen(true)}
            >
              Upgrade to Pro
            </Text>
          </Text>
        ) : null}
      </ScreenHero>
      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="history"
      />
    </>
  );
}

function StandupScreenContent() {
  const tabBarPadding = useTabBarScrollPadding();

  return (
    <>
      <AppScreenShell
        hero={<StandupHero />}
        footer={<StandupStickyActions />}
        scrollProps={{
          contentContainerStyle: { paddingBottom: tabBarPadding + 24 },
        }}
      >
        <StandupOfflineBanner />
        <StandupDraftSection />
        <StandupSourcesSection />
      </AppScreenShell>
      <StandupNoteEditor />
    </>
  );
}

export default function StandupScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Generate standup',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <StandupProvider>
        <StandupScreenContent />
      </StandupProvider>
    </>
  );
}
