import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

type ScreenFooterProps = ViewProps & {
  children: React.ReactNode;
};

/** Bottom action area above floating tab bar with top shadow. */
export function ScreenFooter({
  children,
  className,
  style,
  ...props
}: ScreenFooterProps) {
  const tabBarPadding = useTabBarScrollPadding(20);

  return (
    <View
      className={cn('bg-background gap-3 px-5 pt-4', className)}
      style={[
        {
          paddingBottom: tabBarPadding,
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
