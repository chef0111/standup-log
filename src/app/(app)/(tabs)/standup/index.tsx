import { Text } from '@/components/ui/text';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { FREE_TIER_WORKDAY_HISTORY_DAYS } from '@/features/entitlements/lib/entitlements';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { StandupDraftSection } from '@/features/standup/components/standup-draft-section';
import { StandupNoteEditor } from '@/features/standup/components/standup-note-editor';
import { StandupOfflineBanner } from '@/features/standup/components/standup-offline-banner';
import { StandupSourcesSection } from '@/features/standup/components/standup-sources-section';
import { StandupStickyActions } from '@/features/standup/components/standup-sticky-actions';
import { WorkdayDatePicker } from '@/features/standup/components/workday/workday-date-picker';
import {
  StandupProvider,
  useStandup,
} from '@/features/standup/context/standup';
import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import { parseWorkdayParam } from '@/features/standup/lib/workday/workday';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

function StandupHero() {
  const { workday, pickerBounds, isPro, onWorkdayChange } = useStandup();
  const { displayName, avatarUrl } = useProfileHeader();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  return (
    <>
      <ScreenHeader
        eyebrow="Standup"
        title={formatWorkdayHeading(workday)}
        subtitle="Draft first, then pull from activity and notes."
        showThemeToggle={false}
        trailing={
          <View className="items-end gap-2">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              size="sm"
            />
            <WorkdayDatePicker
              key={workday}
              workday={workday}
              bounds={pickerBounds}
              onWorkdayChange={onWorkdayChange}
            />
          </View>
        }
      >
        {!isPro ? (
          <Text className="text-muted-foreground text-xs leading-relaxed">
            Free: last {FREE_TIER_WORKDAY_HISTORY_DAYS} days.{' '}
            <Text
              className="text-foreground text-xs underline"
              onPress={() => setUpgradeOpen(true)}
            >
              Upgrade to Pro
            </Text>
          </Text>
        ) : null}
      </ScreenHeader>
      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="history"
      />
    </>
  );
}

function StandupScreenContent() {
  return (
    <>
      <AppScreenShell
        header={<StandupHero />}
        footer={<StandupStickyActions />}
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
  const { workday: workdayParam } = useLocalSearchParams<{
    workday?: string;
  }>();
  const initialWorkday = parseWorkdayParam(workdayParam);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Generate standup',
          headerShown: false,
        }}
      />
      <StandupProvider initialWorkday={initialWorkday}>
        <StandupScreenContent />
      </StandupProvider>
    </>
  );
}
