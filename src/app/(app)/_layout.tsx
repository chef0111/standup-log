import { useAuth } from '@/features/auth';
import { ScreenHeaderActions } from '@/features/shell';
import { Redirect, Stack } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppGroupLayout() {
  const { configured, session, loading } = useAuth();

  if (!configured) {
    return <Redirect href="/(public)/setup" />;
  }

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return (
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
    />
  );
}
