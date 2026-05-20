import { FREE_TIER_REPO_LIMIT } from '@/features/repositories/types/repository';

export type RepositoryPickerMode = 'onboarding' | 'manage';

export type RepositoryPickerCopy = {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  outlineLabel?: string;
};

export function getRepositoryPickerCopy(
  mode: RepositoryPickerMode,
  isPro: boolean
): RepositoryPickerCopy {
  if (mode === 'onboarding') {
    return {
      title: 'Choose repositories',
      description: isPro
        ? 'Pick which repositories StandupLog can use as activity sources. You can change this anytime in settings.'
        : `Free accounts can track up to ${FREE_TIER_REPO_LIMIT} repositories. Pro unlocks unlimited selection.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Skip for now',
    };
  }

  return {
    title: 'Manage repositories',
    description: `Free accounts can select up to ${FREE_TIER_REPO_LIMIT} repositories. Pro unlocks unlimited selection.`,
    primaryLabel: 'Save changes',
    outlineLabel: 'Cancel',
  };
}
