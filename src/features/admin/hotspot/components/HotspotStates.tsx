'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Router, WifiOff } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import type { HotspotRouterState } from '../hooks/useHotspotRouter';

/** 503 ROUTER_UNREACHABLE from the hotspot API — the MikroTik could not be reached. */
export function isRouterOffline(error: unknown): boolean {
  return error instanceof ApiError && (error.code === 'ROUTER_UNREACHABLE' || error.status === 503);
}

/** Error state for a device read: an explicit offline state, or the backend's message. */
export function HotspotQueryError({
  error,
  routerName,
  title,
  onRetry,
  className,
}: {
  error: unknown;
  routerName?: string;
  title: string;
  onRetry: () => void;
  className?: string;
}) {
  if (isRouterOffline(error)) {
    return (
      <EmptyState
        className={className}
        icon={<WifiOff className="h-5 w-5" />}
        title={`${routerName || 'Router'} is offline`}
        description={errorMessage(error, 'Unable to reach the router.')}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }
  return (
    <EmptyState
      className={className}
      icon={<AlertTriangle className="h-5 w-5" />}
      title={title}
      description={errorMessage(error)}
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}

/**
 * Renders `children` only once a router is selectable: loading skeleton,
 * router-list error, or a "no routers" state otherwise.
 */
export function HotspotRouterGate({
  state,
  skeleton,
  children,
}: {
  state: HotspotRouterState;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useRouter();
  const { routersQuery, router } = state;
  if (routersQuery.isLoading) return <>{skeleton ?? <PageSkeleton variant="table" rows={6} />}</>;
  if (routersQuery.isError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Failed to load routers"
        description={errorMessage(routersQuery.error)}
        actionLabel="Retry"
        onAction={() => void routersQuery.refetch()}
      />
    );
  }
  if (!router) {
    return (
      <EmptyState
        icon={<Router className="h-5 w-5" />}
        title="No active routers"
        description="Hotspot data is read live from a MikroTik router. Add a router and mark it active first."
        actionLabel="Go to routers"
        onAction={() => navigate.push('/admin/routers')}
      />
    );
  }
  return <>{children}</>;
}
