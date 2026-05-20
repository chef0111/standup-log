import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Switch, View } from 'react-native';

type ReminderSectionProps = {
  enabled: boolean;
  time: Date;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: Date) => void;
};

export function ReminderSection({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: ReminderSectionProps) {
  return (
    <View className="border-border gap-3 rounded-lg border p-4">
      <Text className="text-foreground text-sm font-medium">
        Morning reminder
      </Text>
      <Text
        selectable
        className="text-muted-foreground text-xs leading-relaxed"
      >
        Reminds you at the chosen time if yesterday&apos;s standup was not
        copied.
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm">Enabled</Text>
        <Switch value={enabled} onValueChange={onEnabledChange} />
      </View>
      <DateTimePicker
        value={time}
        mode="time"
        onChange={(_, date) => {
          if (date) {
            onTimeChange(date);
          }
        }}
      />
    </View>
  );
}
