'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/features/shared/data-table';
import { usePlatformSla } from '@/features/platform/shared/hooks/use-platform-catalog';
import type { SlaRow } from '@/features/platform/types';
import { cn } from '@/lib/utils';

const columns: LegacyColumnDef<SlaRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Tenant',
    size: 240,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        {row.original.tenantId ? (
          <Link href={`/platform/tenants/${row.original.tenantId}/health`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ) : (
          <span className="font-medium">{row.original.name}</span>
        )}
        <div className="font-mono text-[11px] text-muted-foreground">{row.original.tenantSlug ?? 'No portal'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'routerAvailabilityPct',
    header: 'Routers active',
    size: 170,
    cell: ({ row }) => {
      const r = row.original;
      if (r.routerAvailabilityPct === null) return <span className="text-muted-foreground">No routers</span>;
      return (
        <div>
          <span className="tabular-nums font-semibold">{r.routerAvailabilityPct.toFixed(1)}%</span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({r.routersActive}/{r.routersTotal}, target {r.targetPct}%)
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'openTickets',
    header: 'Open tickets',
    size: 110,
    cell: ({ row }) => <span className="tabular-nums font-semibold text-primary">{row.original.openTickets}</span>,
  },
  {
    accessorKey: 'severity',
    header: 'Posture',
    size: 110,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          'capitalize font-semibold text-xs px-2 py-0.5',
          row.original.severity === 'ok' && 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
          row.original.severity === 'watch' && 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
          row.original.severity === 'critical' && 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10',
        )}
      >
        {row.original.severity}
      </Badge>
    ),
  },
];

export function PlatformSlaPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePlatformSla(page, pageSize, search);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load SLA"
        description={error instanceof Error ? error.message : undefined}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const watching = data.items.filter((r) => r.severity !== 'ok').length;
  const openTickets = data.items.reduce((s, r) => s + r.openTickets, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant SLA Monitoring"
        subtitle="Router availability (share of each tenant's routers currently marked active) and open support tickets"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Tenant SLA' },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.total}</span>{' '}
          <span className="text-muted-foreground">monitored tenants</span>
        </p>
        <p>
          <span className={`font-semibold tabular-nums ${watching > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{watching}</span>{' '}
          <span className="text-muted-foreground">need attention on this page</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{openTickets}</span>{' '}
          <span className="text-muted-foreground">open tickets on this page</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        getRowId={(row) => row.adminId}
        searchPlaceholder="Search tenant admin name, email or phone..."
        server={{
          page,
          pageSize,
          total: data.total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange: (q) => {
            setSearch(q);
            setPage(1);
          },
        }}
        emptyTitle="No tenants found"
        emptyDescription="Tenant posture appears here once ISP admins exist."
      />
    </div>
  );
}
