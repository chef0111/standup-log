import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { GenerateDraftRequest } from '@/features/standup/lib/ai-draft-types';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';

export function buildGenerateDraftRequest(
  workday: Workday,
  commits: ActivityCommitRow[],
  notes: ManualNoteRow[]
): GenerateDraftRequest {
  return {
    workday,
    commits: commits.map((commit) => ({
      sha: commit.sha,
      message: commit.message,
      repository_full_name: commit.repository_full_name,
      pr_number: commit.pr_number,
      pr_title: commit.pr_title,
      pr_state: commit.pr_state,
      pr_merged_at: commit.pr_merged_at,
      signal_disposition: commit.signal_disposition,
    })),
    notes: notes.map((note) => ({
      body: note.body,
      is_blocker: note.is_blocker,
      is_carry_forward: note.is_carry_forward,
    })),
  };
}
