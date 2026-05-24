import { Text } from '@/components/ui/text';
import { BrandLockup } from '@/features/shell/components/brand-lockup';
import { SheetSurface } from '@/features/shell/components/sheet-surface';
import { Image, type ImageSource } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroImageMask } from './hero-image-mask';

const SIGN_IN_HERO_IMAGE: ImageSource = require('@/assets/images/sign-in-hero.png');

type SignInLandingProps = {
  children: React.ReactNode;
  activeSlideIndex?: number;
  slideCount?: number;
};

function PageIndicators({
  activeIndex,
  count,
}: {
  activeIndex: number;
  count: number;
}) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className={
            index === activeIndex
              ? 'h-1.5 w-7 rounded-full bg-white'
              : 'size-1.5 rounded-full bg-white/35'
          }
        />
      ))}
    </View>
  );
}

export function SignInLanding({
  children,
  activeSlideIndex = 1,
  slideCount = 4,
}: SignInLandingProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <View className="relative min-h-[60%] flex-1 overflow-hidden">
        <Image
          source={SIGN_IN_HERO_IMAGE}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel="Developer at a desk with monitors"
        />
        <HeroImageMask />

        <View
          className="flex-1 items-center justify-end gap-8 px-8 pb-10"
          style={{ paddingTop: insets.top + 24 }}
        >
          <View className="items-center gap-6">
            <BrandLockup />

            <View className="items-center gap-0.5">
              <Text className="text-center text-[28px] font-black uppercase leading-tight tracking-wide text-white">
                Daily standups
              </Text>
              <Text className="text-center text-[28px] font-black uppercase leading-tight tracking-wide text-white">
                from your work
              </Text>
            </View>
          </View>

          <PageIndicators activeIndex={activeSlideIndex} count={slideCount} />
        </View>
      </View>

      <SheetSurface
        className="gap-10 bg-white px-6 pt-9 dark:bg-white"
        overlap
        padded={false}
        style={{ paddingBottom: Math.max(insets.bottom, 28) }}
      >
        {children}
      </SheetSurface>
    </View>
  );
}
