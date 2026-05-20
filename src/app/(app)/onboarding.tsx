import { useAuth } from '@/context/auth';
import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import {
  canSelectRepository,
  formatRepoLimitError,
} from '@/features/entitlements/lib/entitlements';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { RepositoryPickerScreen } from '@/features/repositories/components/repository-picker-screen';
import {
  fetchUserRepos,
  type GithubRepoRow,
} from '@/features/repositories/lib/github-repos';
import {
  FREE_TIER_REPO_LIMIT,
  parseSelectedRepositories,
  type SelectedRepository,
} from '@/features/repositories/types/repository';
import { useGitHubAccessToken } from '@/hooks/use-github-access-token';
import { track } from '@/lib/analytics';
import { AppError, userFacingMessage } from '@/lib/errors';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert } from 'react-native';

export default function OnboardingRepositoriesScreen() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const {
    token,
    loading: tokenLoading,
    refresh: refreshToken,
  } = useGitHubAccessToken();

  const [repos, setRepos] = React.useState<GithubRepoRow[]>([]);
  const [loadingRepos, setLoadingRepos] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const [isPro, setIsPro] = React.useState(false);

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<SelectedRepository[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  React.useEffect(() => {
    track('onboarding_started');
  }, []);

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }

    let cancelled = false;

    void fetchUserProfile(supabase, session).then(({ profile, error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        setLoadError(error);
        return;
      }
      if (profile) {
        setIsPro(Boolean(profile.is_pro));
        setSelected(parseSelectedRepositories(profile.selected_repositories));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  React.useEffect(() => {
    if (tokenLoading) {
      return;
    }

    if (!token) {
      setLoadingRepos(false);
      setLoadError(
        'GitHub access is not available for this session. Reconnect GitHub to grant repository access (required on web after sign-in).'
      );
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
          const msg =
            e instanceof AppError ? e.message : userFacingMessage('github');
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
  }, [token, tokenLoading, reloadKey]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return repos;
    }
    return repos.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [query, repos]);

  const selectedIds = React.useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected]
  );

  const onToggle = React.useCallback(
    (repo: GithubRepoRow) => {
      setSaveError(null);
      setSelected((prev) => {
        const exists = prev.some((p) => p.id === repo.id);
        if (exists) {
          return prev.filter((p) => p.id !== repo.id);
        }
        if (!canSelectRepository(prev.length, isPro)) {
          setUpgradeOpen(true);
          return prev;
        }
        return [
          ...prev,
          { id: repo.id, full_name: repo.full_name, private: repo.private },
        ];
      });
    },
    [isPro]
  );

  const finishOnboarding = React.useCallback(
    async (reposPayload: SelectedRepository[]) => {
      if (!supabase || !session) {
        return;
      }
      setSaving(true);
      setSaveError(null);
      const { error } = await supabase
        .from('profiles')
        .update({
          selected_repositories: reposPayload,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      setSaving(false);

      if (error) {
        setSaveError(formatRepoLimitError(error.message));
        return;
      }

      track('onboarding_completed');
      track('repository_selection_completed', { count: reposPayload.length });
      router.replace('/(app)');
    },
    [router, session, supabase]
  );

  const onReconnectGitHub = React.useCallback(async () => {
    try {
      await signInWithGitHub();
      refreshToken();
      setReloadKey((k) => k + 1);
    } catch (e) {
      const text =
        e instanceof AppError ? e.message : userFacingMessage('auth');
      Alert.alert('GitHub sign-in', text);
    }
  }, [refreshToken]);

  return (
    <>
      <Stack.Screen
        options={{ title: 'Select repositories', headerShown: true }}
      />
      <RepositoryPickerScreen
        title="Choose repositories"
        description={
          isPro
            ? 'Pick which repositories StandupLog can use as activity sources. You can change this anytime in settings.'
            : `Free accounts can track up to ${FREE_TIER_REPO_LIMIT} repositories. Pro unlocks unlimited selection.`
        }
        isPro={isPro}
        query={query}
        onQueryChange={setQuery}
        filtered={filtered}
        selected={selected}
        selectedIds={selectedIds}
        onToggle={onToggle}
        loadingRepos={tokenLoading || loadingRepos}
        loadError={loadError}
        onRetryLoad={() => setReloadKey((k) => k + 1)}
        onReconnectGitHub={() => void onReconnectGitHub()}
        saveError={saveError}
        saving={saving}
        primaryLabel="Continue"
        onPrimary={() => void finishOnboarding(selected)}
        secondaryLabel="Skip for now"
        onSecondary={() => void finishOnboarding([])}
      />
      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="repos"
      />
    </>
  );
}
