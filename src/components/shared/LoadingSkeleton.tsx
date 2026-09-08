import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface PageSkeletonProps {
  rows?: number;
  className?: string;
  variant?: 'table' | 'dashboard' | 'form' | 'cards' | 'detail';
}

/** Dashboard skeleton — triage row + summary strip + charts (no 4 equal KPI tiles) */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl space-y-6 p-1 md:p-2', className)}>
      <div className="flex flex-col gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Triage actions — 3 unequal-weight slots, not KPI tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3.5"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        ))}
      </div>

      {/* Ops summary strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-20" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-60" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 p-2">
                <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full max-w-[180px]" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Table page skeleton — header + summary strip + filters + rows (list-hub shaped) */
export function TablePageSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl space-y-5 p-1 md:p-2', className)}>
      <div className="flex flex-col gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Summary strip — matches OpsSummaryStrip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-24" />
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 sm:flex-row">
        <Skeleton className="h-9 w-full rounded-lg sm:w-72" />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Table Box */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border/60 bg-muted/30">
          <Skeleton className="h-4 w-6 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28 hidden md:block" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border/40">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-6 rounded" />
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-44" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full hidden md:block" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Form Page Skeleton with input fields, labels, tabs, and action buttons */
export function FormPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 max-w-4xl mx-auto p-1 md:p-2', className)}>
      {/* Header */}
      <div className="space-y-2 border-b border-border/40 pb-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-60 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Form Card */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Card Grid Skeleton for packages, vouchers, devices, catalogs */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-6 max-w-7xl mx-auto p-1 md:p-2', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
            <div className="space-y-2 py-2 border-y border-border/40">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detail Page Skeleton with entity header, stats, and key-value sections */
export function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 max-w-5xl mx-auto p-1 md:p-2', className)}>
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-60 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Hero Overview Card */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Detail 2-column cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
          <Skeleton className="h-5 w-36 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border/40">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
          <Skeleton className="h-5 w-36 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border/40">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Adaptive PageSkeleton routing to screen-accurate layout */
export function PageSkeleton({ rows = 6, className, variant = 'table' }: PageSkeletonProps) {
  if (variant === 'dashboard') {
    return <DashboardSkeleton className={className} />;
  }
  if (variant === 'form') {
    return <FormPageSkeleton className={className} />;
  }
  if (variant === 'cards') {
    return <CardGridSkeleton className={className} />;
  }
  if (variant === 'detail') {
    return <DetailSkeleton className={className} />;
  }
  return <TablePageSkeleton rows={rows} className={className} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
