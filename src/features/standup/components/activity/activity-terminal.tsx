import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { GithubRateLimitBanner } from '@/features/standup/components/activity/github-rate-limit-banner';
import { TerminalSurface } from '@/features/standup/components/terminal-surface';
import {
  SYMBOL_STYLES,
  WORK_TYPE_BADGE_CLASS,
  WORK_TYPE_BADGE_TEXT_CLASS,
} from '@/features/standup/config/work-type';
import { groupCommitsByRepo } from '@/features/standup/lib/activity/group-commits-by-repo';
import { commitFirstLine } from '@/features/standup/lib/activity/parse-commit-work-type';
import {
  resolveCommitWorkType,
  type WorkTypeDisplay,
} from '@/features/standup/lib/activity/stored-work-type';
import {
  formatLogTime,
  formatWorkdayTitle,
} from '@/features/standup/lib/format-standup';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';
import { TERMINAL_COLORS } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

type ActivityTerminalProps = {
  className?: string;
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
  onEditWorkType?: (commit: ActivityCommitRow) => void;
  rateLimitResetAt?: number | null;
};

function WorkTypeBadge({
  display,
  onPress,
}: {
  display: WorkTypeDisplay;
  onPress?: () => void;
}) {
  const badge = (
    <Badge
      variant="outline"
      className={cn('px-2 py-0.5', WORK_TYPE_BADGE_CLASS[display.type])}
    >
      <Text
        selectable
        className={cn(
          'font-mono text-[10px] leading-none',
          WORK_TYPE_BADGE_TEXT_CLASS[display.type]
        )}
      >
        {display.label}
      </Text>
    </Badge>
  );

  if (!onPress) {
    return badge;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {badge}
    </Pressable>
  );
}

const ActivityLogLine = React.memo(function ActivityLogLine({
  item,
  onEditWorkType,
}: {
  item: ActivityCommitRow;
  onEditWorkType?: (commit: ActivityCommitRow) => void;
}) {
  const workType = resolveCommitWorkType(item);
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
        {workType ? (
          <WorkTypeBadge
            display={workType}
            onPress={onEditWorkType ? () => onEditWorkType(item) : undefined}
          />
        ) : onEditWorkType ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onEditWorkType(item)}
          >
            <Text className="text-terminal-muted font-mono text-[10px]">
              + type
            </Text>
          </Pressable>
        ) : null}
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

function RepoSectionHeader({
  repositoryFullName,
}: {
  repositoryFullName: string;
}) {
  const shortName = repositoryFullName.split('/').pop() ?? repositoryFullName;

  return (
    <View className="border-terminal-border bg-terminal-title/80 -mx-3 border-y px-3 py-2 first:border-t-0">
      <Text
        selectable
        className="text-terminal-foreground font-mono text-xs font-semibold"
        numberOfLines={1}
      >
        {shortName}
      </Text>
      {shortName !== repositoryFullName ? (
        <Text
          selectable
          className="text-terminal-muted font-mono text-[10px]"
          numberOfLines={1}
        >
          {repositoryFullName}
        </Text>
      ) : null}
    </View>
  );
}

function ActivityCommitList({
  commits,
  groupByRepo,
  onEditWorkType,
}: {
  commits: ActivityCommitRow[];
  groupByRepo: boolean;
  onEditWorkType?: (commit: ActivityCommitRow) => void;
}) {
  if (!groupByRepo) {
    return (
      <>
        {commits.map((item) => (
          <ActivityLogLine
            key={item.sha}
            item={item}
            onEditWorkType={onEditWorkType}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {groupCommitsByRepo(commits).map((group) => (
        <View key={group.repositoryFullName}>
          <RepoSectionHeader repositoryFullName={group.repositoryFullName} />
          {group.commits.map((item) => (
            <ActivityLogLine
              key={item.sha}
              item={item}
              onEditWorkType={onEditWorkType}
            />
          ))}
        </View>
      ))}
    </>
  );
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
  onEditWorkType,
  rateLimitResetAt,
  className,
}: ActivityTerminalProps) {
  const rateLimited = rateLimitResetAt != null && rateLimitResetAt > Date.now();
  const refreshDisabled = syncing || tokenLoading || !hasToken || rateLimited;
  const uniqueRepoCount = new Set(
    commits.map((commit) => commit.repository_full_name)
  ).size;
  const groupByRepo = uniqueRepoCount > 1;
  return (
    <TerminalSurface
      className={cn(
        'border-terminal-border overflow-hidden rounded-lg border',
        className
      )}
    >
      <TerminalTitleBar
        workday={workday}
        syncing={syncing}
        disabled={refreshDisabled}
        onRefresh={onRefresh}
      />
      <TerminalBody>
        {rateLimited && rateLimitResetAt ? (
          <GithubRateLimitBanner resetAt={rateLimitResetAt} />
        ) : null}
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
            <ActivityIndicator color={TERMINAL_COLORS.muted} />
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
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 256 }}
            showsVerticalScrollIndicator={false}
          >
            <View>
              <ActivityCommitList
                commits={commits}
                groupByRepo={groupByRepo}
                onEditWorkType={onEditWorkType}
              />
            </View>
          </ScrollView>
        )}
      </TerminalBody>
    </TerminalSurface>
  );
}
