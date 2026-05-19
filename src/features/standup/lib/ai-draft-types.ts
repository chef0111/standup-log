export type CommitWorkType =
  | 'feature'
  | 'bug'
  | 'refactor'
  | 'test'
  | 'chore'
  | 'style';

export type GenerateDraftCommitInput = {
  sha: string;
  message: string;
  repository_full_name: string;
  pr_number: number | null;
  pr_title: string | null;
};

export type GenerateDraftNoteInput = {
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
};

export type GenerateDraftRequest = {
  workday: string;
  commits: GenerateDraftCommitInput[];
  notes: GenerateDraftNoteInput[];
};

export type GenerateDraftClassification = {
  sha: string;
  work_type: CommitWorkType;
};

export type GenerateDraftResponse = {
  yesterday: string;
  classifications: GenerateDraftClassification[];
};
