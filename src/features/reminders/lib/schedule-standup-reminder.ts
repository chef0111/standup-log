import {
  getReminderPriorWorkday,
  nextReminderDate,
  shouldScheduleReminder,
} from '@/features/reminders/lib/reminder-eligibility';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID_KEY = 'standup-reminder-id';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function cancelStandupReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleStandupReminder(input: {
  supabase: SupabaseClient;
  userId: string;
  reminderEnabled: boolean;
  reminderTimeLocal: string;
}): Promise<{ scheduled: boolean; reason?: string }> {
  if (Platform.OS === 'web') {
    return { scheduled: false, reason: 'web_unsupported' };
  }

  await cancelStandupReminder();

  if (!input.reminderEnabled) {
    return { scheduled: false, reason: 'disabled' };
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return { scheduled: false, reason: 'permission_denied' };
  }

  const priorWorkday = getReminderPriorWorkday();
  const { standup } = await fetchStandupUpdate(input.supabase, priorWorkday);

  if (
    !shouldScheduleReminder({
      priorWorkday,
      standupCopiedAt: standup?.copied_at ?? null,
      reminderEnabled: input.reminderEnabled,
    })
  ) {
    return { scheduled: false, reason: 'already_copied' };
  }

  const triggerDate = nextReminderDate(input.reminderTimeLocal);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('standup-reminders', {
      name: 'Standup reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Standup reminder',
      body: "You haven't copied yesterday's standup yet.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? 'standup-reminders' : undefined,
    },
  });

  return { scheduled: true };
}

export { REMINDER_ID_KEY };
