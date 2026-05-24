import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { useHomeActivity } from '@/features/home/hooks/use-home-activity';
import { ActivityTerminal } from '@/features/standup/components/activity/activity-terminal';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

export function HomeActivitySection() {
  const router = useRouter();
  const {
    workday,
    commits,
    loading,
    syncing,
    error,
    rateLimitResetAt,
    token,
    tokenLoading,
    refresh,
  } = useHomeActivity();

  return (
    <Card variant="elevated" className="gap-3 p-5">
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({ pathname: '/standup', params: { workday } })
        }
        className="min-h-11 flex-row items-center justify-between gap-2"
      >
        <Text className="text-foreground text-base font-semibold">
          Today&apos;s activity
        </Text>
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </Pressable>
      <View>
        <ActivityTerminal
          workday={workday}
          commits={commits}
          loading={loading}
          syncing={syncing}
          tokenLoading={tokenLoading}
          hasToken={Boolean(token)}
          error={error}
          rateLimitResetAt={rateLimitResetAt}
          onRefresh={() => void refresh()}
          onReconnect={() => void signInWithGitHub()}
          onManageRepos={() => router.push('/settings/repositories')}
          className="max-h-64"
        />
      </View>
    </Card>
  );
}
