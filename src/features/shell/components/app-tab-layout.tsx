import { useThemeColor } from '@/features/theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export function AppTabLayout() {
  const card = useThemeColor('--color-card');
  const primary = useThemeColor('--color-primary');
  const foreground = useThemeColor('--color-foreground');
  const mutedForeground = useThemeColor('--color-muted-foreground');

  return (
    <NativeTabs
      backgroundColor={card}
      indicatorColor={primary}
      tintColor={primary}
      labelStyle={{
        default: { color: mutedForeground, fontSize: 11, fontWeight: '500' },
        selected: { color: foreground, fontSize: 11, fontWeight: '600' },
      }}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="standup">
        <NativeTabs.Trigger.Icon sf="doc.text" md="description" />
        <NativeTabs.Trigger.Label>Standup</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="weekly">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Weekly</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
