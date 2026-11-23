'use client';

import { ShieldAlert } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslations } from '@/i18n/locale-context';

/** Load failure: a 403 is "super admin only", anything else gets a retry. */
export function CmsLoadError({
  error,
  title,
  onRetry,
}: {
  error: unknown;
  title: string;
  onRetry: () => void;
}) {
  const t = useTranslations();
  if (error instanceof ApiError && error.status === 403) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title={t('platform.cms.forbiddenTitle', 'Super admin access required')}
        description={t(
          'platform.cms.forbiddenDesc',
          'Only the platform owner can manage website content.',
        )}
      />
    );
  }
  return (
    <EmptyState
      variant="error"
      title={title}
      description={error instanceof Error ? error.message : undefined}
      actionLabel={t('common.retry', 'Retry')}
      onAction={onRetry}
    />
  );
}
