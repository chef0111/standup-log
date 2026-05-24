import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { RepositoryList } from '@/features/repositories/components/repository-list';
import { useRepositoryPicker } from '@/features/repositories/context/repository-picker';
import { FREE_TIER_REPO_LIMIT } from '@/features/repositories/types/repository';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SaveIcon, Search } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Platform, TextInput, View } from 'react-native';

export function RepositoryPickerScreen() {
  const {
    copy,
    isPro,
    query,
    setQuery,
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
    onPrimary,
    onSecondary,
    onOutline,
  } = useRepositoryPicker();

  const limit = isPro ? null : FREE_TIER_REPO_LIMIT;
  const selectedCount = selected.length;
  const primaryForeground = useThemeColor('--color-primary-foreground');
  const foreground = useThemeColor('--color-foreground');

  return (
    <AppScreenShell
      scroll={false}
      header={
        <ScreenHeader
          eyebrow="Repositories"
          title={copy.title}
          subtitle={copy.description}
        />
      }
      footer={
        <View className="gap-2">
          {saveError ? (
            <Text className="text-destructive text-center text-sm">
              {saveError}
            </Text>
          ) : null}
          <Button
            variant="charcoal"
            size="pill"
            disabled={saving}
            onPress={onPrimary}
          >
            {saving ? (
              <ButtonSpinner size={16} color={primaryForeground} />
            ) : (
              <Icon as={SaveIcon} size={16} color={primaryForeground} />
            )}
            <Text>{saving ? 'Saving…' : copy.primaryLabel}</Text>
          </Button>
          {copy.secondaryLabel && onSecondary ? (
            <Button variant="secondary" disabled={saving} onPress={onSecondary}>
              <Text>{copy.secondaryLabel}</Text>
            </Button>
          ) : null}
          {copy.outlineLabel && onOutline ? (
            <Button variant="outline" disabled={saving} onPress={onOutline}>
              <Text>{copy.outlineLabel}</Text>
            </Button>
          ) : null}
        </View>
      }
      contentClassName="flex-1 gap-4 pt-2"
    >
      <Card variant="elevated" className="flex-row items-center justify-between p-4">
        <Text className="text-muted-foreground text-sm">Selected</Text>
        <Text className="text-foreground text-sm font-medium">
          {selectedCount}
          {limit != null ? ` / ${limit}` : ''}
        </Text>
      </Card>

      <Card variant="elevated" className="gap-3 p-4">
        <View className="relative">
          <View className="pointer-events-none absolute left-3 top-0 z-10 h-full justify-center">
            <Icon as={Search} size={18} className="text-muted-foreground" />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search repositories"
            placeholderTextColor={Platform.OS === 'ios' ? '#737373' : '#888'}
            className="bg-muted/40 text-foreground rounded-2xl py-2.5 pl-10 pr-3 text-sm"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View className="min-h-0 flex-1 overflow-hidden rounded-2xl">
          {loadingRepos ? (
            <View className="flex-1 items-center justify-center gap-3 py-12">
              <ActivityIndicator size="large" color={foreground} />
              <Text className="text-muted-foreground text-sm">
                Loading your GitHub repositories…
              </Text>
            </View>
          ) : loadError ? (
            <View className="bg-destructive/5 gap-3 rounded-2xl p-4">
              <Text className="text-foreground text-sm font-medium">
                Couldn&apos;t load repositories
              </Text>
              <Text className="text-muted-foreground text-sm">{loadError}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Button size="sm" variant="secondary" onPress={onRetryLoad}>
                  <Text>Try again</Text>
                </Button>
                <Button size="sm" variant="outline" onPress={onReconnectGitHub}>
                  <Text>Reconnect GitHub</Text>
                </Button>
              </View>
            </View>
          ) : (
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
          )}
        </View>
      </Card>
    </AppScreenShell>
  );
}
