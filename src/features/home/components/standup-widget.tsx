import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { useStandupWidgetData } from '@/features/home/hooks/use-standup-widget-data';
import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import {
  formatStandupSummaryForCopy,
  normalizeCopyFormat,
} from '@/features/standup/lib/format-standup';
import { recordStandupCopy } from '@/features/standup/lib/record-standup-copy';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function StandupWidget() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const {
    workday,
    profile,
    hasStandup,
    copied,
    summaryExcerpt,
    summaryReady,
    loading,
    error,
  } = useStandupWidgetData();
  const [copying, setCopying] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const onGenerate = () => {
    router.push({ pathname: '/standup', params: { workday } });
  };

  const onView = () => {
    router.push({ pathname: '/standup/read', params: { workday } });
  };

  const onCopySummary = async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
    const { standup } = await fetchStandupUpdate(supabase, workday);
    const markdown = standup?.draft_markdown ?? '';
    try {
      const format = normalizeCopyFormat(profile?.default_copy_format);
      await Clipboard.setStringAsync(
        formatStandupSummaryForCopy(markdown, format)
      );
      const { streakIncremented } = await recordStandupCopy(
        supabase,
        session.user.id,
        workday,
        markdown,
        format
      );
      setToast(
        streakIncremented ? 'Summary copied · Streak +1' : 'Summary copied'
      );
    } catch {
      setToast('Could not copy. Try again.');
    } finally {
      setCopying(false);
    }
  };

  React.useEffect(() => {
    if (!toast) {
      return;
    }
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <Card variant="inset" className="gap-0 overflow-hidden p-0">
      <CardHeader className="gap-2 p-5 pb-3">
        <View className="flex-row items-center justify-between gap-2">
          <CardTitle>Today&apos;s standup</CardTitle>
          {copied ? (
            <Badge variant="secondary">
              <Text>Copied</Text>
            </Badge>
          ) : null}
        </View>
        <CardDescription selectable>
          {formatWorkdayHeading(workday)}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-2 px-5 pb-3">
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text selectable className="text-destructive text-sm">
            {error}
          </Text>
        ) : hasStandup ? (
          <Text selectable className="text-foreground text-sm leading-relaxed">
            {summaryExcerpt ?? 'Draft saved — open to review or copy.'}
          </Text>
        ) : (
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            No standup yet for this Workday. Generate from commits and notes.
          </Text>
        )}
        {toast ? (
          <Text selectable className="text-success text-xs">
            {toast}
          </Text>
        ) : null}
      </CardContent>
      <CardFooter className="flex-row flex-wrap gap-2 p-5 pt-0">
        {hasStandup ? (
          <Button variant="outline" onPress={onView} className="min-w-[40%] flex-1">
            <Text>View</Text>
          </Button>
        ) : null}
        <Button
          size="pill"
          onPress={onGenerate}
          className="min-w-[40%] flex-1 bg-zinc-950 dark:bg-zinc-100"
        >
          <Text className="text-white dark:text-zinc-950">
            {hasStandup ? 'Edit' : 'Generate'}
          </Text>
        </Button>
        {summaryReady ? (
          <Button
            variant="outline"
            size="pill"
            disabled={copying}
            onPress={() => void onCopySummary()}
            className="w-full"
          >
            <Text>Copy summary</Text>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
