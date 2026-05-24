import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
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

  return (
    <View
      className={cn(
        'bg-sheet flex-1 rounded-t-[40px]',
        overlap && '-mt-5',
        padded && 'px-5 pt-6',
        className
      )}
      style={[
        { borderCurve: 'continuous', paddingBottom: Math.max(insets.bottom, 16) },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
