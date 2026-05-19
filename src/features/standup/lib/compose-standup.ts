import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import type { ManualNoteRow } from '@/features/notes/types/manual-note';
import type { Workday } from '@/features/workday/types/workday';

export type StandupSections = {
  yesterday: string;
  today: string;
  blockers: string;
};

export type StandupUpdateRow = {
  id: string;
  user_id: string;
  workday: Workday;
  yesterday_text: string;
  today_text: string;
  blockers_text: string;
  copied_at: string | null;
  format_used: string | null;
  created_at: string;
  updated_at: string;
};

export const STANDUP_UPDATE_COLUMNS =
  'id, user_id, workday, yesterday_text, today_text, blockers_text, copied_at, format_used, created_at, updated_at' as const;

export const DEFAULT_TODAY_PLACEHOLDER = "What I'm working on today…";
export const DEFAULT_BLOCKERS = 'No blockers';
export const MAX_YESTERDAY_BULLETS = 15;

export type ComposeManualStandupInput = {
  commits: ActivityCommitRow[];
  notes: ManualNoteRow[];
  carryForwardNotes: ManualNoteRow[];
  todayPlaceholder?: string;
};

function firstLine(message: string): string {
  const line = message.split('\n')[0]?.trim() ?? message.trim();
  return line.length > 0 ? line : message.trim();
}

function formatCommitBullet(commit: ActivityCommitRow): string {
  const repo =
    commit.repository_full_name.split('/').pop() ?? commit.repository_full_name;
  const line = firstLine(commit.message);
  if (commit.pr_number != null && commit.pr_title) {
    return `- ${repo}: ${line} (PR #${commit.pr_number}: ${commit.pr_title})`;
  }
  return `- ${repo}: ${line}`;
}

export function composeManualStandup(
  input: ComposeManualStandupInput
): StandupSections {
  const sorted = [...input.commits].sort(
    (a, b) =>
      new Date(b.committed_at).getTime() - new Date(a.committed_at).getTime()
  );

  const visible = sorted.slice(0, MAX_YESTERDAY_BULLETS);
  const bullets = visible.map(formatCommitBullet);
  if (sorted.length > MAX_YESTERDAY_BULLETS) {
    bullets.push(
      `- …and ${sorted.length - MAX_YESTERDAY_BULLETS} more commit${sorted.length - MAX_YESTERDAY_BULLETS === 1 ? '' : 's'}`
    );
  }

  const yesterday = bullets.length > 0 ? bullets.join('\n') : '';

  const placeholder = input.todayPlaceholder ?? DEFAULT_TODAY_PLACEHOLDER;
  const carryLines = input.carryForwardNotes.map((n) => `- ${n.body.trim()}`);
  const todayParts = [placeholder, ...carryLines].filter(Boolean);
  const today = todayParts.join('\n');

  const blockerNotes = input.notes.filter((n) => n.is_blocker);
  const blockers =
    blockerNotes.length > 0
      ? blockerNotes.map((n) => `- ${n.body.trim()}`).join('\n')
      : DEFAULT_BLOCKERS;

  return { yesterday, today, blockers };
}

export function isStandupEmpty(sections: StandupSections): boolean {
  const todayText = sections.today.trim();
  const carryForwardOnly =
    todayText === DEFAULT_TODAY_PLACEHOLDER ||
    (todayText.startsWith(`${DEFAULT_TODAY_PLACEHOLDER}\n`) &&
      todayText.slice(DEFAULT_TODAY_PLACEHOLDER.length + 1).trim().length ===
        0);

  return (
    sections.yesterday.trim().length === 0 &&
    (todayText.length === 0 || carryForwardOnly) &&
    (sections.blockers.trim().length === 0 ||
      sections.blockers.trim() === DEFAULT_BLOCKERS)
  );
}
