'use client';

import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';

/** Inline status for a list that already shows (previous) data: refetching, or the last refresh failed. */
export function RefreshState({ fetching, error, onRetry }: { fetching: boolean; error: unknown; onRetry: () => void }) {
  const t = useTranslations();
  if (error) {
    return (
      <p className="text-xs text-destructive">
        {errorMessage(error, t('admin.bandwidth.shared.refreshFailed', 'Could not refresh.'))}{' '}
        <button type="button" className="underline underline-offset-2" onClick={onRetry}>
          {t('admin.customers.list.retry', 'Retry')}
        </button>
      </p>
    );
  }
  return fetching ? <p className="text-xs text-muted-foreground">{t('admin.bandwidth.shared.refreshing', 'Refreshing…')}</p> : null;
}
