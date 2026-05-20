import type { GithubRepoRow } from '@/features/repositories/lib/github-repos';
import type { RepositoryPickerCopy } from '@/features/repositories/lib/repository-picker-copy';
import type { SelectedRepository } from '@/features/repositories/types/repository';
import * as React from 'react';

export type RepositoryPickerContextValue = {
  copy: RepositoryPickerCopy;
  isPro: boolean;
  query: string;
  setQuery: (value: string) => void;
  filtered: GithubRepoRow[];
  selected: SelectedRepository[];
  selectedIds: ReadonlySet<number>;
  onToggle: (repo: GithubRepoRow) => void;
  loadingRepos: boolean;
  loadError: string | null;
  onRetryLoad: () => void;
  onReconnectGitHub: () => void;
  saveError: string | null;
  saving: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
  onOutline?: () => void;
};

export const RepositoryPickerContext = React.createContext<
  RepositoryPickerContextValue | undefined
>(undefined);
