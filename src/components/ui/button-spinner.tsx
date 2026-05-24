import { TextClassContext } from '@/components/ui/text';
import { useAppColorScheme } from '@/context/theme';
import { THEME_COLORS } from '@/lib/theme-colors';
import { Loader } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SLOT_SIZE = 20;

type ButtonSpinnerProps = {
  color?: string;
  size?: number;
};

function useSpinnerColor(explicit?: string): string {
  const textClass = React.useContext(TextClassContext) ?? '';
  const { colorScheme } = useAppColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = THEME_COLORS[scheme];

  if (explicit) {
    return explicit;
  }
  if (textClass.includes('primary-foreground')) {
    return colors.primaryForeground;
  }
  if (textClass.includes('secondary-foreground')) {
    return colors.foreground;
  }
  if (textClass.includes('dark:text-zinc-900')) {
    return scheme === 'dark' ? '#18181b' : '#ffffff';
  }
  if (textClass.includes('text-white')) {
    return '#ffffff';
  }
  return colors.foreground;
}

export function ButtonSpinner({ color, size = 20 }: ButtonSpinnerProps) {
  const rotation = useSharedValue(0);
  const resolvedColor = useSpinnerColor(color);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      className="items-center justify-center"
      style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
    >
      <Animated.View style={animatedStyle}>
        <Loader size={size} color={resolvedColor} />
      </Animated.View>
    </View>
  );
}
