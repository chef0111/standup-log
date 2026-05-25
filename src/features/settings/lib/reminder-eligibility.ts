import {
  addCalendarDays,
  formatWorkdayLocal,
} from '@/features/standup/lib/workday/workday';
import type { Workday } from '@/features/standup/types/workday';

export function shouldScheduleReminder(input: {
  priorWorkday: Workday;
  standupCopiedAt: string | null;
  reminderEnabled: boolean;
}): boolean {
  return input.reminderEnabled && !input.standupCopiedAt;
}

export function getReminderPriorWorkday(
  now: Date = new Date(),
  timeZone?: string
): Workday {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = formatWorkdayLocal(now, tz);
  return addCalendarDays(today, -1);
}

export function nextReminderDate(
  reminderTimeLocal: string,
  now: Date = new Date()
): Date {
  const [hours, minutes] = reminderTimeLocal.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function parseReminderTime(timeLocal: string): Date {
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
