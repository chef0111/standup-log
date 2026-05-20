import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { UpgradeSheet } from '@/features/entitlements';
import { deleteAccount } from '@/features/account/lib/delete-account';
import { fetchUserProfile } from '@/features/profile';
import { updateDefaultCopyFormat } from '@/features/profile/lib/update-default-copy-format';
import { scheduleStandupReminder } from '@/features/reminders';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import {
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { ScreenHeaderActions, useTabBarScrollPadding } from '@/features/shell';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, Switch, View } from 'react-native';

function parseReminderTime(timeLocal: string): Date {
  const [hours, minutes] = timeLocal.split(':').map(Number);
  const d = new Date();
  d.setHours(
    Number.isFinite(hours) ? hours : 9,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  );
  return d;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState(() =>
    parseReminderTime('09:00:00')
  );
  const [defaultCopyFormat, setDefaultCopyFormat] =
    React.useState<CopyFormat>('plain');
  const tabBarPadding = useTabBarScrollPadding();

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }
    void fetchUserProfile(supabase, session).then(({ profile }) => {
      if (!profile) {
        return;
      }
      setReminderEnabled(profile.reminder_enabled ?? true);
      setReminderTime(
        parseReminderTime(profile.reminder_time_local ?? '09:00:00')
      );
      setDefaultCopyFormat(normalizeCopyFormat(profile.default_copy_format));
    });
  }, [session, supabase]);

  const onCopyFormatChange = (format: CopyFormat) => {
    if (!supabase || !session) {
      return;
    }
    setDefaultCopyFormat(format);
    void updateDefaultCopyFormat(supabase, session.user.id, format);
  };

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

  const onDisconnectGitHub = React.useCallback(() => {
    if (!supabase || !session) {
      return;
    }
    Alert.alert(
      'Disconnect GitHub',
      'StandupLog uses read-only GitHub access for selected repositories. Disconnecting clears your repo selection; sign in again to sync activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await supabase
                .from('profiles')
                .update({ selected_repositories: [] })
                .eq('id', session.user.id);
              await onSignOut();
            })();
          },
        },
      ]
    );
  }, [onSignOut, session, supabase]);

  const onDeleteAccount = React.useCallback(() => {
    if (!supabase || !session) {
      return;
    }
    Alert.alert(
      'Delete account',
      'This permanently deletes your standups, notes, activity metadata, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              const { error } = await deleteAccount(supabase);
              setBusy(false);
              if (error) {
                Alert.alert('Delete failed', error);
                return;
              }
              await onSignOut();
            })();
          },
        },
      ]
    );
  }, [onSignOut, session, supabase]);

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
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Button onPress={() => router.push('/settings/repositories')}>
          <Text>Manage repositories</Text>
        </Button>

        <Button variant="outline" onPress={() => router.push('/settings/privacy')}>
          <Text>Privacy</Text>
        </Button>

        <Button variant="outline" onPress={() => setUpgradeOpen(true)}>
          <Text>Upgrade to Pro</Text>
        </Button>

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
          <CopyFormatPicker
            value={defaultCopyFormat}
            onChange={onCopyFormatChange}
          />
        </View>

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

        <Button
          variant="outline"
          disabled={busy}
          onPress={() => void onDisconnectGitHub()}
        >
          <Text>Disconnect GitHub</Text>
        </Button>

        <Button
          variant="outline"
          disabled={busy}
          onPress={() => void onSignOut()}
        >
          <Text>Sign out</Text>
        </Button>

        <Button variant="outline" disabled={busy} onPress={onDeleteAccount}>
          <Text className="text-destructive">Delete account</Text>
        </Button>
      </ScrollView>

      <UpgradeSheet open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
