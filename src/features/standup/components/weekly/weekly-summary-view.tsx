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
import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/queries/lib/profile/fetch-user-profile';
import {
  aggregateWeeklySummary,
  applyWeeklyPreviewGate,
} from '@/features/standup/lib/weekly/aggregate-weekly-summary';
import {
  fetchActivityCommitsForWeek,
  fetchStandupsForWeek,
} from '@/features/standup/lib/weekly/fetch-standups-for-week';
import { getCurrentWeekBounds } from '@/features/standup/lib/weekly/week-bounds';
import { categorizeError, userFacingMessage } from '@/lib/errors';
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
  const { supabase, session } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPro, setIsPro] = React.useState(false);
  const [summary, setSummary] = React.useState<ReturnType<
    typeof applyWeeklyPreviewGate
  > | null>(null);
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);

  React.useEffect(() => {
    if (!supabase || !session) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [
        { profile },
        { commits, error: commitsError },
        { standups, error: standupsError },
      ] = await Promise.all([
        fetchUserProfile(supabase!, session!),
        fetchActivityCommitsForWeek(
          supabase!,
          bounds.weekStart,
          bounds.weekEnd
        ),
        fetchStandupsForWeek(supabase!, bounds.weekStart, bounds.weekEnd),
      ]);

      if (cancelled) {
        return;
      }

      const loadError = commitsError ?? standupsError;
      if (loadError) {
        setError(userFacingMessage(categorizeError(loadError)));
        setLoading(false);
        return;
      }

      const pro = Boolean(profile?.is_pro);
      setIsPro(pro);
      const aggregated = aggregateWeeklySummary({ commits, standups });
      setSummary(applyWeeklyPreviewGate(aggregated, pro));
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [bounds.weekEnd, bounds.weekStart, session, supabase]);

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
