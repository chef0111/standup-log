import AsyncStorage from '@react-native-async-storage/async-storage';

const prefix = 'standuplog:analytics:';

export async function markFirstEvent(
  userId: string,
  key: 'first_draft_generated' | 'first_standup_copied'
): Promise<boolean> {
  const storageKey = `${prefix}${userId}:${key}`;
  const existing = await AsyncStorage.getItem(storageKey);
  if (existing) {
    return false;
  }
  await AsyncStorage.setItem(storageKey, '1');
  return true;
}
