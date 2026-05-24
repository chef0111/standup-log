import { FloatingTabBar } from '@/features/shell/components/floating-tab-bar';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Tabs } from 'expo-router';

export function AppTabLayout() {
  const reduceMotion = useReducedMotion();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
      }}
    />
  );
}
