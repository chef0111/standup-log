import { Text } from '@/components/ui/text';
import { ScreenHeaderActions } from '@/features/shell/components/screen-header/screen-header-actions';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenHeaderProps = ViewProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  editorialTitle?: string;
  trailing?: React.ReactNode;
  showThemeToggle?: boolean;
  children?: React.ReactNode;
};

/** Light greeting header for authenticated screens. */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  editorialTitle,
  trailing,
  showThemeToggle = true,
  children,
  className,
  ...props
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('bg-background pb-5', className)}
      style={{ paddingTop: insets.top + 12 }}
      {...props}
    >
      <View className="gap-4 px-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            {eyebrow && (
              <Text className="text-muted-foreground text-sm">{eyebrow}</Text>
            )}
            {editorialTitle ? (
              <Text className="text-foreground text-2xl font-bold leading-tight tracking-tight">
                {editorialTitle}
              </Text>
            ) : (
              title && (
                <Text className="text-foreground text-2xl font-bold tracking-tight">
                  {title}
                </Text>
              )
            )}
            {subtitle && (
              <Text className="text-muted-foreground text-sm leading-relaxed">
                {subtitle}
              </Text>
            )}
          </View>
          <View className="shrink-0 items-end gap-2">
            {trailing}
            {showThemeToggle && <ScreenHeaderActions />}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}
