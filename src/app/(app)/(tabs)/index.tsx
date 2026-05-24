import { GithubIcon, RepositoryIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { HomeActivitySection } from '@/features/home/components/home-activity-section';
import { HomeWeekSnapshotCard } from '@/features/home/components/home-week-snapshot-card';
import { StandupWidget } from '@/features/home/components/standup-widget';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import {
  fetchUserProfile,
  type ProfileHomeRow,
} from '@/features/profile/lib/profile';
import { parseSelectedRepositories } from '@/features/repositories/types/repository';
import { useStandupReminder } from '@/features/settings/hooks/use-standup-reminder';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { Flame } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

function StreakPill({ streak }: { streak: number }) {
  return (
    <View className="bg-muted flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
      <Icon as={Flame} size={16} className="text-success" />
      <Text className="text-foreground text-xs font-medium">
        {streak} day{streak === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

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
            headerShown: false,
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
        <Stack.Screen options={{ title: 'Home', headerShown: false }} />
        <View className="bg-background flex-1 justify-center gap-4 p-6 will-change-auto">
          <Card variant="elevated" className="gap-3 p-5">
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
          headerShown: false,
        }}
      />
      <AppScreenShell
        header={
          <ScreenHeader
            eyebrow="Hello"
            title={displayName}
            subtitle="Your workspace for daily standup updates."
            showThemeToggle={false}
            trailing={
              <View className="items-end gap-2">
                <ProfileAvatar
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                />
                <StreakPill streak={profile.current_streak} />
              </View>
            }
          />
        }
      >
        <StandupWidget />

        <View className="flex-row gap-3">
          <Card variant="elevated" className="flex-1 gap-2 p-5">
            <View className="flex-row items-center gap-2">
              <View className="bg-muted/80 size-8 items-center justify-center rounded-md">
                <RepositoryIcon size={16} color={foreground} />
              </View>
              <Text className="text-foreground text-2xl font-semibold tracking-tight">
                {selectedCount}
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm">
              {selectedCount === 1 ? 'Repository' : 'Repositories'}
            </Text>
          </Card>
          <Card variant="elevated" className="flex-1 gap-2 p-5">
            <Icon as={Flame} size={22} className="text-success" />
            <Text className="text-foreground text-sm font-medium">
              Best streak
            </Text>
            <Text className="text-muted-foreground text-xs">
              {profile.longest_streak} day
              {profile.longest_streak === 1 ? '' : 's'}
            </Text>
          </Card>
        </View>

        <HomeActivitySection />
        <HomeWeekSnapshotCard />

        <View className="bg-muted/50 flex-row items-center justify-center gap-1.5 self-start rounded-full px-3 py-2">
          <GithubIcon size={14} color={foreground} />
          <Text className="text-muted-foreground text-xs">
            Connected via GitHub
          </Text>
        </View>

        {status ? (
          <Text className="text-destructive text-center text-sm">{status}</Text>
        ) : null}
      </AppScreenShell>
    </>
  );
}
