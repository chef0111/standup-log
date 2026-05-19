import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CircleCheck } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

type AuthStatusProps = {
  variant: 'loading' | 'success';
  loadingMessage?: string;
  successTitle?: string;
  successDetail?: string;
};

export function AuthStatusView({
  variant,
  loadingMessage = 'Completing sign-in…',
  successTitle = 'Signed in successfully',
  successDetail = 'Taking you to StandupLog…',
}: AuthStatusProps) {
  if (variant === 'loading') {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <ActivityIndicator size="large" />
        <Text className="text-center text-muted-foreground">{loadingMessage}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
      <View className="size-16 items-center justify-center rounded-full bg-primary/10">
        <Icon as={CircleCheck} size={36} className="text-primary" />
      </View>
      <View className="max-w-sm items-center gap-1">
        <Text variant="h3" className="text-center text-foreground">
          {successTitle}
        </Text>
        <Text className="text-center text-muted-foreground">{successDetail}</Text>
      </View>
    </View>
  );
}
