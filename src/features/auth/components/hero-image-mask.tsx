import * as React from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

type Size = { width: number; height: number };

/**
 * Vignette + bottom fade over the sign-in hero image.
 * SVG renders reliably on web and native (CSS radial masks often do not).
 */
export function HeroImageMask() {
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 });

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <RadialGradient
              id="heroVignette"
              cx="50%"
              cy="34%"
              rx="72%"
              ry="58%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
              <Stop offset="42%" stopColor="#000000" stopOpacity={0.15} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.62} />
            </RadialGradient>
            <LinearGradient id="heroBottomFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
              <Stop offset="45%" stopColor="#000000" stopOpacity={0.15} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.68} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fill="url(#heroVignette)"
          />
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fill="url(#heroBottomFade)"
          />
        </Svg>
      ) : null}
    </View>
  );
}
