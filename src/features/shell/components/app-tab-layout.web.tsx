import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_MARGIN,
  getFloatingTabBarInset,
} from '@/features/shell/lib/tab-bar-metrics';
import { APP_TAB_ITEMS } from '@/features/shell/lib/tab-items';
import { cn } from '@/lib/utils';
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WebTabButtonProps = TabTriggerSlotProps & {
  icon: LucideIcon;
  label: string;
};

function WebTabButton({ icon, label, isFocused, ...props }: WebTabButtonProps) {
  return (
    <Pressable
      {...props}
      className={cn(
        'min-h-11 flex-1 items-center justify-center gap-0.5 rounded-full px-2 py-2',
        isFocused && 'bg-primary/10'
      )}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      <Icon
        as={icon}
        size={20}
        className={isFocused ? 'text-primary' : 'text-muted-foreground'}
      />
      <Text
        className={cn(
          'text-[11px] font-medium',
          isFocused ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AppTabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarPadding = getFloatingTabBarInset(insets.bottom);

  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1, paddingBottom: tabBarPadding }} />
      <TabList asChild>
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 bottom-0 items-center"
          style={{
            paddingBottom: Math.max(insets.bottom, FLOATING_TAB_BAR_MARGIN),
          }}
        >
          <View
            className="border-border bg-popover max-w-105 w-[92%] flex-row rounded-full border px-1.5 py-1"
            style={{
              minHeight: FLOATING_TAB_BAR_HEIGHT,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
            }}
          >
            {APP_TAB_ITEMS.map((tab) => (
              <TabTrigger
                key={tab.name}
                name={tab.name}
                href={tab.href}
                asChild
              >
                <WebTabButton icon={tab.icon} label={tab.label} />
              </TabTrigger>
            ))}
          </View>
        </View>
      </TabList>
    </Tabs>
  );
}
