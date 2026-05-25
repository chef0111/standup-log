import { useAuth } from '@/context/auth';
import { Text } from '@/components/ui/text';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { Redirect, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

type OnboardingGuardProps = {
  children: React.ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { supabase, session } = useAuth();
  const pathname = usePathname();
  const foreground = useThemeColor('--color-foreground');
  const [loading, setLoading] = React.useState(true);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

  const onOnboardingRoute = pathname.includes('/onboarding');

  React.useEffect(() => {
    if (!supabase || !session || onOnboardingRoute) {
      setLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    let cancelled = false;

    void fetchUserProfile(supabase, session).then(({ profile }) => {
      if (cancelled) {
        return;
      }
      setNeedsOnboarding(Boolean(profile && !profile.onboarding_completed_at));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [onOnboardingRoute, session, supabase]);

  if (onOnboardingRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={foreground} />
        <Text className="text-muted-foreground mt-4">Loading workspace…</Text>
      </View>
    );
  }

  if (needsOnboarding) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return <>{children}</>;
}
