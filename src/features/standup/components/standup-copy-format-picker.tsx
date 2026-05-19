import { Text } from '@/components/ui/text';
import {
  COPY_FORMAT_LABELS,
  COPY_FORMATS,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type StandupCopyFormatPickerProps = {
  value: CopyFormat;
  onChange: (format: CopyFormat) => void;
};

export function StandupCopyFormatPicker({
  value,
  onChange,
}: StandupCopyFormatPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {COPY_FORMATS.map((format) => {
        const selected = format === value;
        return (
          <Pressable
            key={format}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Copy format ${COPY_FORMAT_LABELS[format]}`}
            onPress={() => onChange(format)}
            className={
              selected
                ? 'bg-primary rounded-full px-3 py-1.5'
                : 'border-border bg-muted/40 rounded-full border px-3 py-1.5'
            }
          >
            <Text
              className={
                selected
                  ? 'text-primary-foreground text-sm font-medium'
                  : 'text-foreground text-sm'
              }
            >
              {COPY_FORMAT_LABELS[format]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
