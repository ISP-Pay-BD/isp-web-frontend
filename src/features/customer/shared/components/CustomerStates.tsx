import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomerLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Bento Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="lg:col-span-5 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-7 h-72 rounded-2xl" />
      </div>
      {/* 4 KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      {/* 3 Bottom Bento Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

interface CustomerEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function CustomerEmptyState({
  icon = <Inbox className="h-10 w-10 text-muted-foreground/60" />,
  title,
  description,
  action,
}: CustomerEmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-card">
      <div className="mb-4 rounded-full bg-muted p-4">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface CustomerErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function CustomerErrorState({
  message = 'Failed to load data. Please check your internet connection.',
  onRetry,
}: CustomerErrorStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-destructive">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5 gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
