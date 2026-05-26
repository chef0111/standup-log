import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { setupFocusManager } from '@/queries/focus-manager';
import { getQueryClient } from '@/queries/query-client';

type QueryProviderProps = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = React.useMemo(() => getQueryClient(), []);

  React.useEffect(() => {
    setupFocusManager();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
