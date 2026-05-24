import { APP_TAB_ITEMS } from '@/features/shell/lib/tab-items';
import { useThemeColor } from '@/hooks/use-theme-color';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export function AppTabLayout() {
  const sheet = useThemeColor('--color-sheet');
  const primary = useThemeColor('--color-primary');
  const foreground = useThemeColor('--color-foreground');
  const mutedForeground = useThemeColor('--color-muted-foreground');

  return (
    <NativeTabs
      backgroundColor={sheet}
      blurEffect={Platform.OS === 'ios' ? 'systemMaterial' : undefined}
      disableTransparentOnScrollEdge
      indicatorColor={primary}
      minimizeBehavior="never"
      tintColor={primary}
      labelStyle={{
        default: { color: mutedForeground, fontSize: 11, fontWeight: '500' },
        selected: { color: foreground, fontSize: 11, fontWeight: '600' },
      }}
    >
      {APP_TAB_ITEMS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
