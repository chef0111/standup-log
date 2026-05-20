import type { Session, SupabaseClient } from '@supabase/supabase-js';
import * as React from 'react';

export type AuthContextValue = {
  supabase: SupabaseClient | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
};

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);
