import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CircleCheck } from 'lucide-react-native';
import * as React from 'react';
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
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-muted-foreground text-center text-sm">
          {loadingMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
      <View className="border-border size-14 items-center justify-center rounded-full border">
        <Icon as={CircleCheck} size={32} className="text-foreground" />
      </View>
      <View className="max-w-sm items-center gap-1">
        <Text
          variant="h3"
          className="text-foreground border-0 pb-0 text-center tracking-tight"
        >
          {successTitle}
        </Text>
        <Text className="text-muted-foreground text-center text-sm">
          {successDetail}
        </Text>
      </View>
    </View>
  );
}
