import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type BrandLockupProps = {
  className?: string;
  light?: boolean;
};

export function BrandLockup({ className, light = true }: BrandLockupProps) {
  const fg = light ? 'text-white' : 'text-foreground';
  const badgeBorder = light ? 'border-white/25 bg-white/10' : 'border-border bg-muted/50';

  return (
    <View className={cn('flex-row items-center gap-2.5', className)}>
      <View
        className={cn(
          'size-9 items-center justify-center rounded-full border',
          badgeBorder
        )}
      >
        <Text className={cn('font-bold text-base', fg)}>S</Text>
      </View>
      <Text className={cn('text-xl font-semibold tracking-tight', fg)}>
        StandupLog
      </Text>
    </View>
  );
}
