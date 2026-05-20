import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

const FREE_TIER_LIMIT = 5;

export function AiGenerationQuota() {
  const { isPro, aiRateLimited, aiRetryAfterSeconds } = useStandup();
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(
    aiRetryAfterSeconds
  );

  React.useEffect(() => {
    setSecondsLeft(aiRetryAfterSeconds);
  }, [aiRetryAfterSeconds]);

  React.useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value == null || value <= 1) {
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  if (isPro) {
    return null;
  }

  if (aiRateLimited && secondsLeft != null && secondsLeft > 0) {
    return (
      <View className="bg-destructive/10 rounded-md px-3 py-2">
        <Text className="text-destructive text-sm">
          Rate limit reached ({FREE_TIER_LIMIT} per minute). Try again in{' '}
          {secondsLeft}s.
        </Text>
      </View>
    );
  }

  return (
    <Text className="text-muted-foreground text-xs">
      Free: up to {FREE_TIER_LIMIT} AI generations per minute.
    </Text>
  );
}
