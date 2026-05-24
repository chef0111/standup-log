import { Text } from '@/components/ui/text';
import { SettingsSection } from '@/features/settings/components/settings-section';
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
    <SettingsSection
      title="Morning reminder"
      description="Reminds you at the chosen time if yesterday's standup was not copied."
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm">Enabled</Text>
        <Switch value={enabled} onValueChange={onEnabledChange} />
      </View>
      {enabled ? (
        <DateTimePicker
          value={time}
          mode="time"
          onChange={(_, date) => {
            if (date) {
              onTimeChange(date);
            }
          }}
        />
      ) : null}
    </SettingsSection>
  );
}
