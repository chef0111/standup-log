import { Text } from '@/components/ui/text';
import { Image, type ImageSource } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';
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
          className="absolute inset-0 h-full w-full"
          contentFit="cover"
          transition={200}
        />
        <HeroImageMask />

        <View
          className="flex-1 items-center justify-end gap-8 px-8 pb-10"
          style={{ paddingTop: insets.top + 24 }}
        >
          <View className="items-center gap-6">
            <View className="flex-row items-center gap-2.5">
              <View className="size-9 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Text className="text-base font-bold text-white">S</Text>
              </View>
              <Text className="text-xl font-semibold tracking-tight text-white">
                StandupLog
              </Text>
            </View>

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

      <View
        className="-mt-5 gap-10 rounded-t-[40px] bg-white px-6 pt-9"
        style={{
          paddingBottom: Math.max(insets.bottom, 28),
          borderCurve: 'continuous',
        }}
      >
        {children}
      </View>
    </View>
  );
}
