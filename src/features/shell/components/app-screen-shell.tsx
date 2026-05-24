import { ScreenFooter } from '@/features/shell/components/screen-footer';
import { ScreenHeader } from '@/features/shell/components/screen-hero';
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
}: AppScreenShellProps) {
  const tabBarPadding = useTabBarScrollPadding();
  const bottomPad = footer ? 0 : tabBarPadding;
  const screenHeader = header ?? hero;

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn(
        'mx-auto w-full max-w-lg flex-grow gap-5 px-5',
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
        'mx-auto w-full max-w-lg flex-1 gap-5 px-5',
        contentClassName
      )}
      style={{ paddingBottom: bottomPad }}
    >
      {children}
    </View>
  );

  return (
    <View className="bg-background flex-1">
      {screenHeader}
      <View className="min-h-0 flex-1">{body}</View>
      {footer ? <ScreenFooter>{footer}</ScreenFooter> : null}
    </View>
  );
}

export { ScreenHeader, ScreenHero, SheetSurface };
