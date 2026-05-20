import { Text } from '@/components/ui/text';
import {
  FREE_TIER_WORKDAY_HISTORY_DAYS,
  WorkdayDatePicker,
} from '@/features/workday';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupWorkdaySection() {
  const { workday, pickerBounds, isPro, onWorkdayChange } = useStandup();

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
        <Text className="text-muted-foreground text-xs leading-relaxed">
          Free accounts: last {FREE_TIER_WORKDAY_HISTORY_DAYS} days. Upgrade to
          Pro for full history.
        </Text>
      ) : null}
    </View>
  );
}
