import { ScreenFooter } from '@/features/shell/components/screen-footer';
import { ScreenHeader } from '@/features/shell/components/screen-header';
import { SheetSurface } from '@/features/shell/components/sheet-surface';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';

type AppScreenShellProps = {
  header?: React.ReactNode;
  /** @deprecated Use `header` */
  hero?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  contentClassName?: string;
  /** Extra scroll bottom padding when a sticky footer is present (default 24). */
  footerScrollPadding?: number;
};

/** Light canvas layout: optional header + scrollable content + optional footer. */
export function AppScreenShell({
  header,
  hero,
  footer,
  children,
  scroll = true,
  scrollProps,
  contentClassName,
  footerScrollPadding = 24,
}: AppScreenShellProps) {
  const tabBarPadding = useTabBarScrollPadding();
  const bottomPad = footer ? footerScrollPadding : tabBarPadding;
  const screenHeader = header ?? hero;

  const {
    contentContainerClassName: scrollContentClassName,
    contentContainerStyle: scrollContentStyle,
    ...restScrollProps
  } = scrollProps ?? {};

  const content = (
    <View className={cn('min-h-0 gap-5', contentClassName)}>{children}</View>
  );

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn(
        'mx-auto w-full max-w-lg flex-grow px-5',
        scrollContentClassName
      )}
      contentContainerStyle={[{ paddingBottom: bottomPad }, scrollContentStyle]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      {...restScrollProps}
    >
      {content}
    </ScrollView>
  ) : (
    <View
      className={cn('mx-auto w-full max-w-lg flex-1 px-5', contentClassName)}
      style={{ paddingBottom: bottomPad }}
    >
      {content}
    </View>
  );

  return (
    <View className="bg-background flex-1 px-4">
      {screenHeader}
      <View className="min-h-0 flex-1">{body}</View>
      {footer ? <ScreenFooter>{footer}</ScreenFooter> : null}
    </View>
  );
}

/** @deprecated Use ScreenHeader */
export const ScreenHero = ScreenHeader;

export { ScreenHeader, SheetSurface };
