import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import {
  AppScreenShell,
  ScreenHero,
} from '@/features/shell/components/app-screen-shell';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { StandupMarkdownView } from '@/features/standup/components/standup-markdown-view';
import { StandupQuickEditSheet } from '@/features/standup/components/standup-quick-edit-sheet';
import { useStandupCopy } from '@/features/standup/hooks/use-standup-copy';
import { isStandupSummaryReady, formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import {
  defaultTargetWorkday,
  parseWorkdayParam,
} from '@/features/standup/lib/workday/workday';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function StandupReadScreen() {
  const { workday: workdayParam } = useLocalSearchParams<{
    workday?: string;
  }>();
  const workday = parseWorkdayParam(workdayParam) ?? defaultTargetWorkday();
  const { supabase, session } = useAuth();
  const [markdown, setMarkdown] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const tabBarPadding = useTabBarScrollPadding();

  const [sessionCopyFormat, setSessionCopyFormat] =
    React.useState<CopyFormat | null>(null);

  const { copying, toastMessage, copySummary, copyFull, copyFormat } =
    useStandupCopy(workday ?? '', markdown, {
      formatOverride: sessionCopyFormat,
    });

  const load = React.useCallback(async () => {
    if (!supabase || !workday) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { standup, error: loadError } = await fetchStandupUpdate(
      supabase,
      workday
    );
    setMarkdown(standup?.draft_markdown ?? '');
    setError(loadError);
    setLoading(false);
  }, [supabase, workday]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!workday) {
    return (
      <>
        <Stack.Screen options={{ title: 'Standup' }} />
        <View className="flex-1 items-center justify-center p-6">
          <Text selectable className="text-destructive text-sm">
            Invalid Workday.
          </Text>
        </View>
      </>
    );
  }

  const summaryReady = isStandupSummaryReady(markdown);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Standup',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setEditOpen(true)}
              >
                <Text className="text-sm text-white">Edit</Text>
              </Button>
            </View>
          ),
        }}
      />
      <AppScreenShell
        hero={
          <ScreenHero
            eyebrow="Standup"
            title={formatWorkdayHeading(workday)}
            subtitle="Read-only view of your saved draft."
          />
        }
        footer={
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                disabled={copying || !summaryReady}
                onPress={() => void copySummary()}
                className="min-h-12 flex-1"
              >
                <Text>Copy summary</Text>
              </Button>
              <Button
                size="pill"
                disabled={copying}
                onPress={copyFull}
                className="min-h-12 flex-1"
              >
                <Text>Copy full</Text>
              </Button>
            </View>
            <View className="gap-1.5">
              <Text className="text-muted-foreground text-xs">Copy format</Text>
              <CopyFormatPicker
                value={copyFormat}
                onChange={setSessionCopyFormat}
                disabled={copying}
              />
            </View>
            <CopyToast message={toastMessage} />
          </View>
        }
        scrollProps={{
          contentContainerStyle: { paddingBottom: tabBarPadding + 24 },
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text selectable className="text-destructive text-sm">
            {error}
          </Text>
        ) : (
          <StandupMarkdownView markdown={markdown} />
        )}
      </AppScreenShell>

      {supabase && session ? (
        <StandupQuickEditSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          workday={workday}
          markdown={markdown}
          supabase={supabase}
          userId={session.user.id}
          onSaved={(next) => {
            setMarkdown(next);
            void load();
          }}
        />
      ) : null}
    </>
  );
}
