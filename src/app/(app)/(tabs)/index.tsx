import { GithubIcon, RepositoryIcon } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { StandupWidget } from '@/features/home';
import { fetchUserProfile, type ProfileHomeRow } from '@/features/profile';
import { useStandupReminder } from '@/features/reminders';
import { parseSelectedRepositories } from '@/features/repositories';
import { MarketingHeader, ScreenHeaderActions } from '@/features/shell';
import { useThemeColor } from '@/features/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Redirect, Stack } from 'expo-router';
import { Flame } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function AppHomeScreen() {
  const foreground = useThemeColor('--color-foreground');
  const { supabase, session } = useAuth();
  const [profile, setProfile] = React.useState<ProfileHomeRow | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [status, setStatus] = React.useState<string | null>(null);
  const initialLoad = React.useRef(true);

  useStandupReminder();

  const loadProfile = React.useCallback(async () => {
    if (!supabase || !session) {
      setLoadingProfile(false);
      return;
    }

    if (initialLoad.current) {
      setLoadingProfile(true);
    }

    const { profile: row, error } = await fetchUserProfile(supabase, session);

    if (error) {
      setStatus(error);
      setProfile(null);
    } else {
      setProfile(row);
      setStatus(null);
    }
    setLoadingProfile(false);
    initialLoad.current = false;
  }, [session, supabase]);

  useFocusEffect(
    React.useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

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

  if (loadingProfile) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Home',
            headerRight: () => <ScreenHeaderActions />,
          }}
        />
        <View className="bg-background flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={foreground} />
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Home',
            headerRight: () => <ScreenHeaderActions />,
          }}
        />
        <View className="bg-background flex-1 justify-center gap-4 p-6">
          <Card className="gap-3 p-6">
            <Text className="text-muted-foreground text-center text-sm leading-relaxed">
              We could not load your profile. Confirm both migrations in
              `supabase/migrations` are applied to this project, then sign out
              and sign in again.
            </Text>
            {status ? (
              <Text className="text-destructive text-center text-sm">
                {status}
              </Text>
            ) : null}
          </Card>
        </View>
      </>
    );
  }

  if (!profile.onboarding_completed_at) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <View className="bg-background flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-lg flex-grow gap-6 px-5 pb-8 pt-2"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <MarketingHeader
            eyebrow="Welcome back"
            title="StandupLog"
            description="Your workspace for daily standup updates."
          />

          <StandupWidget />

          <Card>
            <CardContent className="items-center gap-4 pt-6">
              <View className="border-border rounded-full border p-0.5">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 72, height: 72, borderRadius: 36 }}
                  />
                ) : (
                  <View className="bg-muted size-18 items-center justify-center rounded-full">
                    <Text
                      variant="h3"
                      className="text-muted-foreground border-0 pb-0"
                    >
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
                <View className="border-border bg-muted/50 flex-row items-center gap-1.5 rounded-full border px-3 py-1">
                  <GithubIcon size={14} color={foreground} />
                  <Text className="text-muted-foreground text-xs">
                    Connected via GitHub
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="flex-row gap-3">
            <Card className="flex-1 p-4">
              <View className="flex-row items-center gap-2">
                <View className="bg-muted/80 size-8 items-center justify-center rounded-md">
                  <RepositoryIcon size={16} color={foreground} />
                </View>
                <Text className="text-foreground text-2xl font-semibold tracking-tight">
                  {selectedCount}
                </Text>
              </View>
              <Text className="text-muted-foreground mt-2 text-sm">
                {selectedCount === 1 ? 'Repository' : 'Repositories'}
              </Text>
            </Card>
            <Card className="flex-1 gap-2 p-4">
              <Icon as={Flame} size={22} className="text-foreground" />
              <Text className="text-foreground text-sm font-medium">
                Daily streak
              </Text>
              <Text className="text-muted-foreground text-xs">
                {profile.current_streak} current · best {profile.longest_streak}
              </Text>
            </Card>
          </View>

          {status ? (
            <Text className="text-destructive text-center text-sm">
              {status}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}
