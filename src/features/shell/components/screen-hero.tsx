import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenHeroProps = ViewProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  editorialTitle?: string;
  trailing?: React.ReactNode;
  compact?: boolean;
  children?: React.ReactNode;
};

/** Compact dark hero zone for authenticated screens. */
export function ScreenHero({
  eyebrow,
  title,
  subtitle,
  editorialTitle,
  trailing,
  compact = true,
  children,
  className,
  ...props
}: ScreenHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('bg-hero', compact ? 'pb-8' : 'pb-10', className)}
      style={{ paddingTop: insets.top + 12 }}
      {...props}
    >
      <View className="gap-4 px-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            {eyebrow ? (
              <Text className="text-xs font-medium uppercase tracking-widest text-white/70">
                {eyebrow}
              </Text>
            ) : null}
            {editorialTitle ? (
              <Text className="font-black text-2xl uppercase leading-tight tracking-wide text-hero-foreground">
                {editorialTitle}
              </Text>
            ) : title ? (
              <Text className="font-bold text-2xl tracking-tight text-hero-foreground">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="text-sm leading-relaxed text-white/70">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {trailing ? <View className="shrink-0">{trailing}</View> : null}
        </View>
        {children}
      </View>
    </View>
  );
}
