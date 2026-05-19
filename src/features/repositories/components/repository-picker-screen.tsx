import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { RepositoryList } from '@/features/repositories/components/repository-list';
import type { GithubRepoRow } from '@/features/repositories/lib/github-repos';
import {
  FREE_TIER_REPO_LIMIT,
  type SelectedRepository,
} from '@/features/repositories/types/repository';
import { ScreenFooter } from '@/features/shell/components/screen-footer';
import { useThemeColor } from '@/features/theme';
import { SaveIcon, Search } from 'lucide-react-native';
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
  const limit = isPro ? null : FREE_TIER_REPO_LIMIT;
  const selectedCount = selected.length;
  const primaryForeground = useThemeColor('--color-primary-foreground');

  return (
    <View className="bg-background flex-1">
      <View className="border-border bg-background gap-4 border-b px-4 pb-4 pt-2">
        <View className="gap-1">
          <Text
            variant="h3"
            className="text-foreground border-0 pb-0 tracking-tight"
          >
            {title}
          </Text>
          <Text className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </Text>
        </View>

        <View className="border-border bg-muted/30 flex-row items-center justify-between rounded-md border px-3 py-2">
          <Text className="text-muted-foreground text-sm">Selected</Text>
          <Text className="text-foreground text-sm font-medium">
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
            placeholderTextColor={Platform.OS === 'ios' ? '#737373' : '#888'}
            className="border-input bg-background text-foreground rounded-md border py-2.5 pl-10 pr-3 text-sm"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View className="min-h-0 flex-1 px-4 py-3">
        {loadingRepos ? (
          <View className="flex-1 items-center justify-center gap-3 py-12">
            <ActivityIndicator size="large" />
            <Text className="text-muted-foreground text-sm">
              Loading your GitHub repositories…
            </Text>
          </View>
        ) : loadError ? (
          <View className="border-destructive/30 bg-destructive/5 gap-3 rounded-md border p-4">
            <Text className="text-foreground text-sm font-medium">
              Couldn&apos;t load repositories
            </Text>
            <Text className="text-muted-foreground text-sm">{loadError}</Text>
            <View className="flex-row flex-wrap gap-2">
              {onRetryLoad && (
                <Button size="sm" variant="secondary" onPress={onRetryLoad}>
                  <Text>Try again</Text>
                </Button>
              )}
              {onReconnectGitHub && (
                <Button size="sm" variant="outline" onPress={onReconnectGitHub}>
                  <Text>Reconnect GitHub</Text>
                </Button>
              )}
            </View>
          </View>
        ) : (
          <View className="border-border min-h-50 flex-1 overflow-hidden rounded-md border">
            <RepositoryList
              data={filtered}
              selectedIds={selectedIds}
              onToggle={onToggle}
              emptyLabel={
                query.trim()
                  ? 'No repositories match your search.'
                  : 'No repositories found for this account.'
              }
            />
          </View>
        )}
      </View>

      <ScreenFooter>
        {saveError && (
          <Text className="text-destructive text-center text-sm">
            {saveError}
          </Text>
        )}
        <Button disabled={saving} onPress={onPrimary}>
          {saving ? (
            <ButtonSpinner size={16} color={primaryForeground} />
          ) : (
            <Icon as={SaveIcon} size={16} color={primaryForeground} />
          )}
          <Text>{saving ? 'Saving…' : primaryLabel}</Text>
        </Button>
        {secondaryLabel && onSecondary && (
          <Button variant="secondary" disabled={saving} onPress={onSecondary}>
            <Text>{secondaryLabel}</Text>
          </Button>
        )}
        {outlineLabel && onOutline && (
          <Button variant="outline" disabled={saving} onPress={onOutline}>
            <Text>{outlineLabel}</Text>
          </Button>
        )}
      </ScreenFooter>
    </View>
  );
}
