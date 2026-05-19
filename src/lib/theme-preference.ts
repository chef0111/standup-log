import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorSchemeName } from 'react-native';

const STORAGE_KEY = 'standup-log.color-scheme';

export type ThemePreference = 'light' | 'dark';

export async function loadThemePreference(): Promise<ThemePreference | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
}

export async function saveThemePreference(scheme: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, scheme);
}

export function resolveThemePreference(scheme: ColorSchemeName | null | undefined): ThemePreference {
  return scheme === 'dark' ? 'dark' : 'light';
}
