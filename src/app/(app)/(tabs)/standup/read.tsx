import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { StandupMarkdownView } from '@/features/standup/components/standup-markdown-view';
import { StandupQuickEditSheet } from '@/features/standup/components/standup-quick-edit-sheet';
import { isStandupSummaryReady } from '@/features/standup/lib/compose-standup-markdown';
import { useStandupCopy } from '@/features/standup/hooks/use-standup-copy';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import { parseWorkdayParam, defaultTargetWorkday } from '@/features/workday';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function StandupReadScreen() {
  const { workday: workdayParam } = useLocalSearchParams<{ workday?: string }>();
  const workday =
    parseWorkdayParam(workdayParam) ?? defaultTargetWorkday();
  const { supabase, session } = useAuth();
  const [markdown, setMarkdown] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const { copying, toastMessage, copySummary, copyFull } = useStandupCopy(
    workday ?? '',
    markdown
  );

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
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={copying || !summaryReady}
                onPress={() => void copySummary()}
              >
                <Text className="text-sm">Summary</Text>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={copying}
                onPress={copyFull}
              >
                <Text className="text-sm">Copy</Text>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setEditOpen(true)}
              >
                <Text className="text-sm">Edit</Text>
              </Button>
            </View>
          ),
        }}
      />
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-8 pt-2"
        contentInsetAdjustmentBehavior="automatic"
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
      </ScrollView>

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

      <CopyToast message={toastMessage} />
    </>
  );
}
