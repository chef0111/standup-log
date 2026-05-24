import { FloatingTabBar } from '@/features/shell/components/floating-tab-bar';
import { Tabs } from 'expo-router';

export function AppTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
