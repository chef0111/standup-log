import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { useThemeColor } from '@/hooks/use-theme-color.web';
import { Redirect } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { configured, loading, session } = useAuth();
  const foreground = useThemeColor('--color-foreground');

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator color={foreground} />
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
