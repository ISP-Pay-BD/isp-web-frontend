import type { ReactNode } from 'react';
import { EmptyState, TableSkeleton } from '@/components/shared';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';

interface ListStateProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  /** True when the unfiltered list has no rows at all (filtered "no results" stays inside the table). */
  isEmpty: boolean;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription?: string;
  icon?: ReactNode;
  rows?: number;
  children: ReactNode;
}

/** Loading → skeleton, error → EmptyState + Retry, empty → EmptyState, else the table. */
export function ListState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  errorTitle,
  emptyTitle,
  emptyDescription,
  icon,
  rows = 8,
  children,
}: ListStateProps) {
  const t = useTranslations();
  if (isLoading) return <TableSkeleton rows={rows} />;
  if (isError) {
    return <EmptyState title={errorTitle} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={onRetry} />;
  }
  if (isEmpty) return <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />;
  return <>{children}</>;
}
