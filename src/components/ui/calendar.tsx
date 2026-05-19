import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  addCalendarMonths,
  canNavigateToMonth,
  chunkCalendarWeeks,
  formatCalendarMonthLabel,
  getCalendarDayCells,
  getWeekdayLabels,
  isWorkdayInRange,
  workdayToCalendarMonth,
  type CalendarDayCell,
  type CalendarMonth,
} from '@/features/workday/lib/calendar-grid';
import { formatWorkdayLocal } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type CalendarProps = {
  selected: Workday;
  onSelect: (workday: Workday) => void;
  fromDate: Workday;
  toDate: Workday;
  className?: string;
};

function CalendarDay({
  cell,
  selected,
  today,
  fromDate,
  toDate,
  onSelect,
}: {
  cell: CalendarDayCell;
  selected: Workday;
  today: Workday;
  fromDate: Workday;
  toDate: Workday;
  onSelect: (workday: Workday) => void;
}) {
  if (!cell.day || !cell.workday) {
    return <View className="h-9 flex-1" />;
  }

  const isSelected = cell.workday === selected;
  const isToday = cell.workday === today;
  const isDisabled = !isWorkdayInRange(cell.workday, fromDate, toDate);

  return (
    <View className="h-9 flex-1 items-center justify-center p-0.5">
      <Pressable
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
        accessibilityLabel={cell.workday}
        className={cn(
          'h-8 w-8 items-center justify-center rounded-md',
          isSelected && 'bg-primary',
          !isSelected && isToday && 'bg-accent',
          !isSelected && !isDisabled && 'active:bg-accent',
          isDisabled && 'opacity-40'
        )}
        onPress={() => onSelect(cell.workday!)}
      >
        <Text
          selectable
          className={cn(
            'text-sm tabular-nums',
            isSelected && 'text-primary-foreground font-medium',
            !isSelected && isDisabled && 'text-muted-foreground',
            !isSelected && !isDisabled && 'text-foreground'
          )}
        >
          {cell.day}
        </Text>
      </Pressable>
    </View>
  );
}

function Calendar({
  selected,
  onSelect,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const [viewMonth, setViewMonth] = React.useState<CalendarMonth>(() =>
    workdayToCalendarMonth(selected)
  );

  React.useEffect(() => {
    setViewMonth(workdayToCalendarMonth(selected));
  }, [selected]);

  const weeks = chunkCalendarWeeks(getCalendarDayCells(viewMonth));
  const today = formatWorkdayLocal(new Date());
  const canGoPrevious = canNavigateToMonth(
    addCalendarMonths(viewMonth, -1),
    fromDate,
    toDate
  );
  const canGoNext = canNavigateToMonth(
    addCalendarMonths(viewMonth, 1),
    fromDate,
    toDate
  );

  return (
    <View className={cn('w-70 gap-4', className)}>
      <View className="flex-row items-center justify-between px-1">
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoPrevious}
          accessibilityLabel="Previous month"
          onPress={() =>
            setViewMonth((current) => addCalendarMonths(current, -1))
          }
        >
          <Icon as={ChevronLeft} className="text-foreground" size={16} />
        </Button>
        <Text selectable className="text-sm font-medium">
          {formatCalendarMonthLabel(viewMonth)}
        </Text>
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoNext}
          accessibilityLabel="Next month"
          onPress={() =>
            setViewMonth((current) => addCalendarMonths(current, 1))
          }
        >
          <Icon as={ChevronRight} className="text-foreground" size={16} />
        </Button>
      </View>

      <View className="gap-1">
        <View className="flex-row">
          {getWeekdayLabels().map((label) => (
            <View
              key={label}
              className="h-9 flex-1 items-center justify-center"
            >
              <Text className="text-muted-foreground text-[0.8rem] font-normal">
                {label}
              </Text>
            </View>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row">
            {week.map((cell, dayIndex) => (
              <CalendarDay
                key={cell.workday ?? `empty-${weekIndex}-${dayIndex}`}
                cell={cell}
                selected={selected}
                today={today}
                fromDate={fromDate}
                toDate={toDate}
                onSelect={onSelect}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export { Calendar, type CalendarProps };
