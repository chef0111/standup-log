import { Text } from '@/components/ui/text';
import { UpgradeSheet } from '@/features/entitlements';
import { ScreenHeaderActions } from '@/features/shell';
import { WeeklySummaryView } from '@/features/standup/components/weekly-summary-view';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function WeeklyScreen() {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Weekly',
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg flex-grow gap-4 px-5 pb-8 pt-2"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-2">
          <Text variant="h3" className="border-0 pb-0">
            Weekly Summary
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            Activity grouped by Work Type for the current week.
          </Text>
        </View>

        <WeeklySummaryView onUpgrade={() => setUpgradeOpen(true)} />
      </ScrollView>

      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="weekly"
      />
    </>
  );
}
