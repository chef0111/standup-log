import { Text } from '@/components/ui/text';
import * as React from 'react';
import { useStandup } from '../context/standup';

export function StandupOfflineBanner() {
  const { offlineBanner } = useStandup();

  if (!offlineBanner) {
    return null;
  }

  return (
    <Text className="text-muted-foreground text-center text-sm">
      {offlineBanner}
    </Text>
  );
}
