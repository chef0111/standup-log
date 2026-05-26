import { useAuth } from '@/context/auth';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import * as React from 'react';

export function useProfileHeader() {
  const { session } = useAuth();
  const { data: profile } = useProfileQuery();

  const displayName = React.useMemo(() => {
    if (profile?.github_login) {
      return profile.github_login;
    }
    return session?.user.email ?? 'Account';
  }, [profile?.github_login, session?.user.email]);

  const avatarUrl = React.useMemo(() => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    const meta = session?.user.user_metadata?.avatar_url;
    return typeof meta === 'string' ? meta : null;
  }, [profile?.avatar_url, session?.user.user_metadata?.avatar_url]);

  return { displayName, avatarUrl };
}
