import { RepositoryList } from '@/components/repository-list';
import { ScreenFooter } from '@/components/screen-footer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { GithubRepoRow } from '@/lib/github-repos';
import { FREE_TIER_REPO_LIMIT, type SelectedRepository } from '@/types/repository';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Platform, TextInput, View } from 'react-native';

type RepositoryPickerScreenProps = {
  title: string;
  description: string;
  isPro: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  filtered: GithubRepoRow[];
  selected: SelectedRepository[];
  selectedIds: ReadonlySet<number>;
  onToggle: (repo: GithubRepoRow) => void;
  loadingRepos: boolean;
  loadError: string | null;
  onRetryLoad?: () => void;
  onReconnectGitHub?: () => void;
  saveError: string | null;
  saving: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  outlineLabel?: string;
  onOutline?: () => void;
};

export function RepositoryPickerScreen({
  title,
  description,
  isPro,
  query,
  onQueryChange,
  filtered,
  selected,
  selectedIds,
  onToggle,
  loadingRepos,
  loadError,
  onRetryLoad,
  onReconnectGitHub,
  saveError,
  saving,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  outlineLabel,
  onOutline,
}: RepositoryPickerScreenProps) {
  const insets = useSafeAreaInsets();
  const limit = isPro ? null : FREE_TIER_REPO_LIMIT;
  const selectedCount = selected.length;

  return (
    <View className="flex-1 bg-background">
      <View className="gap-4 border-b border-border bg-card/40 px-4 pb-4 pt-2">
        <View className="gap-1">
          <Text variant="h3" className="border-0 pb-0 text-foreground">
            {title}
          </Text>
          <Text className="text-sm leading-relaxed text-muted-foreground">{description}</Text>
        </View>

        <View className="flex-row items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
          <Text className="text-sm text-muted-foreground">Selected</Text>
          <Text className="text-sm font-semibold text-foreground">
            {selectedCount}
            {limit != null ? ` / ${limit}` : ''}
          </Text>
        </View>

        <View className="relative">
          <View className="pointer-events-none absolute left-3 top-0 z-10 h-full justify-center">
            <Icon as={Search} size={18} className="text-muted-foreground" />
          </View>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search repositories"
            placeholderTextColor={Platform.OS === 'ios' ? '#9ca3af' : '#888'}
            className="rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-foreground"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View className="min-h-0 flex-1 px-4 pt-3">
        {loadingRepos ? (
          <View className="flex-1 items-center justify-center gap-3 py-12">
            <ActivityIndicator size="large" />
            <Text className="text-muted-foreground">Loading your GitHub repositories…</Text>
          </View>
        ) : loadError ? (
          <View className="gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <Text className="font-medium text-foreground">Couldn&apos;t load repositories</Text>
            <Text className="text-sm text-muted-foreground">{loadError}</Text>
            <View className="flex-row flex-wrap gap-2">
              {onRetryLoad ? (
                <Button size="sm" variant="secondary" onPress={onRetryLoad}>
                  <Text>Try again</Text>
                </Button>
              ) : null}
              {onReconnectGitHub ? (
                <Button size="sm" variant="outline" onPress={onReconnectGitHub}>
                  <Text>Reconnect GitHub</Text>
                </Button>
              ) : null}
            </View>
          </View>
        ) : (
          <View className="min-h-[200px] flex-1 overflow-hidden rounded-xl border border-border">
            <RepositoryList
              data={filtered}
              selectedIds={selectedIds}
              onToggle={onToggle}
              emptyLabel={
                query.trim() ? 'No repositories match your search.' : 'No repositories found for this account.'
              }
            />
          </View>
        )}
      </View>

      <ScreenFooter>
        {saveError ? <Text className="text-center text-sm text-destructive">{saveError}</Text> : null}
        <Button disabled={saving} onPress={onPrimary}>
          {saving ? <ActivityIndicator size="small" color={Platform.OS === 'ios' ? undefined : '#fafafa'} /> : null}
          <Text>{saving ? 'Saving…' : primaryLabel}</Text>
        </Button>
        {secondaryLabel && onSecondary ? (
          <Button variant="secondary" disabled={saving} onPress={onSecondary}>
            <Text>{secondaryLabel}</Text>
          </Button>
        ) : null}
        {outlineLabel && onOutline ? (
          <Button variant="outline" disabled={saving} onPress={onOutline}>
            <Text>{outlineLabel}</Text>
          </Button>
        ) : null}
      </ScreenFooter>
    </View>
  );
}
