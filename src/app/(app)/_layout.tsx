import { ScreenHeaderActions } from '@/components/screen-header-actions';
import { useAuth } from '@/context/auth-provider';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppGroupLayout() {
  const { configured, session, loading } = useAuth();

  if (!configured) {
    return <Redirect href="/(public)/setup" />;
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
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
        headerRight: () => <ScreenHeaderActions />,
      }}
    />
  );
}
