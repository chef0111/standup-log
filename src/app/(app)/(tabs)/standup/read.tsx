import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { ProfileAvatar } from '@/features/profile/components/profile-avatar';
import { useProfileHeader } from '@/features/profile/hooks/use-profile-header';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { StandupMarkdownView } from '@/features/standup/components/standup-markdown-view';
import { useStandupCopy } from '@/features/standup/hooks/use-standup-copy';
import {
  formatWorkdayHeading,
  isStandupSummaryReady,
} from '@/features/standup/lib/compose-standup-markdown';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import {
  defaultTargetWorkday,
  parseWorkdayParam,
} from '@/features/standup/lib/workday/workday';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function StandupReadScreen() {
  const router = useRouter();
  const { workday: workdayParam } = useLocalSearchParams<{
    workday?: string;
  }>();
  const workday = parseWorkdayParam(workdayParam) ?? defaultTargetWorkday();
  const { supabase } = useAuth();
  const [markdown, setMarkdown] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { displayName, avatarUrl } = useProfileHeader();
  const primary = useThemeColor('--color-primary');

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

  const onEdit = React.useCallback(() => {
    router.navigate({
      pathname: '/(app)/(tabs)/standup',
      params: { workday },
    });
  }, [router, workday]);

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
          headerShown: true,
          headerShadowVisible: false,
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Button variant="ghost" onPress={onEdit}>
                <Text>Edit</Text>
              </Button>
            </View>
          ),
        }}
      />
      <AppScreenShell
        header={
          <ScreenHeader
            eyebrow="Standup"
            className="-mt-12"
            title={formatWorkdayHeading(workday)}
            subtitle="Read-only view of your saved draft."
            showThemeToggle={false}
            trailing={
              <ProfileAvatar
                avatarUrl={avatarUrl}
                displayName={displayName}
                size="sm"
              />
            }
          />
        }
        footer={
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                size="pill"
                disabled={copying || !summaryReady}
                onPress={() => void copySummary()}
                className="min-h-12 flex-1"
              >
                {copying && <ButtonSpinner />}
                <Text>Copy summary</Text>
              </Button>
              <Button
                variant="charcoal"
                size="pill"
                disabled={copying}
                onPress={copyFull}
                className="min-h-12 flex-1"
              >
                {copying && <ButtonSpinner />}
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
      >
        {loading ? (
          <View className="h-120 flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : error ? (
          <Text selectable className="text-destructive text-sm">
            {error}
          </Text>
        ) : (
          <Card variant="elevated" className="overflow-auto p-5">
            <StandupMarkdownView markdown={markdown} />
          </Card>
        )}
      </AppScreenShell>
    </>
  );
}
