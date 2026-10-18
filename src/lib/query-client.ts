import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

/**
 * Single app-wide QueryClient so non-React code (logout) can clear it.
 * - queries: retry only transient failures (network / 5xx), max 2 times
 * - mutations: every failure toasts the backend's message unless the
 *   mutation handles it itself (`meta: { silent: true }` or its own onError)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => error instanceof ApiError && error.isTransient && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.silent || mutation.options.onError) return;
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    },
  }),
});

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    mutationMeta: { silent?: boolean };
  }
}
