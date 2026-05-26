import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Redirect, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

type OnboardingGuardProps = {
  children: React.ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { session } = useAuth();
  const pathname = usePathname();
  const foreground = useThemeColor('--color-foreground');
  const onOnboardingRoute = pathname.includes('/onboarding');

  const { data: profile, isLoading, isFetching } = useProfileQuery({
    enabled: !onOnboardingRoute && Boolean(session),
    refreshOnFocus: false,
  });

  if (onOnboardingRoute) {
    return <>{children}</>;
  }

  if (isLoading || isFetching) {
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
