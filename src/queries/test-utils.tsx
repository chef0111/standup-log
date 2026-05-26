import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithQueryClient(
  ui: React.ReactNode,
  client = createTestQueryClient()
) {
  return {
    client,
    ui: <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  };
}
