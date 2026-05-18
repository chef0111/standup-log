import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AppHomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text variant="h3" className="text-center text-foreground">
          Signed in
        </Text>
        <Text className="text-center text-muted-foreground">
          Standup generation and repo selection arrive in later phases. You can use the rest of the shell to validate
          navigation.
        </Text>
      </View>
    </>
  );
}
