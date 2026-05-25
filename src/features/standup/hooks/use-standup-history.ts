import { useAuth } from '@/context/auth';
import { getWorkdayHistoryBounds } from '@/features/entitlements/lib/entitlements';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import {
  mapStandupUpdateToHistoryItem,
  type StandupHistoryItem,
} from '@/features/standup/lib/history/standup-history-item';
import { fetchStandupsInHistory } from '@/features/standup/lib/standup-api';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export type StandupHistoryData = {
  items: StandupHistoryItem[];
  isPro: boolean;
  loading: boolean;
  error: string | null;
};

export function useStandupHistory(): StandupHistoryData {
  const { supabase, session } = useAuth();
  const [isPro, setIsPro] = React.useState(false);
  const [items, setItems] = React.useState<StandupHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!supabase || !session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { profile, error: profileError } = await fetchUserProfile(
      supabase,
      session
    );
    const pro = Boolean(profile?.is_pro);
    setIsPro(pro);

    const bounds = getWorkdayHistoryBounds({ isPro: pro });
    const { standups, error: standupsError } = await fetchStandupsInHistory(
      supabase,
      bounds.minimumWorkday,
      bounds.maximumWorkday
    );

    if (profileError || standupsError) {
      setError(
        userFacingMessage(
          categorizeError(profileError ?? standupsError ?? 'Unknown error')
        )
      );
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(standups.map(mapStandupUpdateToHistoryItem));
    setLoading(false);
  }, [session, supabase]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load])
  );

  return { items, isPro, loading, error };
}
