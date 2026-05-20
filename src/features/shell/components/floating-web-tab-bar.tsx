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

export function FloatingWebTabBar({ state, navigation }: BottomTabBarProps) {
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
        className="border-border bg-popover max-w-105 w-[92%] flex-row rounded-full border px-1.5 py-1"
        style={{
          minHeight: FLOATING_TAB_BAR_HEIGHT,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
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
