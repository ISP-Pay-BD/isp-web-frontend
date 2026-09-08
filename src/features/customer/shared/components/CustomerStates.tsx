import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface CustomerLoadingSkeletonProps {
  variant?:
    | 'dashboard'
    | 'subscription'
    | 'payments'
    | 'packages'
    | 'router'
    | 'profile'
    | 'support'
    | 'rewards'
    | 'news'
    | 'form';
}

/** Dashboard skeleton — hero + summary strip + cards (no 4 equal KPI tiles) */
export function CustomerDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-xl lg:col-span-5" />
        <Skeleton className="h-72 rounded-xl lg:col-span-7" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-24" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

/** Subscription Screen Skeleton */
export function CustomerSubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current Plan Hero */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-60 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 py-3 border-y border-border/40">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-24 rounded-md" />
              <div className="space-y-2 py-2 border-y border-border/40">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Payments & Invoices Screen Skeleton */
export function CustomerPaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-28" />
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 sm:flex-row">
        <Skeleton className="h-9 w-full rounded-lg sm:w-72" />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
        <div className="flex items-center gap-4 px-4 py-3 bg-muted/30">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Packages Grid Screen Skeleton */
export function CustomerPackagesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
            <div className="space-y-2 py-3 border-y border-border/40">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/6" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Router Tools Screen Skeleton */
export function CustomerRouterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Router Info Header */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Diagnostics & WiFi Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
        <Skeleton className="h-5 w-44 mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/40">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Profile Screen Skeleton */
export function CustomerProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Overview */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col sm:flex-row items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-56" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Support Tickets Screen Skeleton */
export function CustomerSupportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-24" />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Rewards Screen Skeleton */
export function CustomerRewardsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Points Banner */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-44 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Rewards Vouchers Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-9 w-full rounded-lg mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** News Screen Skeleton */
export function CustomerNewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Articles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-28 pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Adaptive CustomerLoadingSkeleton router */
export function CustomerLoadingSkeleton({ variant = 'dashboard' }: CustomerLoadingSkeletonProps) {
  if (variant === 'subscription') return <CustomerSubscriptionSkeleton />;
  if (variant === 'payments') return <CustomerPaymentsSkeleton />;
  if (variant === 'packages') return <CustomerPackagesSkeleton />;
  if (variant === 'router') return <CustomerRouterSkeleton />;
  if (variant === 'profile') return <CustomerProfileSkeleton />;
  if (variant === 'support') return <CustomerSupportSkeleton />;
  if (variant === 'rewards') return <CustomerRewardsSkeleton />;
  if (variant === 'news') return <CustomerNewsSkeleton />;
  return <CustomerDashboardSkeleton />;
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
