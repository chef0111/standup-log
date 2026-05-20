import {
  clearActivityWorkdayCache,
  getActivityWorkdayCache,
  hasActivityWorkdayCache,
  setActivityWorkdayCache,
} from '@/features/standup/lib/activity/activity-workday-cache';
import { beforeEach, describe, expect, it } from 'vitest';

describe('activity-workday-cache', () => {
  beforeEach(() => {
    clearActivityWorkdayCache();
    setActivityWorkdayCache('2026-05-18', {
      commits: [
        {
          id: '1',
          user_id: 'u1',
          workday: '2026-05-18',
          repository_full_name: 'org/repo',
          sha: 'abc',
          message: 'feat: test',
          committed_at: '2026-05-18T10:00:00.000Z',
          html_url: 'https://example.com',
          author_login: 'dev',
          pr_number: null,
          pr_title: null,
          pr_url: null,
          pr_state: null,
          synced_at: '2026-05-18T10:01:00.000Z',
          created_at: '2026-05-18T10:01:00.000Z',
        },
      ],
      error: null,
      githubSynced: true,
    });
  });

  it('returns cached entries by workday', () => {
    expect(getActivityWorkdayCache('2026-05-18')?.commits).toHaveLength(1);
    expect(getActivityWorkdayCache('2026-05-19')).toBeUndefined();
  });

  it('tracks whether a workday has been loaded this session', () => {
    expect(hasActivityWorkdayCache('2026-05-18')).toBe(true);
    expect(hasActivityWorkdayCache('2026-05-19')).toBe(false);
  });
});
