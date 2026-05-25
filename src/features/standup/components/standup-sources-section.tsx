import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { StandupActivitySection } from '@/features/standup/components/standup-activity-section';
import { StandupNotesSection } from '@/features/standup/components/standup-notes-section';
import { ChevronDown, RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useStandup } from '../context/standup';

function formatLastSynced(syncedAt: string | null): string | null {
  if (!syncedAt) {
    return null;
  }
  const date = new Date(syncedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function readLatestSyncedAt(
  commits: { synced_at: string | null }[]
): string | null {
  let latest: string | null = null;
  for (const commit of commits) {
    if (!commit.synced_at) {
      continue;
    }
    if (!latest || commit.synced_at > latest) {
      latest = commit.synced_at;
    }
  }
  return latest;
}

export function StandupSourcesSection() {
  const {
    commits,
    notes,
    loading,
    syncing,
    tokenLoading,
    token,
    refreshActivity,
  } = useStandup();

  const [open, setOpen] = React.useState(true);

  const sourceCount = commits.length + notes.length;
  const lastSyncedLabel = formatLastSynced(readLatestSyncedAt(commits));
  const refreshDisabled = syncing || tokenLoading || !token;

  return (
    <Card variant="elevated" className="gap-3 p-5">
      <View className="flex-row items-start justify-between gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((value) => !value)}
          className="min-h-11 min-w-0 flex-1 gap-0.5"
        >
          <Text className="text-foreground text-base font-semibold">
            Sources
          </Text>
          <Text className="text-muted-foreground text-xs">
            Activity and notes for this Workday
            {sourceCount > 0 ? ` · ${sourceCount}` : ''}
            {lastSyncedLabel ? ` · synced ${lastSyncedLabel}` : ''}
          </Text>
        </Pressable>
        <View className="flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={refreshDisabled}
            accessibilityLabel="Refresh GitHub activity"
            onPress={refreshActivity}
          >
            {syncing ? (
              <ButtonSpinner />
            ) : (
              <Icon
                as={RefreshCw}
                size={16}
                className="text-muted-foreground"
              />
            )}
          </Button>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((value) => !value)}
            className="h-9 w-9 items-center justify-center"
          >
            <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
              <Icon
                as={ChevronDown}
                size={18}
                className="text-muted-foreground"
              />
            </View>
          </Pressable>
        </View>
      </View>

      {open && (
        <View className="gap-4">
          <StandupActivitySection />
          <StandupNotesSection embedded />
        </View>
      )}

      {loading && !open && (
        <Text className="text-muted-foreground text-xs">Loading sources…</Text>
      )}
    </Card>
  );
}
