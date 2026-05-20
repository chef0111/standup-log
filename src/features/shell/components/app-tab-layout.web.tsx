import { FloatingWebTabBar } from '@/features/shell/components/floating-web-tab-bar';
import { Tabs } from 'expo-router';

export function AppTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingWebTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
