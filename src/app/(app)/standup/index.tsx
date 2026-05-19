import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScreenFooter } from '@/features/shell';
import {
  StandupActivitySection,
  StandupDraftSection,
  StandupNoteEditor,
  StandupNotesSection,
  StandupOfflineBanner,
  StandupProvider,
  StandupWorkdaySection,
} from '@/features/standup';
import { useSafeRouterBack } from '@/hooks/use-safe-router-back';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

function StandupScreenContent() {
  const goBack = useSafeRouterBack('/(app)');

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-4 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <StandupWorkdaySection />
        <StandupOfflineBanner />
        <StandupActivitySection />
        <StandupNotesSection />
        <StandupDraftSection />
      </ScrollView>

      <ScreenFooter className="mx-auto w-full max-w-lg">
        <Button variant="outline" onPress={goBack}>
          <Text>Back</Text>
        </Button>
      </ScreenFooter>

      <StandupNoteEditor />
    </View>
  );
}

export default function StandupScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Generate standup' }} />
      <StandupProvider>
        <StandupScreenContent />
      </StandupProvider>
    </>
  );
}
