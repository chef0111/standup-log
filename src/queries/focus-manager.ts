import { focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

let initialized = false;

export function setupFocusManager(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        setFocused(status === 'active');
      }
    );
    return () => {
      subscription.remove();
    };
  });
}
