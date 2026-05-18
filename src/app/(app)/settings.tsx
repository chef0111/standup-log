import { Button } from '@/components/ui/button';
import { RepositoryList } from '@/components/repository-list';
import { Text } from '@/components/ui/text';
import { AppError, userFacingMessage } from '@/lib/errors';
import { fetchUserRepos, type GithubRepoRow } from '@/lib/github-repos';
import { useAuth } from '@/providers/auth-provider';
import {
  FREE_TIER_REPO_LIMIT,
  type SelectedRepository,
  parseSelectedRepositories,
} from '@/types/repository';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';

export default function SettingsRepositoriesScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const token = session?.provider_token ?? null;

  const [repos, setRepos] = React.useState<GithubRepoRow[]>([]);
  const [loadingRepos, setLoadingRepos] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [isPro, setIsPro] = React.useState(false);

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<SelectedRepository[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }

    let cancelled = false;

    void supabase
      .from('profiles')
      .select('is_pro, selected_repositories')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          setLoadError(error.message);
          return;
        }
        if (data) {
          setIsPro(Boolean(data.is_pro));
          setSelected(parseSelectedRepositories(data.selected_repositories));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  React.useEffect(() => {
    if (!token) {
      setLoadingRepos(false);
      setLoadError('GitHub access token missing. Sign out and sign in again to grant repository access.');
      return;
    }

    let cancelled = false;
    setLoadingRepos(true);
    setLoadError(null);

    void fetchUserRepos(token)
      .then((rows) => {
        if (!cancelled) {
          setRepos(rows);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof AppError ? e.message : userFacingMessage('github');
          setLoadError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRepos(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return repos;
    }
    return repos.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [query, repos]);

  const selectedIds = React.useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const onToggle = React.useCallback(
    (repo: GithubRepoRow) => {
      setSaveError(null);
      setSelected((prev) => {
        const exists = prev.some((p) => p.id === repo.id);
        if (exists) {
          return prev.filter((p) => p.id !== repo.id);
        }
        if (!isPro && prev.length >= FREE_TIER_REPO_LIMIT) {
          Alert.alert(
            'Repository limit',
            'Free accounts can track up to three repositories. Upgrade to Pro (coming soon) for unlimited repos.',
            [{ text: 'OK' }]
          );
          return prev;
        }
        return [...prev, { id: repo.id, full_name: repo.full_name, private: repo.private }];
      });
    },
    [isPro]
  );

  const onSave = React.useCallback(async () => {
    if (!supabase || !session) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ selected_repositories: selected })
      .eq('id', session.user.id);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    router.back();
  }, [router, selected, session, supabase]);

  return (
    <>
      <Stack.Screen options={{ title: 'Repositories' }} />
      <View className="flex-1 gap-3 bg-background p-4">
        <Text className="text-muted-foreground">
          Free accounts can select up to {FREE_TIER_REPO_LIMIT} repositories. Pro unlocks unlimited selection (billing
          stub).
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search repositories"
          placeholderTextColor="#888"
          className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {loadingRepos ? (
          <ActivityIndicator className="mt-6" />
        ) : loadError ? (
          <Text className="text-destructive">{loadError}</Text>
        ) : (
          <View className="min-h-[200px] flex-1">
            <RepositoryList
              data={filtered}
              selectedIds={selectedIds}
              onToggle={onToggle}
              emptyLabel={query.trim() ? 'No repositories match your search.' : 'No repositories found for this account.'}
            />
          </View>
        )}

        {saveError ? <Text className="text-destructive">{saveError}</Text> : null}

        <View className="gap-2">
          <Button disabled={saving} onPress={() => void onSave()}>
            <Text>{saving ? 'Saving…' : 'Save changes'}</Text>
          </Button>
          <Button variant="outline" disabled={saving} onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
