import { useAuth } from '@/context/auth';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import { AccountActionsSection } from '@/features/settings/components/account-actions-section';
import { CopyFormatSection } from '@/features/settings/components/copy-format-section';
import { ReminderSection } from '@/features/settings/components/reminder-section';
import { SettingsLinksSection } from '@/features/settings/components/settings-links-section';
import { deleteAccount } from '@/features/settings/lib/delete-account';
import { parseReminderTime } from '@/features/settings/lib/reminder-eligibility';
import { scheduleStandupReminder } from '@/features/settings/lib/schedule-standup-reminder';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import {
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { updateDefaultCopyFormat } from '@/queries/lib/profile/update-default-copy-format';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const { data: profile } = useProfileQuery();
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [reminderEnabled, setReminderEnabled] = React.useState<boolean | undefined>(
    undefined
  );
  const [reminderTime, setReminderTime] = React.useState<Date | undefined>(
    undefined
  );
  const [defaultCopyFormat, setDefaultCopyFormat] = React.useState<
    CopyFormat | undefined
  >(undefined);
  const { displayName: profileName, avatarUrl } = useProfileHeader();

  const accountLabel =
    profile?.github_login ?? session?.user.email ?? 'Account';
  const resolvedReminderEnabled =
    reminderEnabled ?? profile?.reminder_enabled ?? true;
  const resolvedReminderTime =
    reminderTime ??
    parseReminderTime(profile?.reminder_time_local ?? '09:00:00');
  const resolvedCopyFormat = normalizeCopyFormat(
    defaultCopyFormat ?? profile?.default_copy_format
  );

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
    if (error) {
      Alert.alert('Sign out failed', error.message);
      return;
    }
    router.replace('/(public)/sign-in');
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
      void persistReminder(enabled, resolvedReminderTime);
    },
    [persistReminder, resolvedReminderTime]
  );

  const onReminderTimeChange = React.useCallback(
    (time: Date) => {
      setReminderTime(time);
      void persistReminder(resolvedReminderEnabled, time);
    },
    [persistReminder, resolvedReminderEnabled]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <AppScreenShell
        header={
          <ScreenHeader
            eyebrow="Settings"
            title={accountLabel}
            subtitle="Repositories, reminders, and account preferences."
            showThemeToggle={false}
            trailing={
              <ProfileAvatar
                avatarUrl={avatarUrl}
                displayName={profileName}
                size="sm"
              />
            }
          />
        }
      >
        <SettingsLinksSection onUpgradePress={() => setUpgradeOpen(true)} />
        <CopyFormatSection
          value={resolvedCopyFormat}
          onChange={onCopyFormatChange}
        />
        <ReminderSection
          enabled={resolvedReminderEnabled}
          time={resolvedReminderTime}
          onEnabledChange={onReminderEnabledChange}
          onTimeChange={onReminderTimeChange}
        />
        <AccountActionsSection
          busy={busy}
          onDisconnectGitHub={() => void onDisconnectGitHub()}
          onSignOut={() => void onSignOut()}
          onDeleteAccount={onDeleteAccount}
        />
      </AppScreenShell>

      <UpgradeSheet open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
