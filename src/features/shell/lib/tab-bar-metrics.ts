/** Floating tab bar pill height (content row, excluding safe area). */
export const FLOATING_TAB_BAR_HEIGHT = 56;

/** Gap between the floating pill and the screen bottom (above safe area). */
export const FLOATING_TAB_BAR_MARGIN = 12;

/** @deprecated Use FLOATING_TAB_BAR_HEIGHT */
export const WEB_TAB_BAR_HEIGHT = FLOATING_TAB_BAR_HEIGHT;

/** @deprecated Use FLOATING_TAB_BAR_HEIGHT */
export const NATIVE_TAB_BAR_HEIGHT = FLOATING_TAB_BAR_HEIGHT;

export function getFloatingTabBarInset(
  safeAreaBottom: number,
  additional = 16
): number {
  return (
    FLOATING_TAB_BAR_HEIGHT +
    FLOATING_TAB_BAR_MARGIN +
    safeAreaBottom +
    additional
  );
}
