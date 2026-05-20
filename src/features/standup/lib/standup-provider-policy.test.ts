import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const providerPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../context/standup/provider.tsx'
);

function readProviderSource(): string {
  return readFileSync(providerPath, 'utf8');
}

describe('StandupProvider workday policy', () => {
  it('does not reset picker Workday on screen refocus', () => {
    const source = readProviderSource();
    const focusCallback = source.slice(
      source.indexOf('useFocusEffect'),
      source.indexOf('}, [session, supabase]') + '}, [session, supabase]'.length
    );

    expect(focusCallback).not.toMatch(
      /setWorkday\s*\(\s*defaultTargetWorkday\s*\(/
    );
  });

  it('does not auto-invoke AI when draft is empty', () => {
    const source = readProviderSource();
    expect(source).not.toMatch(/autoAiWorkdayRef/);
    expect(source).not.toMatch(/void runAiDraft\s*\(\s*false\s*\)/);
  });
});
