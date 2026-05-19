import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { Redirect } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { configured, loading, session } = useAuth();

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading…</Text>
      </View>
    );
  }

  if (!configured) {
    return <Redirect href="/(public)/setup" />;
  }

  if (!session) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return <Redirect href="/(app)" />;
}
