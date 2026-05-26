import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { Redirect, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

type OnboardingGuardProps = {
  children: React.ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { session } = useAuth();
  const pathname = usePathname();
  const foreground = useThemeColor('--color-foreground');
  const onOnboardingRoute = pathname.includes('/onboarding');

  const { data: profile, isLoading } = useProfileQuery({
    enabled: !onOnboardingRoute && Boolean(session),
    refreshOnFocus: false,
  });

  if (onOnboardingRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={foreground} />
        <Text className="text-muted-foreground mt-4">Loading workspace…</Text>
      </View>
    );
  }

  if (profile && !profile.onboarding_completed_at) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return <>{children}</>;
}
