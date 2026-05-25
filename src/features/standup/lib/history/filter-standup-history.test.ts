import {
  createDefaultHistoryFilter,
  filterStandupHistoryItems,
  getPresetHistoryDateRange,
  isHistoryFilterActive,
  normalizeHistoryDateRange,
} from '@/features/standup/lib/history/filter-standup-history';
import type { StandupHistoryItem } from '@/features/standup/lib/history/standup-history-item';
import { describe, expect, it } from 'vitest';

const bounds = {
  minimumWorkday: '2026-04-01' as const,
  maximumWorkday: '2026-05-25' as const,
};

const sampleItems: StandupHistoryItem[] = [
  {
    workday: '2026-05-25',
    summaryExcerpt: 'Shipped auth fix today.',
    copied: true,
  },
  {
    workday: '2026-05-10',
    summaryExcerpt: 'Refactored activity sync.',
    copied: false,
  },
  {
    workday: '2026-04-15',
    summaryExcerpt: null,
    copied: false,
  },
];

describe('getPresetHistoryDateRange', () => {
  it('returns 7-day window ending at max workday', () => {
    expect(getPresetHistoryDateRange('7d', bounds)).toEqual({
      fromWorkday: '2026-05-19',
      toWorkday: '2026-05-25',
    });
  });

  it('returns 30-day window ending at max workday', () => {
    expect(getPresetHistoryDateRange('30d', bounds)).toEqual({
      fromWorkday: '2026-04-26',
      toWorkday: '2026-05-25',
    });
  });

  it('returns full entitlement bounds for all', () => {
    expect(getPresetHistoryDateRange('all', bounds)).toEqual({
      fromWorkday: '2026-04-01',
      toWorkday: '2026-05-25',
    });
  });
});

describe('filterStandupHistoryItems', () => {
  it('filters by workday range', () => {
    const filtered = filterStandupHistoryItems(sampleItems, {
      query: '',
      fromWorkday: '2026-05-01',
      toWorkday: '2026-05-25',
    });
    expect(filtered.map((i) => i.workday)).toEqual(['2026-05-25', '2026-05-10']);
  });

  it('filters by summary excerpt text', () => {
    const filtered = filterStandupHistoryItems(sampleItems, {
      query: 'auth',
      fromWorkday: bounds.minimumWorkday,
      toWorkday: bounds.maximumWorkday,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.workday).toBe('2026-05-25');
  });

  it('filters by formatted workday heading', () => {
    const filtered = filterStandupHistoryItems(sampleItems, {
      query: 'may 10',
      fromWorkday: bounds.minimumWorkday,
      toWorkday: bounds.maximumWorkday,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.workday).toBe('2026-05-10');
  });

  it('combines query and range', () => {
    const filtered = filterStandupHistoryItems(sampleItems, {
      query: 'refactor',
      fromWorkday: '2026-05-01',
      toWorkday: '2026-05-20',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.workday).toBe('2026-05-10');
  });
});

describe('normalizeHistoryDateRange', () => {
  it('swaps inverted from/to', () => {
    expect(
      normalizeHistoryDateRange('2026-05-20', '2026-05-01')
    ).toEqual({
      fromWorkday: '2026-05-01',
      toWorkday: '2026-05-20',
    });
  });
});

describe('isHistoryFilterActive', () => {
  it('is false for default filter', () => {
    expect(isHistoryFilterActive(createDefaultHistoryFilter(bounds), bounds)).toBe(
      false
    );
  });

  it('is true when query is set', () => {
    const filter = createDefaultHistoryFilter(bounds);
    expect(isHistoryFilterActive({ ...filter, query: 'auth' }, bounds)).toBe(
      true
    );
  });
});
