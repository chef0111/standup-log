import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AppError, userFacingMessage } from '@/lib/errors';
import { useAuth } from '@/providers/auth-provider';
import { parseSelectedRepositories } from '@/types/repository';
import { Image } from 'expo-image';
import { Redirect, Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

type ProfileRow = {
  github_login: string | null;
  avatar_url: string | null;
  onboarding_completed_at: string | null;
  selected_repositories: unknown;
};

export default function AppHomeScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase || !session) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;

    void supabase
      .from('profiles')
      .select('github_login, avatar_url, onboarding_completed_at, selected_repositories')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          setStatus(error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  const displayName =
    profile?.github_login ??
    (typeof session?.user.user_metadata?.user_name === 'string'
      ? session.user.user_metadata.user_name
      : null) ??
    session?.user.email ??
    'Signed in';

  const avatarUrl =
    profile?.avatar_url ??
    (typeof session?.user.user_metadata?.avatar_url === 'string'
      ? session.user.user_metadata.avatar_url
      : null);

  const selectedCount = profile ? parseSelectedRepositories(profile.selected_repositories).length : 0;

  const onSignOut = React.useCallback(async () => {
    if (!supabase) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    router.replace('/(public)/sign-in');
  }, [router, supabase]);

  const onDeleteAccount = React.useCallback(() => {
    if (!supabase) {
      return;
    }
    Alert.alert(
      'Delete account',
      'This removes your StandupLog data from our servers and signs you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            setStatus(null);
            try {
              const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
              if (error) {
                throw new AppError('auth', error.message);
              }
              await supabase.auth.signOut();
              router.replace('/(public)/sign-in');
            } catch (e) {
              const text = e instanceof AppError ? e.message : userFacingMessage('auth');
              setStatus(text);
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }, [router, supabase]);

  if (loadingProfile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Home' }} />
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Home' }} />
        <View className="flex-1 justify-center gap-3 bg-background p-6">
          <Text className="text-center text-muted-foreground">
            We could not load your profile. Apply the latest Supabase migrations (see `supabase/migrations`) and try
            again.
          </Text>
          {status ? <Text className="text-center text-destructive">{status}</Text> : null}
        </View>
      </>
    );
  }

  if (!profile.onboarding_completed_at) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 gap-6 bg-background p-6">
        <View className="items-center gap-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <View className="size-24 items-center justify-center rounded-full bg-muted">
              <Text variant="h3" className="text-muted-foreground">
                {(displayName[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          )}
          <Text variant="h3" className="text-center text-foreground">
            {displayName}
          </Text>
        </View>

        <Text className="text-center text-muted-foreground">
          {selectedCount === 0
            ? 'No repositories selected yet. Add some to pull commit activity in a later phase, or keep using manual notes only.'
            : `Tracking ${selectedCount} selected ${selectedCount === 1 ? 'repository' : 'repositories'}.`}
        </Text>

        {status ? <Text className="text-center text-destructive">{status}</Text> : null}

        <View className="mt-auto gap-3">
          <Button variant="secondary" disabled={busy} onPress={() => router.push('/(app)/settings')}>
            <Text>Manage repositories</Text>
          </Button>
          <Button variant="outline" disabled={busy} onPress={onSignOut}>
            <Text>Sign out</Text>
          </Button>
          <Button variant="destructive" disabled={busy} onPress={onDeleteAccount}>
            <Text>Delete account</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
