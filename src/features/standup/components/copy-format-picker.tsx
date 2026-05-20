import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  COPY_FORMAT_OPTIONS,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

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
          <Button
            key={option.value}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            onPress={() => onChange(option.value)}
          >
            <Text className={selected ? 'text-primary-foreground' : undefined}>
              {option.label}
            </Text>
          </Button>
        );
      })}
    </View>
  );
}
