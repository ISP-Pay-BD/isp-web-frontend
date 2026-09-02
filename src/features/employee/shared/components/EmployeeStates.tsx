import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
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
  icon = <Inbox className="text-muted-foreground/60 h-10 w-10" />,
  title,
  description,
  action,
}: EmployeeEmptyStateProps) {
  return (
    <div className="bg-card flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface EmployeeErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function EmployeeErrorState({
  message = 'Failed to load data. Please try again.',
  onRetry,
}: EmployeeErrorStateProps) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex min-h-[260px] flex-col items-center justify-center rounded-xl border p-8 text-center">
      <div className="bg-destructive/10 text-destructive mb-4 rounded-full p-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-destructive text-base font-semibold">Something went wrong</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5 gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
