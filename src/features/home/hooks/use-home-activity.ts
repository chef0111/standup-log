import { useActivitySync } from '@/queries/activity/use-activity-sync';
import { defaultTargetWorkday } from '@/features/standup/lib/workday/workday';
import { useProfileQuery } from '@/queries/profile/use-profile-query';

export function useHomeActivity() {
  const workday = defaultTargetWorkday();
  const profileQuery = useProfileQuery();
  const isPro = Boolean(profileQuery.data?.is_pro);
  const activity = useActivitySync(workday, isPro);

  return { workday, ...activity };
}
