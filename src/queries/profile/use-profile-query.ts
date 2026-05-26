import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/queries/lib/profile/fetch-user-profile';
import type { ProfileHomeRow } from '@/queries/lib/profile/types';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { profileKeys } from '@/queries/keys';
import { useRefreshOnFocus } from '@/queries/use-refresh-on-focus';

type UseProfileQueryOptions = {
  enabled?: boolean;
  refreshOnFocus?: boolean;
};

export function useProfileQuery(options?: UseProfileQueryOptions) {
  const { supabase, session } = useAuth();
  const enabled =
    isAuthReady(supabase, session) && (options?.enabled ?? true);

  const query = useQuery({
    queryKey: profileKeys.current(),
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<ProfileHomeRow> => {
      const auth = requireAuth(supabase, session);
      const { profile, error } = await fetchUserProfile(
        auth.supabase,
        auth.session
      );
      if (error) {
        throw new Error(error);
      }
      if (!profile) {
        throw new Error('Profile not found.');
      }
      return profile;
    },
  });

  const refreshOnFocus = options?.refreshOnFocus !== false && enabled;
  useRefreshOnFocus(() => {
    if (refreshOnFocus) {
      void query.refetch();
    }
  });

  return query;
}

export function useProfileQueryErrorMessage(
  options?: UseProfileQueryOptions
): string | null {
  const { error, isError } = useProfileQuery(options);
  if (!isError || !error) {
    return null;
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}
