import { useAuth } from '@/context/auth';
import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { UpgradeSheet } from '@/features/entitlements/components/upgrade-sheet';
import {
  canSelectRepository,
} from '@/features/entitlements/lib/entitlements';
import {
  RepositoryPickerContext,
  type RepositoryPickerContextValue,
} from '@/features/repositories/context/repository-picker/context';
import type { GithubRepoRow } from '@/features/repositories/lib/github-repos';
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
import { useGithubReposQuery } from '@/queries/repositories/use-github-repos-query';
import { useSaveSelectedRepositoriesMutation } from '@/queries/repositories/use-save-selected-repositories-mutation';
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
  const { session } = useAuth();
  const { data: profile, error: profileError } = useProfileQuery();
  const {
    token,
    loading: tokenLoading,
    refresh: refreshToken,
  } = useGitHubAccessToken();
  const reposQuery = useGithubReposQuery({
    token,
    enabled: !tokenLoading,
  });
  const saveMutation = useSaveSelectedRepositoriesMutation();

  const isPro = Boolean(profile?.is_pro);
  const [query, setQuery] = React.useState('');
  const [_selected, setSelected] = React.useState<
    SelectedRepository[] | undefined
  >(undefined);
  const selected =
    _selected ??
    parseSelectedRepositories(profile?.selected_repositories ?? []);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  React.useEffect(() => {
    if (mode === 'onboarding') {
      track('onboarding_started');
    }
  }, [mode]);

  const loadError = profileError?.message
    ? profileError.message
    : !tokenLoading && !token
      ? 'GitHub access is not available for this session. Reconnect GitHub to grant repository access (required on web after sign-in).'
      : reposQuery.error
        ? reposQuery.error instanceof Error
          ? reposQuery.error.message
          : userFacingMessage('github')
        : null;

  const filtered = React.useMemo(() => {
    const repos = reposQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return repos;
    }
    return repos.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [query, reposQuery.data]);

  const selectedIds = React.useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected]
  );

  const onToggle = React.useCallback(
    (repo: GithubRepoRow) => {
      setSaveError(null);
      setSelected((prev) => {
        const current = prev ?? selected;
        const exists = current.some((p) => p.id === repo.id);
        if (exists) {
          return current.filter((p) => p.id !== repo.id);
        }
        if (!canSelectRepository(current.length, isPro)) {
          setUpgradeOpen(true);
          return current;
        }
        return [
          ...current,
          { id: repo.id, full_name: repo.full_name, private: repo.private },
        ];
      });
    },
    [isPro, selected]
  );

  const persistSelection = React.useCallback(
    async (reposPayload: SelectedRepository[]) => {
      if (!session) {
        return;
      }
      setSaveError(null);
      try {
        await saveMutation.mutateAsync({ repos: reposPayload, mode });
        onComplete();
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : userFacingMessage('unknown')
        );
      }
    },
    [mode, onComplete, saveMutation, session]
  );

  const onReconnectGitHub = React.useCallback(async () => {
    try {
      await signInWithGitHub();
      refreshToken();
      void reposQuery.refetch();
    } catch (e) {
      const text =
        e instanceof AppError ? e.message : userFacingMessage('auth');
      Alert.alert('GitHub sign-in', text);
    }
  }, [refreshToken, reposQuery]);

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
      loadingRepos: tokenLoading || reposQuery.isLoading,
      loadError,
      onRetryLoad: () => void reposQuery.refetch(),
      onReconnectGitHub: () => void onReconnectGitHub(),
      saveError,
      saving: saveMutation.isPending,
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
      onDismiss,
      onReconnectGitHub,
      onToggle,
      mode,
      persistSelection,
      query,
      reposQuery,
      saveError,
      saveMutation.isPending,
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
