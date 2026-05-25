import { useAuth } from '@/context/auth';
import { OnboardingGuard } from '@/features/profile/components/onboarding-guard';
import { ScreenHeaderActions } from '@/features/shell/components/screen-header/screen-header-actions';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Redirect, Stack } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AppGroupLayout() {
  const { configured, session, loading } = useAuth();
  const foreground = useThemeColor('--color-foreground');

  if (!configured) {
    return <Redirect href="/(public)/setup" />;
  }

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center will-change-auto">
        <ActivityIndicator size="large" color={foreground} />
        <Text className="text-muted-foreground mt-4">Loading…</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return (
    <OnboardingGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: undefined,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: 'transparent' },
          headerRight: () => <ScreenHeaderActions />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: 'Select repositories', headerShown: true }}
        />
      </Stack>
    </OnboardingGuard>
  );
}
