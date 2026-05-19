export { ActivityList } from './components/activity-list';
export { useActivitySync } from './hooks/use-activity-sync';
export {
  dedupeCommitsBySha,
  fetchAllRepoCommitsForWorkday,
} from './lib/github-commits';
export {
  fetchActivityCommits,
  syncActivityForWorkday,
} from './lib/sync-activity';
export type {
  ActivityCommitInsert,
  ActivityCommitRow,
} from './types/activity-commit';
