import { useAuth } from '@/context/auth';
import { scheduleStandupReminder } from '@/features/settings/lib/schedule-standup-reminder';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import * as React from 'react';

export function useStandupReminder() {
  const { supabase, session } = useAuth();
  const { data: profile } = useProfileQuery();

  React.useEffect(() => {
    if (!supabase || !session || !profile) {
      return;
    }

    void scheduleStandupReminder({
      supabase,
      userId: session.user.id,
      reminderEnabled: profile.reminder_enabled ?? true,
      reminderTimeLocal: profile.reminder_time_local ?? '09:00:00',
    });
  }, [profile, session, supabase]);
}
