import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-provider';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { configured, loading, session } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading…</Text>
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
