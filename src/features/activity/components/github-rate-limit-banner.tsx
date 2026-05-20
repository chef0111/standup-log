import { Text } from '@/components/ui/text';
import { formatResetTime } from '@/features/activity/lib/github-rate-limit';
import * as React from 'react';
import { View } from 'react-native';

type GithubRateLimitBannerProps = {
  resetAt: number;
};

export function GithubRateLimitBanner({ resetAt }: GithubRateLimitBannerProps) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((resetAt - now) / 1000));

  return (
    <View className="border-destructive/30 bg-destructive/10 rounded-md border px-3 py-2">
      <Text selectable className="text-destructive text-xs leading-relaxed">
        GitHub rate limit active. Sync again in {secondsLeft}s (after{' '}
        {formatResetTime(resetAt)}).
      </Text>
    </View>
  );
}
