import { ScreenHeaderActions } from '@/features/shell';
import {
  StandupActivitySection,
  StandupDraftSection,
  StandupNoteEditor,
  StandupNotesSection,
  StandupOfflineBanner,
  StandupProvider,
  StandupWorkdaySection,
} from '@/features/standup';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

function StandupScreenContent() {
  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-4 pt-2"
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
