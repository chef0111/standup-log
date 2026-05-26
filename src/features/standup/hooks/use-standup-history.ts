import { useAuth } from '@/context/auth';
import { getWorkdayHistoryBounds } from '@/features/entitlements/lib/entitlements';
import { fetchUserProfile } from '@/queries/lib/profile/fetch-user-profile';
import {
  mapStandupUpdateToHistoryItem,
  type StandupHistoryItem,
} from '@/features/standup/lib/history/standup-history-item';
import {
  deleteStandupUpdate,
  fetchStandupsInHistory,
} from '@/features/standup/lib/standup-api';
import type { WorkdayPickerBounds } from '@/features/standup/lib/workday/workday';
import type { Workday } from '@/features/standup/types/workday';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export type DeleteStandupHistoryItem = (
  workday: Workday
) => Promise<string | null>;

export type StandupHistoryData = {
  items: StandupHistoryItem[];
  pickerBounds: WorkdayPickerBounds | null;
  isPro: boolean;
  loading: boolean;
  error: string | null;
  deleteItem: DeleteStandupHistoryItem;
};

export function useStandupHistory(): StandupHistoryData {
  const { supabase, session } = useAuth();
  const [isPro, setIsPro] = React.useState(false);
  const [pickerBounds, setPickerBounds] =
    React.useState<WorkdayPickerBounds | null>(null);
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
    setPickerBounds(bounds);
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

  const deleteItem = React.useCallback<DeleteStandupHistoryItem>(
    async (workday) => {
      if (!supabase || !session) {
        return userFacingMessage(categorizeError('Not signed in'));
      }

      setItems((prev) => prev.filter((item) => item.workday !== workday));

      const { error } = await deleteStandupUpdate(supabase, workday);
      if (error) {
        await load();
        return userFacingMessage(categorizeError(error));
      }

      return null;
    },
    [load, session, supabase]
  );

  return { items, pickerBounds, isPro, loading, error, deleteItem };
}
