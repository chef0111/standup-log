import { Text } from '@/components/ui/text';
import {
  COPY_FORMAT_OPTIONS,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

type CopyFormatPickerProps = {
  value: CopyFormat;
  onChange: (format: CopyFormat) => void;
  disabled?: boolean;
  className?: string;
};

export function CopyFormatPicker({
  value,
  onChange,
  disabled = false,
  className,
}: CopyFormatPickerProps) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {COPY_FORMAT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            className={cn(
              'min-h-10 items-center justify-center rounded-full px-4 py-2',
              selected ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-muted/60',
              disabled && 'opacity-50'
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                selected
                  ? 'text-white dark:text-zinc-900'
                  : 'text-foreground'
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
