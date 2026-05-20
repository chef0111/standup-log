import {
  createClient,
  type SupabaseClient,
  type SupportedStorage,
} from '@supabase/supabase-js';

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '@/lib/supabase-config';
import { Platform } from 'react-native';

let browserClient: SupabaseClient | null = null;

const noopStorage: SupportedStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

function createAuthStorage(): SupportedStorage {
  if (typeof window === 'undefined') {
    return noopStorage;
  }

  if (Platform.OS === 'web') {
    return {
      getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key, value) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  // Native only — avoid loading AsyncStorage during web SSR.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-async-storage/async-storage').default;
}

/**
 * Returns a singleton Supabase client, or null when env is not configured (cold start must not throw).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (browserClient) {
    return browserClient;
  }
  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  browserClient = createClient(url, key, {
    auth: {
      storage: createAuthStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  });
  return browserClient;
}

/** @throws if Supabase is not configured — use only after routing guarantees config. */
export function requireSupabase(): SupabaseClient {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured');
  }
  return client;
}

export { isSupabaseConfigured } from '@/lib/supabase-config';
