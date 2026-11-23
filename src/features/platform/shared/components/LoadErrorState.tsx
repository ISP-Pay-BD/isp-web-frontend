'use client';

import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslations } from '@/i18n/locale-context';

/** Error state for a platform ops screen: 403 shows permission-denied (no retry), anything else retries. */
export function LoadErrorState({ error, title, onRetry }: { error: unknown; title: string; onRetry: () => void }) {
  const t = useTranslations();
  const forbidden = error instanceof ApiError && error.status === 403;
  if (forbidden) {
    return (
      <EmptyState
        variant="error"
        title={t('shared.permission.forbidden.title', 'Access denied')}
        description={t('platform.ops.forbidden', 'Only platform super admins can open this page.')}
      />
    );
  }
  return (
    <EmptyState
      variant="error"
      title={title}
      description={errorMessage(error, t('platform.ops.loadFailedHint', 'The server did not answer. Try again.'))}
      actionLabel={t('common.retry', 'Retry')}
      onAction={onRetry}
    />
  );
}
