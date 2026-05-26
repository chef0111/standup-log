import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  aggregateWeeklySummary,
  applyWeeklyPreviewGate,
} from '@/features/standup/lib/weekly/aggregate-weekly-summary';
import { getCurrentWeekBounds } from '@/features/standup/lib/weekly/week-bounds';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import {
  useWeekCommitsQuery,
  useWeekStandupsQuery,
} from '@/queries/weekly/use-week-queries';
import { Lock } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

function formatWeekLabel(weekStart: string, weekEnd: string): string {
  return `${weekStart} – ${weekEnd}`;
}

type WeeklySummaryViewProps = {
  onUpgrade?: () => void;
};

export function WeeklySummaryView({ onUpgrade }: WeeklySummaryViewProps) {
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);
  const profileQuery = useProfileQuery();
  const commitsQuery = useWeekCommitsQuery(bounds.weekStart, bounds.weekEnd);
  const standupsQuery = useWeekStandupsQuery(bounds.weekStart, bounds.weekEnd);

  const loading =
    profileQuery.isLoading ||
    commitsQuery.isLoading ||
    standupsQuery.isLoading;

  const error = React.useMemo(() => {
    for (const queryError of [
      profileQuery.error,
      commitsQuery.error,
      standupsQuery.error,
    ]) {
      if (queryError instanceof Error) {
        return queryError.message;
      }
    }
    return null;
  }, [commitsQuery.error, profileQuery.error, standupsQuery.error]);

  const isPro = Boolean(profileQuery.data?.is_pro);
  const summary = React.useMemo(() => {
    if (!commitsQuery.data || !standupsQuery.data) {
      return null;
    }
    const aggregated = aggregateWeeklySummary({
      commits: commitsQuery.data,
      standups: standupsQuery.data,
    });
    return applyWeeklyPreviewGate(aggregated, isPro);
  }, [commitsQuery.data, isPro, standupsQuery.data]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <Text selectable className="text-destructive text-sm">
        {error}
      </Text>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <View className="flex flex-col gap-5">
      <Text selectable className="text-muted-foreground text-sm">
        {formatWeekLabel(bounds.weekStart, bounds.weekEnd)} ·{' '}
        {summary.totalCommits} commits · {summary.copiedWorkdays.length} copied
        standups
      </Text>

      {summary.visibleBuckets.length === 0 ? (
        <Card variant="elevated" className="p-5">
          <Text selectable className="text-muted-foreground text-sm">
            No activity this week yet. Generate standups to build your Weekly
            Summary.
          </Text>
        </Card>
      ) : (
        summary.visibleBuckets.map((bucket) => (
          <Card
            key={bucket.workType}
            variant="elevated"
            className={bucket.locked ? 'opacity-60' : undefined}
          >
            <CardHeader>
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-2">
                  <CardTitle className="capitalize">
                    {bucket.workType}
                  </CardTitle>
                  {bucket.locked ? (
                    <Icon
                      as={Lock}
                      size={16}
                      className="text-muted-foreground"
                    />
                  ) : null}
                </View>
                <Badge variant="secondary">
                  <Text>{bucket.commitCount}</Text>
                </Badge>
              </View>
              <CardDescription selectable>
                {bucket.standupWorkdays.length} workday
                {bucket.standupWorkdays.length === 1 ? '' : 's'} with activity
              </CardDescription>
            </CardHeader>
            {bucket.locked ? (
              <CardContent>
                <Button variant="charcoal" size="pill" onPress={onUpgrade}>
                  <Text>Upgrade to Pro</Text>
                </Button>
              </CardContent>
            ) : null}
          </Card>
        ))
      )}

      {!isPro && summary.lockedCount > 0 ? (
        <Text selectable className="text-muted-foreground text-xs">
          {summary.lockedCount} more Work Type
          {summary.lockedCount === 1 ? '' : 's'} hidden on free tier.
        </Text>
      ) : null}
    </View>
  );
}
