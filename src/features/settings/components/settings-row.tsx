import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type SettingsRowProps = {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  className?: string;
};

export function SettingsRow({
  label,
  onPress,
  destructive = false,
  showChevron = true,
  className,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'active:bg-muted/50 min-h-11 flex-row items-center justify-between rounded-2xl px-1 py-3',
        className
      )}
      style={({ pressed }) => (pressed && onPress ? { opacity: 0.85 } : undefined)}
    >
      <Text
        className={cn(
          'text-base font-medium',
          destructive ? 'text-destructive' : 'text-foreground'
        )}
      >
        {label}
      </Text>
      {showChevron && onPress ? (
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      ) : (
        <View className="size-[18px]" />
      )}
    </Pressable>
  );
}

type SettingsRowDividerProps = {
  className?: string;
};

export function SettingsRowDivider({ className }: SettingsRowDividerProps) {
  return <View className={cn('bg-border/60 ml-1 h-px', className)} />;
}
