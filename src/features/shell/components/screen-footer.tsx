import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenFooterProps = ViewProps & {
  children: React.ReactNode;
};

/** Bottom action area with safe-area padding and top shadow. */
export function ScreenFooter({
  children,
  className,
  style,
  ...props
}: ScreenFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 20);

  return (
    <View
      className={cn('bg-background gap-3 px-5 pt-4', className)}
      style={[
        {
          paddingBottom: bottomPad,
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
