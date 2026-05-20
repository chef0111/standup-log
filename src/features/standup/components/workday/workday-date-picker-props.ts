import type { WorkdayPickerBounds } from '@/features/standup/lib/workday/workday';
import type { Workday } from '@/features/standup/types/workday';

export type WorkdayDatePickerProps = {
  workday: Workday;
  bounds: WorkdayPickerBounds;
  onWorkdayChange: (workday: Workday) => void;
};
