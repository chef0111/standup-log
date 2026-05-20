import { defaultTargetWorkday } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';

export function shouldScheduleReminder(input: {
  priorWorkday: Workday;
  standupCopiedAt: string | null;
  reminderEnabled: boolean;
}): boolean {
  return input.reminderEnabled && !input.standupCopiedAt;
}

export function getReminderPriorWorkday(now: Date = new Date()): Workday {
  return defaultTargetWorkday(now);
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
