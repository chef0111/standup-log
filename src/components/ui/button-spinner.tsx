import { Icon } from '@/components/ui/icon';
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

export function ButtonSpinner({ color, size = 20 }: ButtonSpinnerProps) {
  const rotation = useSharedValue(0);

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
        <Icon as={Loader} size={size} color={color} />
      </Animated.View>
    </View>
  );
}
