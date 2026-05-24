import { ScreenFooter } from '@/features/shell/components/screen-footer';
import { ScreenHero } from '@/features/shell/components/screen-hero';
import { SheetSurface } from '@/features/shell/components/sheet-surface';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';

type AppScreenShellProps = {
  hero?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  sheetClassName?: string;
  contentClassName?: string;
};

/** Hero + overlapping sheet layout used across authenticated screens. */
export function AppScreenShell({
  hero,
  footer,
  children,
  scroll = true,
  scrollProps,
  sheetClassName,
  contentClassName,
}: AppScreenShellProps) {
  const tabBarPadding = useTabBarScrollPadding();
  const bottomPad = footer ? 0 : tabBarPadding;

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn(
        'mx-auto w-full max-w-lg flex-grow gap-6 px-5',
        contentClassName
      )}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={cn(
        'mx-auto w-full max-w-lg flex-1 gap-6 px-5',
        contentClassName
      )}
      style={{ paddingBottom: bottomPad }}
    >
      {children}
    </View>
  );

  return (
    <View className="bg-hero flex-1">
      {hero}
      <SheetSurface
        className={cn('min-h-0 flex-1', sheetClassName)}
        overlap
        padded={false}
      >
        <View className="flex-1 pt-6">{body}</View>
        {footer ? (
          <ScreenFooter className="bg-sheet/95 border-sheet-foreground/10">
            {footer}
          </ScreenFooter>
        ) : null}
      </SheetSurface>
    </View>
  );
}

export { ScreenHero, SheetSurface };
