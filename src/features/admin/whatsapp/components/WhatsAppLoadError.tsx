'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';

/**
 * Load failure on a WhatsApp page. A 403 means WhatsApp is not enabled for this ISP (the platform
 * owner turns it on), which is a setup state, not an outage — so no "Failed"/Retry for it.
 */
export function WhatsAppLoadError({ error, title, fallback, onRetry }: { error: unknown; title: string; fallback: string; onRetry: () => void }) {
  const t = useTranslations();
  if (error instanceof ApiError && error.status === 403) {
    return <EmptyState title={t('admin.whatsapp.loadError.notEnabled', 'WhatsApp is not enabled')} description={error.message} />;
  }
  return <EmptyState title={title} description={errorMessage(error, fallback)} actionLabel={t('common.retry', 'Retry')} onAction={onRetry} />;
}
