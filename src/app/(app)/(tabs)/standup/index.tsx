import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { StandupActivitySection } from '@/features/standup/components/standup-activity-section';
import { StandupDraftSection } from '@/features/standup/components/standup-draft-section';
import { StandupNoteEditor } from '@/features/standup/components/standup-note-editor';
import { StandupNotesSection } from '@/features/standup/components/standup-notes-section';
import { StandupOfflineBanner } from '@/features/standup/components/standup-offline-banner';
import { StandupWorkdaySection } from '@/features/standup/components/standup-workday-section';
import { StandupProvider } from '@/features/standup/context/standup';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

function StandupScreenContent() {
  const tabBarPadding = useTabBarScrollPadding();

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <StandupWorkdaySection />
        <StandupOfflineBanner />
        <StandupActivitySection />
        <StandupNotesSection />
        <StandupDraftSection />
      </ScrollView>

      <StandupNoteEditor />
    </View>
  );
}

export default function StandupScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Generate standup',
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <StandupProvider>
        <StandupScreenContent />
      </StandupProvider>
    </>
  );
}
