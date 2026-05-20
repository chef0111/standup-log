import { Calendar } from '@/components/ui/calendar';
import { Icon } from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import type { WorkdayDatePickerProps } from '@/features/standup/components/workday/workday-date-picker-props';
import { clampWorkdayToBounds } from '@/features/standup/lib/workday/workday';
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@rn-primitives/popover';
import { CalendarDays } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';

export type { WorkdayDatePickerProps };

export function WorkdayDatePicker({
  workday,
  bounds,
  onWorkdayChange,
}: WorkdayDatePickerProps) {
  const triggerRef =
    React.useRef<React.ComponentRef<typeof PopoverPrimitive.Trigger>>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen}>
      <PopoverTrigger ref={triggerRef} asChild>
        <Pressable
          className={cn(
            'border-border flex-row items-center gap-2 rounded-md border px-3 py-2',
            open && 'border-ring ring-ring/50 ring-[3px]'
          )}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`Workday ${workday}`}
        >
          <Icon as={CalendarDays} className="text-foreground" size={18} />
          <Text className="text-foreground text-sm font-medium">{workday}</Text>
        </Pressable>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="center" side="bottom">
        <Calendar
          selected={workday}
          fromDate={bounds.minimumWorkday}
          toDate={bounds.maximumWorkday}
          onSelect={(nextWorkday) => {
            onWorkdayChange(clampWorkdayToBounds(nextWorkday, bounds));
            triggerRef.current?.close();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
