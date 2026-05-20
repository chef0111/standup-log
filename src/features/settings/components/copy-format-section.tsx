import { Text } from '@/components/ui/text';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import { View } from 'react-native';

type CopyFormatSectionProps = {
  value: CopyFormat;
  onChange: (format: CopyFormat) => void;
};

export function CopyFormatSection({ value, onChange }: CopyFormatSectionProps) {
  return (
    <View className="border-border gap-3 rounded-lg border p-4">
      <Text className="text-foreground text-sm font-medium">
        Default copy format
      </Text>
      <Text
        selectable
        className="text-muted-foreground text-xs leading-relaxed"
      >
        Used when you copy a standup unless you pick another format on the
        Generate or Read screen.
      </Text>
      <CopyFormatPicker value={value} onChange={onChange} />
    </View>
  );
}
