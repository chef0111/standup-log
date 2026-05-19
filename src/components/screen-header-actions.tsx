import { ThemeToggle } from '@/components/theme-toggle';
import { View } from 'react-native';

export function ScreenHeaderActions() {
  return (
    <View className="mr-2">
      <ThemeToggle />
    </View>
  );
}
