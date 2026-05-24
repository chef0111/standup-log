import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

type TerminalSurfaceProps = ViewProps & {
  className?: string;
};

/** Scopes dark terminal tokens so activity logs and draft editors stay terminal-dark in any app theme. */
export function TerminalSurface({
  className,
  children,
  ...props
}: TerminalSurfaceProps) {
  return (
    <View className={cn('terminal-surface', className)} {...props}>
      {children}
    </View>
  );
}
