import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFloatingTabBarInset } from '../lib/tab-bar-metrics';

/** Scroll padding so bottom actions stay above the floating tab bar. */
export function useTabBarScrollPadding(additional = 16) {
  const { bottom } = useSafeAreaInsets();
  return getFloatingTabBarInset(bottom, additional);
}
