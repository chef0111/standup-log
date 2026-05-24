import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_MARGIN,
} from '@/features/shell/lib/tab-bar-metrics';
import { APP_TAB_ITEMS } from '@/features/shell/lib/tab-items';
import { cn } from '@/lib/utils';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingTabButtonProps = {
  icon: LucideIcon;
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

function FloatingTabButton({
  icon,
  label,
  isFocused,
  onPress,
}: FloatingTabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      className={cn(
        'min-h-12 min-w-11 flex-1 items-center justify-center rounded-full px-3 py-2',
        isFocused && 'bg-white/15'
      )}
      style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
    >
      <Icon
        as={icon}
        size={22}
        className={isFocused ? 'text-white' : 'text-white/45'}
      />
      {isFocused ? (
        <Text className="mt-0.5 text-[10px] font-medium text-white">
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 items-center"
      style={{
        paddingBottom: Math.max(insets.bottom, FLOATING_TAB_BAR_MARGIN),
      }}
    >
      <View
        className="max-w-105 w-[92%] flex-row rounded-full bg-zinc-900 px-2 py-1.5"
        style={{
          minHeight: FLOATING_TAB_BAR_HEIGHT,
          boxShadow: 'var(--shadow-floating)',
        }}
      >
        {state.routes.map((route, index) => {
          const tab = APP_TAB_ITEMS.find((item) => item.name === route.name);
          if (!tab) {
            return null;
          }

          const isFocused = state.index === index;

          return (
            <FloatingTabButton
              key={route.key}
              icon={tab.icon}
              label={tab.label}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

/** @deprecated Use FloatingTabBar */
export const FloatingWebTabBar = FloatingTabBar;
