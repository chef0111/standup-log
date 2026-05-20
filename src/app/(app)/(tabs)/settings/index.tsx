import { useAuth } from '@/context/auth';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { updateDefaultCopyFormat } from '@/features/profile/lib/update-default-copy-format';
import { AccountActionsSection } from '@/features/settings/components/account-actions-section';
import { CopyFormatSection } from '@/features/settings/components/copy-format-section';
import { ReminderSection } from '@/features/settings/components/reminder-section';
import { SettingsLinksSection } from '@/features/settings/components/settings-links-section';
import { deleteAccount } from '@/features/settings/lib/delete-account';
import { parseReminderTime } from '@/features/settings/lib/reminder-eligibility';
import { scheduleStandupReminder } from '@/features/settings/lib/schedule-standup-reminder';
import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import {
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, ScrollView } from 'react-native';

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

  const persistReminder = React.useCallback(
    async (enabled: boolean, time: Date) => {
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
    },
    [session, supabase]
  );

  const onReminderEnabledChange = React.useCallback(
    (enabled: boolean) => {
      setReminderEnabled(enabled);
      void persistReminder(enabled, reminderTime);
    },
    [persistReminder, reminderTime]
  );

  const onReminderTimeChange = React.useCallback(
    (time: Date) => {
      setReminderTime(time);
      void persistReminder(reminderEnabled, time);
    },
    [persistReminder, reminderEnabled]
  );

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
        <SettingsLinksSection onUpgradePress={() => setUpgradeOpen(true)} />
        <CopyFormatSection
          value={defaultCopyFormat}
          onChange={onCopyFormatChange}
        />
        <ReminderSection
          enabled={reminderEnabled}
          time={reminderTime}
          onEnabledChange={onReminderEnabledChange}
          onTimeChange={onReminderTimeChange}
        />
        <AccountActionsSection
          busy={busy}
          onDisconnectGitHub={() => void onDisconnectGitHub()}
          onSignOut={() => void onSignOut()}
          onDeleteAccount={onDeleteAccount}
        />
      </ScrollView>

      <UpgradeSheet open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
