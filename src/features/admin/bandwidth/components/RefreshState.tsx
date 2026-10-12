'use client';

import { errorMessage } from '@/lib/api/utils/error-handler';

/** Inline status for a list that already shows (previous) data: refetching, or the last refresh failed. */
export function RefreshState({ fetching, error, onRetry }: { fetching: boolean; error: unknown; onRetry: () => void }) {
  if (error) {
    return (
      <p className="text-xs text-destructive">
        {errorMessage(error, 'Could not refresh.')}{' '}
        <button type="button" className="underline underline-offset-2" onClick={onRetry}>
          Retry
        </button>
      </p>
    );
  }
  return fetching ? <p className="text-xs text-muted-foreground">Refreshing…</p> : null;
}
