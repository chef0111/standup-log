export {
  assertActivitySyncAllowed,
  canSelectRepository,
  FREE_TIER_WORKDAY_HISTORY_DAYS,
  getWorkdayHistoryBounds,
  HISTORY_CAP_MESSAGE,
  isWorkdayWithinHistory,
  type ActivitySyncGuardResult,
} from './lib/entitlements';
export { useEntitlements } from './hooks/use-entitlements';
