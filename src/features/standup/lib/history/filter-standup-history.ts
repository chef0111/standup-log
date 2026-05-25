import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import type { StandupHistoryItem } from '@/features/standup/lib/history/standup-history-item';
import { addCalendarDays } from '@/features/standup/lib/workday/workday';
import type { WorkdayPickerBounds } from '@/features/standup/lib/workday/workday';
import type { Workday } from '@/features/standup/types/workday';

export type HistoryFilterPreset = '7d' | '30d' | 'all';

export type HistoryDateRange = {
  fromWorkday: Workday;
  toWorkday: Workday;
};

export type StandupHistoryFilterState = {
  query: string;
  fromWorkday: Workday;
  toWorkday: Workday;
  preset: HistoryFilterPreset | null;
};

export function getAllHistoryDateRange(
  bounds: Pick<WorkdayPickerBounds, 'minimumWorkday' | 'maximumWorkday'>
): HistoryDateRange {
  return {
    fromWorkday: bounds.minimumWorkday,
    toWorkday: bounds.maximumWorkday,
  };
}

export function getPresetHistoryDateRange(
  preset: HistoryFilterPreset,
  bounds: Pick<WorkdayPickerBounds, 'minimumWorkday' | 'maximumWorkday'>
): HistoryDateRange {
  const { minimumWorkday, maximumWorkday } = bounds;

  switch (preset) {
    case '7d':
      return {
        fromWorkday: clampFromWorkday(
          addCalendarDays(maximumWorkday, -6),
          minimumWorkday
        ),
        toWorkday: maximumWorkday,
      };
    case '30d':
      return {
        fromWorkday: clampFromWorkday(
          addCalendarDays(maximumWorkday, -29),
          minimumWorkday
        ),
        toWorkday: maximumWorkday,
      };
    case 'all':
      return getAllHistoryDateRange(bounds);
  }
}

function clampFromWorkday(from: Workday, minimum: Workday): Workday {
  return from < minimum ? minimum : from;
}

export function createDefaultHistoryFilter(
  bounds: Pick<WorkdayPickerBounds, 'minimumWorkday' | 'maximumWorkday'>
): StandupHistoryFilterState {
  const range = getAllHistoryDateRange(bounds);
  return {
    query: '',
    fromWorkday: range.fromWorkday,
    toWorkday: range.toWorkday,
    preset: 'all',
  };
}

export function isHistoryFilterActive(
  filter: StandupHistoryFilterState,
  bounds: Pick<WorkdayPickerBounds, 'minimumWorkday' | 'maximumWorkday'>
): boolean {
  const defaults = createDefaultHistoryFilter(bounds);
  return (
    filter.query.trim().length > 0 ||
    filter.fromWorkday !== defaults.fromWorkday ||
    filter.toWorkday !== defaults.toWorkday ||
    filter.preset !== defaults.preset
  );
}

export function normalizeHistoryDateRange(
  fromWorkday: Workday,
  toWorkday: Workday
): HistoryDateRange {
  if (fromWorkday <= toWorkday) {
    return { fromWorkday, toWorkday };
  }
  return { fromWorkday: toWorkday, toWorkday: fromWorkday };
}

function matchesSearchQuery(item: StandupHistoryItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const heading = formatWorkdayHeading(item.workday).toLowerCase();
  const excerpt = (item.summaryExcerpt ?? '').toLowerCase();
  const workday = item.workday.toLowerCase();

  return (
    workday.includes(normalized) ||
    heading.includes(normalized) ||
    excerpt.includes(normalized)
  );
}

export function filterStandupHistoryItems(
  items: StandupHistoryItem[],
  filter: Pick<StandupHistoryFilterState, 'query' | 'fromWorkday' | 'toWorkday'>
): StandupHistoryItem[] {
  const { fromWorkday, toWorkday } = normalizeHistoryDateRange(
    filter.fromWorkday,
    filter.toWorkday
  );

  return items.filter((item) => {
    if (item.workday < fromWorkday || item.workday > toWorkday) {
      return false;
    }
    return matchesSearchQuery(item, filter.query);
  });
}
