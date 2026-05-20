import { Text } from '@/components/ui/text';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { WeeklySummaryView } from '@/features/standup/components/weekly/weekly-summary-view';
import { track } from '@/lib/analytics';
import { Stack, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function WeeklyScreen() {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const tabBarPadding = useTabBarScrollPadding();

  useFocusEffect(
    React.useCallback(() => {
      track('weekly_summary_viewed');
    }, [])
  );

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
        contentContainerClassName="mx-auto w-full max-w-lg flex-grow gap-4 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-2">
          <Text variant="h3" className="border-0 pb-0">
            Weekly Summary
          </Text>
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
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
