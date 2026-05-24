import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { Stack } from 'expo-router';

export default function WeeklyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        headerRight: () => <ScreenHeaderActions />,
      }}
    />
  );
}
