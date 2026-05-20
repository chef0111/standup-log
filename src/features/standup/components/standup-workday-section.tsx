import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { FREE_TIER_WORKDAY_HISTORY_DAYS } from '@/features/entitlements/lib/entitlements';
import { WorkdayDatePicker } from '@/features/standup/components/workday/workday-date-picker';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupWorkdaySection() {
  const { workday, pickerBounds, isPro, onWorkdayChange } = useStandup();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  return (
    <View className="relative gap-2">
      <Text className="text-muted-foreground text-xs uppercase tracking-wide">
        Workday
      </Text>
      <WorkdayDatePicker
        key={workday}
        workday={workday}
        bounds={pickerBounds}
        onWorkdayChange={onWorkdayChange}
      />
      {!isPro ? (
        <View className="flex flex-col gap-2">
          <Text
            selectable
            className="text-muted-foreground text-xs leading-relaxed"
          >
            Free accounts: last {FREE_TIER_WORKDAY_HISTORY_DAYS} days. Upgrade
            to Pro for full history.
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setUpgradeOpen(true)}
          >
            <Text>Upgrade to Pro</Text>
          </Button>
        </View>
      ) : null}
      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="history"
      />
    </View>
  );
}
