import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenFooterProps = ViewProps & {
  children: React.ReactNode;
};

/** Bottom action area with safe-area padding and consistent spacing. */
export function ScreenFooter({
  children,
  className,
  ...props
}: ScreenFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 20);

  return (
    <View
      className={cn(
        'border-border bg-background/95 gap-3 border-t px-5 pt-4',
        className
      )}
      style={{ paddingBottom: bottomPad }}
      {...props}
    >
      {children}
    </View>
  );
}
