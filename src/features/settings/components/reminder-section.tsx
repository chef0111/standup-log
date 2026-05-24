import { Text } from '@/components/ui/text';
import { SettingsSection } from '@/features/settings/components/settings-section';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as React from 'react';
import { Platform, Pressable, Switch, View } from 'react-native';

const reminderTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

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
  const [showAndroidPicker, setShowAndroidPicker] = React.useState(false);
  const timeLabel = reminderTimeFormatter.format(time);

  const onPickerChange = React.useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowAndroidPicker(false);
        if (event.type !== 'set' || !date) {
          return;
        }
      } else if (!date) {
        return;
      }

      onTimeChange(date);
    },
    [onTimeChange]
  );

  return (
    <SettingsSection
      title="Morning reminder"
      description="Reminds you at the chosen time if yesterday's standup was not copied."
    >
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-sm">Enabled</Text>
          <Switch value={enabled} onValueChange={onEnabledChange} />
        </View>
        {enabled ? (
          Platform.OS === 'ios' ? (
            <DateTimePicker
              value={time}
              mode="time"
              display="compact"
              onChange={onPickerChange}
            />
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reminder time, ${timeLabel}`}
                onPress={() => setShowAndroidPicker(true)}
                className="bg-muted/50 active:bg-muted/70 rounded-2xl px-4 py-3"
              >
                <Text className="text-foreground text-sm font-medium">
                  {timeLabel}
                </Text>
              </Pressable>
              {showAndroidPicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  onChange={onPickerChange}
                />
              )}
            </>
          )
        ) : null}
      </View>
    </SettingsSection>
  );
}
