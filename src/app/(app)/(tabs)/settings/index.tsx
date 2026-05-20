import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { UpgradeSheet } from '@/features/entitlements';
import { fetchUserProfile } from '@/features/profile';
import { scheduleStandupReminder } from '@/features/reminders';
import { ScreenHeaderActions } from '@/features/shell';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function parseReminderTime(timeLocal: string): Date {
  const [hours, minutes] = timeLocal.split(':').map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return d;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState(() => parseReminderTime('09:00:00'));

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }
    void fetchUserProfile(supabase, session).then(({ profile }) => {
      if (!profile) {
        return;
      }
      setReminderEnabled(profile.reminder_enabled ?? true);
      setReminderTime(parseReminderTime(profile.reminder_time_local ?? '09:00:00'));
    });
  }, [session, supabase]);

  const onSignOut = React.useCallback(async () => {
    if (!supabase) {
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (!error) {
      router.replace('/(public)/sign-in');
    }
  }, [router, supabase]);

  const persistReminder = async (enabled: boolean, time: Date) => {
    if (!supabase || !session) {
      return;
    }
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const reminderTimeLocal = `${hours}:${minutes}:00`;
    await supabase
      .from('profiles')
      .update({
        reminder_enabled: enabled,
        reminder_time_local: reminderTimeLocal,
      })
      .eq('id', session.user.id);
    void scheduleStandupReminder({
      supabase,
      userId: session.user.id,
      reminderEnabled: enabled,
      reminderTimeLocal,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-8 pt-2"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Button
          variant="outline"
          onPress={() => router.push('/settings/repositories')}
        >
          <Text>Manage repositories</Text>
        </Button>

        <Button variant="outline" onPress={() => setUpgradeOpen(true)}>
          <Text>Upgrade to Pro</Text>
        </Button>

        <View className="border-border gap-3 rounded-lg border p-4">
          <Text className="text-foreground text-sm font-medium">
            Morning reminder
          </Text>
          <Text selectable className="text-muted-foreground text-xs leading-relaxed">
            Reminds you at the chosen time if yesterday&apos;s standup was not
            copied.
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm">Enabled</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(value) => {
                setReminderEnabled(value);
                void persistReminder(value, reminderTime);
              }}
            />
          </View>
          <DateTimePicker
            value={reminderTime}
            mode="time"
            onChange={(_, date) => {
              if (!date) {
                return;
              }
              setReminderTime(date);
              void persistReminder(reminderEnabled, date);
            }}
          />
        </View>

        <Button variant="outline" disabled={busy} onPress={() => void onSignOut()}>
          <Text>Sign out</Text>
        </Button>
      </ScrollView>

      <UpgradeSheet open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
