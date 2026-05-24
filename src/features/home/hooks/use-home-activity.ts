import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { useActivitySync } from '@/features/standup/hooks/use-activity-sync';
import { defaultTargetWorkday } from '@/features/standup/lib/workday/workday';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export function useHomeActivity() {
  const { supabase, session } = useAuth();
  const workday = defaultTargetWorkday();
  const [isPro, setIsPro] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (!supabase || !session) {
        return;
      }
      void fetchUserProfile(supabase, session).then(({ profile }) => {
        setIsPro(Boolean(profile?.is_pro));
      });
    }, [session, supabase])
  );

  const activity = useActivitySync(workday, isPro);

  return { workday, ...activity };
}
