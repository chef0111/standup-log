import { describe, expect, it } from 'vitest';
import { convertLegacyStandupToMarkdown } from '@/features/standup/lib/convert-legacy-standup';

describe('convertLegacyStandupToMarkdown', () => {
  it('maps legacy columns into template sections', () => {
    const markdown = convertLegacyStandupToMarkdown({
      workday: '2026-05-19',
      yesterday_text: '- acme/web: Fix bug',
      today_text: '- Finish dashboard',
      blockers_text: '- Waiting on API',
    });

    expect(markdown).toContain('# Daily Standup —');
    expect(markdown).toContain('## ✅ What I did');
    expect(markdown).toContain('- acme/web: Fix bug');
    expect(markdown).toContain('## 🔨 Focusing on');
    expect(markdown).toContain('- Finish dashboard');
    expect(markdown).toContain('## 🚧 Blockers');
    expect(markdown).toContain('- Waiting on API');
  });
});
