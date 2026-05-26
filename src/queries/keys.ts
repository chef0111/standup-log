export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

export const standupKeys = {
  all: ['standup'] as const,
  update: (workday: string) => [...standupKeys.all, 'update', workday] as const,
  history: (min: string, max: string) =>
    [...standupKeys.all, 'history', min, max] as const,
  week: (start: string, end: string) =>
    [...standupKeys.all, 'week', start, end] as const,
};

export const notesKeys = {
  all: ['notes'] as const,
  workday: (workday: string) => [...notesKeys.all, 'workday', workday] as const,
  carryForward: (workday: string) =>
    [...notesKeys.all, 'carry-forward', workday] as const,
};

export const activityKeys = {
  all: ['activity'] as const,
  workday: (workday: string) => [...activityKeys.all, 'workday', workday] as const,
};

export const weeklyKeys = {
  all: ['weekly'] as const,
  commits: (start: string, end: string) =>
    [...weeklyKeys.all, 'commits', start, end] as const,
  standups: (start: string, end: string) =>
    [...weeklyKeys.all, 'standups', start, end] as const,
};

export const repositoryKeys = {
  all: ['repositories'] as const,
  github: () => [...repositoryKeys.all, 'github'] as const,
};
