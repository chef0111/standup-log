import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  commitFirstLine,
  parseCommitWorkType,
  type CommitWorkType,
  type ParsedCommitWorkType,
} from '@/features/activity/lib/parse-commit-work-type';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import type { Workday } from '@/features/workday/types/workday';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

type ActivityTerminalProps = {
  workday: Workday;
  commits: ActivityCommitRow[];
  loading?: boolean;
  syncing?: boolean;
  tokenLoading?: boolean;
  hasToken?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRefresh?: () => void;
  onReconnect?: () => void;
  onManageRepos?: () => void;
};

const WORK_TYPE_BADGE_CLASS: Record<CommitWorkType, string> = {
  feature: 'border-transparent bg-green-500/20',
  bug: 'border-transparent bg-destructive/15',
  refactor: 'border-transparent bg-blue-500/20',
  chore: 'border-transparent bg-muted',
  style: 'border-transparent bg-amber-500/20',
};

const WORK_TYPE_BADGE_TEXT_CLASS: Record<CommitWorkType, string> = {
  feature: 'text-green-500',
  bug: 'text-destructive',
  refactor: 'text-blue-500',
  chore: 'text-muted-foreground',
  style: 'text-amber-500',
};

const SYMBOL_STYLES: Record<ParsedCommitWorkType['symbol'], string> = {
  '+': 'text-green-500',
  '!': 'text-destructive',
  '~': 'text-blue-500',
  $: 'text-amber-500',
};

function formatLogTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

function formatWorkdayTitle(workday: Workday): string {
  const [year, month, day] = workday.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function WorkTypeBadge({ label }: { label: CommitWorkType }) {
  return (
    <Badge
      variant="outline"
      className={cn('px-2 py-0.5', WORK_TYPE_BADGE_CLASS[label])}
    >
      <Text
        selectable
        className={cn(
          'font-mono text-[10px] leading-none',
          WORK_TYPE_BADGE_TEXT_CLASS[label]
        )}
      >
        {label}
      </Text>
    </Badge>
  );
}

const ActivityLogLine = React.memo(function ActivityLogLine({
  item,
}: {
  item: ActivityCommitRow;
}) {
  const workType = parseCommitWorkType(item.message);
  const summary = commitFirstLine(item.message);

  return (
    <View className="border-terminal-border/60 gap-1 border-b py-2.5">
      <View className="flex-row items-center gap-2">
        <Text
          selectable
          className="text-terminal-muted w-11 font-mono text-xs tabular-nums"
        >
          {formatLogTime(item.committed_at)}
        </Text>
        <Text
          selectable
          className={cn(
            'w-3 text-center font-mono text-xs',
            workType ? SYMBOL_STYLES[workType.symbol] : 'text-terminal-muted'
          )}
        >
          {workType?.symbol ?? '·'}
        </Text>
        <Text
          selectable
          className="text-terminal-foreground min-w-0 flex-1 font-mono text-xs leading-snug"
          numberOfLines={2}
        >
          {summary}
        </Text>
        {workType ? <WorkTypeBadge label={workType.label} /> : null}
      </View>
      {item.pr_number != null ? (
        <Text
          selectable
          className="text-terminal-muted pl-14 font-mono text-xs leading-snug"
          numberOfLines={1}
        >
          PR #{item.pr_number}
          {item.pr_title ? `: ${item.pr_title}` : ''}
        </Text>
      ) : null}
    </View>
  );
});

function TerminalTitleBar({
  workday,
  syncing,
  disabled,
  onRefresh,
}: {
  workday: Workday;
  syncing?: boolean;
  disabled?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <View className="bg-terminal-title border-terminal-border flex-row items-center gap-3 border-b px-3 py-2.5">
      <View className="flex-row items-center gap-1.5">
        <View className="bg-destructive size-2.5 rounded-full" />
        <View className="size-2.5 rounded-full bg-yellow-500" />
        <View className="size-2.5 rounded-full bg-green-500" />
      </View>
      <Text
        selectable
        className="text-terminal-muted min-w-0 flex-1 text-center font-mono text-xs"
        numberOfLines={1}
      >
        StandupLog — {formatWorkdayTitle(workday)}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={disabled || syncing}
        accessibilityLabel="Refresh activity"
        onPress={onRefresh}
      >
        {syncing ? (
          <ButtonSpinner />
        ) : (
          <Icon as={RefreshCw} className="text-terminal-muted" size={14} />
        )}
      </Button>
    </View>
  );
}

function TerminalBody({ children }: { children: React.ReactNode }) {
  return <View className="bg-terminal px-3 py-2">{children}</View>;
}

export function ActivityTerminal({
  workday,
  commits,
  loading,
  syncing,
  tokenLoading,
  hasToken = true,
  error,
  emptyMessage,
  onRefresh,
  onReconnect,
  onManageRepos,
}: ActivityTerminalProps) {
  const refreshDisabled = syncing || tokenLoading || !hasToken;

  return (
    <View className="border-terminal-border overflow-hidden rounded-lg border">
      <TerminalTitleBar
        workday={workday}
        syncing={syncing}
        disabled={refreshDisabled}
        onRefresh={onRefresh}
      />
      <TerminalBody>
        {!hasToken && !tokenLoading ? (
          <View className="gap-3 py-4">
            <Text selectable className="text-terminal-muted font-mono text-xs">
              $ gh auth status
            </Text>
            <Text selectable className="text-destructive font-mono text-xs">
              ! GitHub access unavailable — reconnect to sync commits.
            </Text>
            <View className="gap-2">
              <Button variant="outline" size="sm" onPress={onReconnect}>
                <Text>Reconnect GitHub</Text>
              </Button>
              <Button variant="ghost" size="sm" onPress={onManageRepos}>
                <Text>Manage repositories</Text>
              </Button>
            </View>
          </View>
        ) : loading || (syncing && commits.length === 0) ? (
          <View className="items-center py-8">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Text selectable className="text-destructive py-4 font-mono text-xs">
            ! {error}
          </Text>
        ) : commits.length === 0 ? (
          <Text
            selectable
            className="text-terminal-muted py-4 font-mono text-xs"
          >
            $ tail activity.log{'\n'}
            {'// '}
            {emptyMessage ?? 'No commits for this Workday yet.'}
          </Text>
        ) : (
          <View>
            {commits.map((item) => (
              <ActivityLogLine key={item.sha} item={item} />
            ))}
          </View>
        )}
      </TerminalBody>
    </View>
  );
}
