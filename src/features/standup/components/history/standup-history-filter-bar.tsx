import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { WorkdayDatePicker } from '@/features/standup/components/workday/workday-date-picker';
import {
  createDefaultHistoryFilter,
  getPresetHistoryDateRange,
  isHistoryFilterActive,
  normalizeHistoryDateRange,
  type HistoryFilterPreset,
  type StandupHistoryFilterState,
} from '@/features/standup/lib/history/filter-standup-history';
import { clampWorkdayToBounds } from '@/features/standup/lib/workday/workday';
import type { WorkdayPickerBounds } from '@/features/standup/lib/workday/workday';
import type { Workday } from '@/features/standup/types/workday';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';

const PRESETS: { id: HistoryFilterPreset; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All' },
];

type StandupHistoryFilterBarProps = {
  filter: StandupHistoryFilterState;
  pickerBounds: WorkdayPickerBounds;
  onFilterChange: (filter: StandupHistoryFilterState) => void;
};

export function StandupHistoryFilterBar({
  filter,
  pickerBounds,
  onFilterChange,
}: StandupHistoryFilterBarProps) {
  const applyPreset = React.useCallback(
    (preset: HistoryFilterPreset) => {
      const range = getPresetHistoryDateRange(preset, pickerBounds);
      onFilterChange({
        ...filter,
        preset,
        fromWorkday: range.fromWorkday,
        toWorkday: range.toWorkday,
      });
    },
    [filter, onFilterChange, pickerBounds]
  );

  const onFromChange = React.useCallback(
    (fromWorkday: Workday) => {
      const clamped = clampWorkdayToBounds(fromWorkday, pickerBounds);
      const { fromWorkday: from, toWorkday: to } = normalizeHistoryDateRange(
        clamped,
        filter.toWorkday
      );
      onFilterChange({
        ...filter,
        preset: null,
        fromWorkday: from,
        toWorkday: to,
      });
    },
    [filter, onFilterChange, pickerBounds]
  );

  const onToChange = React.useCallback(
    (toWorkday: Workday) => {
      const clamped = clampWorkdayToBounds(toWorkday, pickerBounds);
      const { fromWorkday: from, toWorkday: to } = normalizeHistoryDateRange(
        filter.fromWorkday,
        clamped
      );
      onFilterChange({
        ...filter,
        preset: null,
        fromWorkday: from,
        toWorkday: to,
      });
    },
    [filter, onFilterChange, pickerBounds]
  );

  const onClear = React.useCallback(() => {
    onFilterChange(createDefaultHistoryFilter(pickerBounds));
  }, [onFilterChange, pickerBounds]);

  const showClear = isHistoryFilterActive(filter, pickerBounds);

  return (
    <View className="gap-3 pb-3">
      <View className="relative">
        <View className="pointer-events-none absolute left-3 top-0 z-10 h-full justify-center">
          <Icon as={Search} size={18} className="text-muted-foreground" />
        </View>
        <TextInput
          value={filter.query}
          onChangeText={(query) => {
            onFilterChange({ ...filter, query });
          }}
          placeholder="Search standups…"
          placeholderTextColor={Platform.OS === 'ios' ? '#737373' : '#888'}
          accessibilityLabel="Search standups"
          className="bg-muted/40 text-foreground rounded-2xl py-2.5 pl-10 pr-3 text-sm"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {PRESETS.map(({ id, label }) => (
          <Button
            key={id}
            variant={filter.preset === id ? 'charcoal' : 'outline'}
            size="pill"
            onPress={() => {
              applyPreset(id);
            }}
          >
            <Text>{label}</Text>
          </Button>
        ))}
      </ScrollView>

      <View className="flex-row flex-wrap items-center gap-2">
        <View className="gap-1">
          <Text className="text-muted-foreground text-xs">From</Text>
          <WorkdayDatePicker
            workday={filter.fromWorkday}
            bounds={pickerBounds}
            onWorkdayChange={onFromChange}
          />
        </View>
        <View className="gap-1">
          <Text className="text-muted-foreground text-xs">To</Text>
          <WorkdayDatePicker
            workday={filter.toWorkday}
            bounds={pickerBounds}
            onWorkdayChange={onToChange}
          />
        </View>
        {showClear ? (
          <Button variant="ghost" size="pill" onPress={onClear}>
            <Text>Clear filters</Text>
          </Button>
        ) : null}
      </View>
    </View>
  );
}
