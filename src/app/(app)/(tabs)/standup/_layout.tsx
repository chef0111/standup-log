import { ScreenHeaderActions } from '@/features/shell/components/screen-header-actions';
import { Stack } from 'expo-router';

export default function StandupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: 'transparent' },
        headerRight: () => <ScreenHeaderActions />,
      }}
    />
  );
}
