import { GithubIcon } from '@/components/icons/github-icon';
import { ScreenFooter } from '@/components/screen-footer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-provider';
import { fetchUserProfile, type ProfileHomeRow } from '@/lib/profile';
import { parseSelectedRepositories } from '@/types/repository';
import { Image } from 'expo-image';
import { Redirect, Stack, useRouter } from 'expo-router';
import { CircleCheck, Settings } from 'lucide-react-native';
import { useUnstableNativeVariable } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Octicon } from 'rn-iconify/icons/Octicon';

export default function AppHomeScreen() {
  const router = useRouter();
  const foreground = useUnstableNativeVariable();
  const { supabase, session } = useAuth();
  const [profile, setProfile] = React.useState<ProfileHomeRow | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase || !session) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;

    void fetchUserProfile(supabase, session).then(({ profile: row, error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        setStatus(error);
        setProfile(null);
      } else {
        setProfile(row);
        setStatus(null);
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

  const selectedCount = profile
    ? parseSelectedRepositories(profile.selected_repositories).length
    : 0;

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

  if (loadingProfile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Home' }} />
        <View className="bg-background flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ title: 'Home' }} />
        <View className="bg-background flex-1 justify-center gap-3 p-6">
          <Text className="text-muted-foreground text-center">
            We could not load your profile. Confirm both migrations in
            `supabase/migrations` are applied to this project, then sign out and
            sign in again.
          </Text>
          {status ? (
            <Text className="text-destructive text-center">{status}</Text>
          ) : null}
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
      <View className="bg-background flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow gap-5 px-5 pb-4 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text className="text-muted-foreground text-sm font-medium">
              Welcome back
            </Text>
            <Text variant="h2" className="text-foreground border-0 pb-0">
              StandupLog
            </Text>
          </View>

          <View className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm shadow-black/5">
            <View className="items-center gap-4 px-6 py-8">
              <View className="border-primary/20 rounded-full border-2 p-1">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                ) : (
                  <View className="bg-muted size-20 items-center justify-center rounded-full">
                    <Text variant="h3" className="text-muted-foreground">
                      {(displayName[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View className="items-center gap-2">
                <Text
                  variant="h3"
                  className="text-foreground border-0 pb-0 text-center"
                >
                  {displayName}
                </Text>
                <View className="bg-muted/60 flex-row items-center gap-1.5 rounded-full px-3 py-1">
                  <GithubIcon size={14} color={foreground ?? undefined} />
                  <Text className="text-muted-foreground text-xs">
                    Connected via GitHub
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="border-border bg-muted/20 flex-1 gap-2 rounded-xl border p-4">
              <View className="flex-row items-center gap-2">
                <Octicon
                  name="repo-16"
                  size={28}
                  color={foreground ?? undefined}
                />
                <Text className="text-foreground text-3xl font-bold">
                  {selectedCount}
                </Text>
              </View>
              <Text className="text-muted-foreground text-sm">
                {selectedCount === 1 ? 'Repository' : 'Repositories'}
              </Text>
            </View>
            <View className="border-border bg-muted/20 flex-1 gap-2 rounded-xl border p-4">
              <Icon as={CircleCheck} size={28} className="text-primary" />
              <Text className="text-foreground text-sm font-medium">
                Sources ready
              </Text>
              <Text className="text-muted-foreground text-xs">
                Configured for standups
              </Text>
            </View>
          </View>

          <View className="border-border bg-card/60 gap-2 rounded-xl border p-4">
            <Text className="text-foreground font-medium">
              What&apos;s next
            </Text>
            <Text className="text-muted-foreground text-sm leading-relaxed">
              {selectedCount === 0
                ? 'Select repositories to include commit activity in your standup updates, or continue with manual notes only.'
                : 'Your repository selection is saved. Adjust it anytime before generating standup updates.'}
            </Text>
          </View>

          {status ? (
            <Text className="text-destructive text-center text-sm">
              {status}
            </Text>
          ) : null}
        </ScrollView>

        <ScreenFooter>
          <Button
            disabled={busy}
            onPress={() => router.push('/(app)/settings')}
          >
            <Icon as={Settings} size={18} className="text-primary-foreground" />
            <Text>Manage repositories</Text>
          </Button>
          <Button variant="outline" disabled={busy} onPress={onSignOut}>
            <Text>Sign out</Text>
          </Button>
        </ScreenFooter>
      </View>
    </>
  );
}
