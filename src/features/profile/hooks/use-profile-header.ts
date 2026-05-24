import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export function useProfileHeader() {
  const { supabase, session } = useAuth();
  const [displayName, setDisplayName] = React.useState('Account');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!supabase || !session) {
        return;
      }

      void fetchUserProfile(supabase, session).then(({ profile }) => {
        if (!profile) {
          return;
        }
        setDisplayName(profile.github_login ?? session.user.email ?? 'Account');
        setAvatarUrl(
          profile.avatar_url ??
            (typeof session.user.user_metadata?.avatar_url === 'string'
              ? session.user.user_metadata.avatar_url
              : null)
        );
      });
    }, [session, supabase])
  );

  return { displayName, avatarUrl };
}
