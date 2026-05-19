import type { WorkdayPickerBounds } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';

export type WorkdayDatePickerProps = {
  workday: Workday;
  bounds: WorkdayPickerBounds;
  onWorkdayChange: (workday: Workday) => void;
};
