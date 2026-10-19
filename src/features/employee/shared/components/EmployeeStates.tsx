'use client';

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n/locale-context';

export function EmployeeLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

interface EmployeeEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmployeeEmptyState({
  icon = <Inbox className="text-muted-foreground h-5 w-5" />,
  title,
  description,
  action,
}: EmployeeEmptyStateProps) {
  return (
    <div className="bg-muted/25 border-border/70 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed px-8 py-12 text-center shadow-[var(--shadow-xs)]">
      <div className="border-border/60 bg-card text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-[var(--shadow-xs)]">
        {icon}
      </div>
      <h3 className="text-foreground text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface EmployeeErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function EmployeeErrorState({ message, onRetry }: EmployeeErrorStateProps) {
  const t = useTranslations();
  return (
    <EmptyState
      variant="error"
      title={t('employee.common.loadFailed', 'Could not load data')}
      description={message ?? t('employee.common.loadFailedHint', 'Could not load this page. Try again.')}
      actionLabel={onRetry ? t('employee.common.tryAgain', 'Try again') : undefined}
      onAction={onRetry}
    />
  );
}
