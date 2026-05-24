import { cn } from '@/lib/utils';
import * as React from 'react';
import { AccessibilityInfo, View, type ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetSurfaceProps = ViewProps & {
  children: React.ReactNode;
  overlap?: boolean;
  padded?: boolean;
};

/** Rounded sheet that overlaps the hero (`-mt-5` by default). */
export function SheetSurface({
  children,
  className,
  overlap = true,
  padded = true,
  style,
  ...props
}: SheetSurfaceProps) {
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => subscription.remove();
  }, []);

  const inner = (
    <View className="flex-1" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      {children}
    </View>
  );

  return (
    <View
      className={cn(
        'bg-sheet flex-1 rounded-t-[40px]',
        overlap && '-mt-5',
        padded && 'px-5 pt-6',
        className
      )}
      style={[{ borderCurve: 'continuous' }, style]}
      {...props}
    >
      {reduceMotion ? (
        inner
      ) : (
        <Animated.View entering={FadeInDown.duration(280)} className="flex-1">
          {inner}
        </Animated.View>
      )}
    </View>
  );
}
