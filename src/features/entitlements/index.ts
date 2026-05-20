export {
  assertActivitySyncAllowed,
  canSelectRepository,
  FREE_TIER_WORKDAY_HISTORY_DAYS,
  getWorkdayHistoryBounds,
  HISTORY_CAP_MESSAGE,
  isWorkdayWithinHistory,
  type ActivitySyncGuardResult,
} from './lib/entitlements';
export {
  formatRepoLimitError,
  isFreeTierRepoLimitError,
  UpgradeSheet,
  type UpgradeReason,
} from './components/upgrade-sheet';
export { useEntitlements } from './hooks/use-entitlements';
