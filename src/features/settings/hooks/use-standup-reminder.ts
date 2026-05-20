import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { scheduleStandupReminder } from '@/features/settings/lib/schedule-standup-reminder';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export function useStandupReminder() {
  const { supabase, session } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      if (!supabase || !session) {
        return;
      }

      void fetchUserProfile(supabase, session).then(({ profile }) => {
        if (!profile) {
          return;
        }
        void scheduleStandupReminder({
          supabase,
          userId: session.user.id,
          reminderEnabled: profile.reminder_enabled ?? true,
          reminderTimeLocal: profile.reminder_time_local ?? '09:00:00',
        });
      });
    }, [session, supabase])
  );
}
