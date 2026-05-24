import { WorkTypeDisplay } from '../lib/activity/stored-work-type';

export const WORK_TYPE_BADGE_CLASS: Record<WorkTypeDisplay['type'], string> = {
  feature: 'border-transparent bg-green-500/20',
  bug: 'border-transparent bg-destructive/15',
  refactor: 'border-transparent bg-blue-500/20',
  test: 'border-transparent bg-purple-500/20',
  chore: 'border-transparent bg-muted',
  style: 'border-transparent bg-amber-500/20',
};

export const WORK_TYPE_BADGE_TEXT_CLASS: Record<
  WorkTypeDisplay['type'],
  string
> = {
  feature: 'text-green-500',
  bug: 'text-destructive',
  refactor: 'text-blue-500',
  test: 'text-purple-500',
  chore: 'text-foreground',
  style: 'text-amber-500',
};

export const SYMBOL_STYLES: Record<WorkTypeDisplay['symbol'], string> = {
  '+': 'text-green-500',
  '!': 'text-destructive',
  '~': 'text-blue-500',
  $: 'text-amber-500',
  T: 'text-purple-500',
};
