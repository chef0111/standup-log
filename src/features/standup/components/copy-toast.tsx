import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

type CopyToastProps = {
  message: string | null;
};

export function CopyToast({ message }: CopyToastProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!message) {
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !message) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      className="absolute bottom-4 left-4 right-4 items-center"
    >
      <View className="bg-foreground/90 rounded-full px-4 py-2">
        <Text className="text-background text-sm font-medium">{message}</Text>
      </View>
    </View>
  );
}
