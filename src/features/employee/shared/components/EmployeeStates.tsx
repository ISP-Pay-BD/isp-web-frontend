import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

export function EmployeeErrorState({
  message = 'Could not load this page. Try again.',
  onRetry,
}: EmployeeErrorStateProps) {
  return (
    <div className="border-destructive/25 bg-destructive/5 flex min-h-[260px] flex-col items-center justify-center rounded-xl border px-8 py-12 text-center shadow-[var(--shadow-xs)]">
      <div className="border-destructive/20 bg-card text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-lg border">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-foreground text-base font-semibold tracking-tight">Could not load data</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5 gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
