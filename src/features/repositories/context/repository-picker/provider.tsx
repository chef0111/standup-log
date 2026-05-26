import { useAuth } from '@/context/auth';
import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import {
  canSelectRepository,
  formatRepoLimitError,
} from '@/features/entitlements/lib/entitlements';
import {
  RepositoryPickerContext,
  type RepositoryPickerContextValue,
} from '@/features/repositories/context/repository-picker/context';
import {
  fetchUserRepos,
  type GithubRepoRow,
} from '@/features/repositories/lib/github-repos';
import {
  getRepositoryPickerCopy,
  type RepositoryPickerMode,
} from '@/features/repositories/lib/repository-picker-copy';
import {
  parseSelectedRepositories,
  type SelectedRepository,
} from '@/features/repositories/types/repository';
import { useGitHubAccessToken } from '@/hooks/use-github-access-token';
import { track } from '@/lib/analytics';
import { AppError, userFacingMessage } from '@/lib/errors';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import * as React from 'react';
import { Alert } from 'react-native';

type RepositoryPickerProviderProps = {
  mode: RepositoryPickerMode;
  onComplete: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
};

export function RepositoryPickerProvider({
  mode,
  onComplete,
  onDismiss,
  children,
}: RepositoryPickerProviderProps) {
  const { supabase, session } = useAuth();
  const { data: profile, error: profileError } = useProfileQuery();
  const {
    token,
    loading: tokenLoading,
    refresh: refreshToken,
  } = useGitHubAccessToken();

  const [repos, setRepos] = React.useState<GithubRepoRow[]>([]);
  const [loadingRepos, setLoadingRepos] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const isPro = Boolean(profile?.is_pro);
  const [query, setQuery] = React.useState('');
  const [_selected, setSelected] = React.useState<
    SelectedRepository[] | undefined
  >(undefined);
  const selected =
    _selected ??
    parseSelectedRepositories(profile?.selected_repositories ?? []);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  React.useEffect(() => {
    if (mode === 'onboarding') {
      track('onboarding_started');
    }
  }, [mode]);

  React.useEffect(() => {
    if (profileError) {
      setLoadError(profileError.message);
    }
  }, [profileError]);

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

  const persistSelection = React.useCallback(
    async (reposPayload: SelectedRepository[]) => {
      if (!supabase || !session) {
        return;
      }
      setSaving(true);
      setSaveError(null);

      const payload =
        mode === 'onboarding'
          ? {
              selected_repositories: reposPayload,
              onboarding_completed_at: new Date().toISOString(),
            }
          : { selected_repositories: reposPayload };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', session.user.id);

      setSaving(false);

      if (error) {
        setSaveError(formatRepoLimitError(error.message));
        return;
      }

      if (mode === 'onboarding') {
        track('onboarding_completed');
      }
      track('repository_selection_completed', { count: reposPayload.length });
      onComplete();
    },
    [mode, onComplete, session, supabase]
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

  const copy = React.useMemo(
    () => getRepositoryPickerCopy(mode, isPro),
    [isPro, mode]
  );

  const value = React.useMemo<RepositoryPickerContextValue>(
    () => ({
      copy,
      isPro,
      query,
      setQuery,
      filtered,
      selected,
      selectedIds,
      onToggle,
      loadingRepos: tokenLoading || loadingRepos,
      loadError,
      onRetryLoad: () => setReloadKey((k) => k + 1),
      onReconnectGitHub: () => void onReconnectGitHub(),
      saveError,
      saving,
      onPrimary: () => void persistSelection(selected),
      onSecondary:
        mode === 'onboarding' ? () => void persistSelection([]) : undefined,
      onOutline: mode === 'manage' ? onDismiss : undefined,
    }),
    [
      copy,
      filtered,
      isPro,
      loadError,
      loadingRepos,
      onDismiss,
      onReconnectGitHub,
      onToggle,
      mode,
      persistSelection,
      query,
      saveError,
      saving,
      selected,
      selectedIds,
      tokenLoading,
    ]
  );

  return (
    <RepositoryPickerContext.Provider value={value}>
      {children}
      <UpgradeSheet
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="repos"
      />
    </RepositoryPickerContext.Provider>
  );
}
