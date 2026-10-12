'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { formatBdt } from '@/lib/format';
import { usePlatformMetering } from '@/features/platform/shared/hooks/use-platform-catalog';
import type { MeteringRow } from '@/features/platform/types';

const columns: LegacyColumnDef<MeteringRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Tenant',
    size: 240,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        {row.original.tenantId ? (
          <Link href={`/platform/tenants/${row.original.tenantId}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ) : (
          <span className="font-medium">{row.original.name}</span>
        )}
        <div className="font-mono text-[11px] text-muted-foreground">{row.original.domain ?? 'No portal'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'customers',
    header: 'Subscribers',
    size: 110,
    cell: ({ row }) => <span className="tabular-nums font-semibold">{row.original.customers.toLocaleString()}</span>,
  },
  {
    accessorKey: 'resellers',
    header: 'Resellers',
    size: 100,
    cell: ({ row }) => <span className="tabular-nums">{row.original.resellers.toLocaleString()}</span>,
  },
  {
    accessorKey: 'routers',
    header: 'Routers',
    size: 90,
    cell: ({ row }) => <span className="tabular-nums">{row.original.routers.toLocaleString()}</span>,
  },
  {
    accessorKey: 'smsSent',
    header: 'SMS this month',
    size: 120,
    cell: ({ row }) => <span className="tabular-nums text-primary">{row.original.smsSent.toLocaleString()}</span>,
  },
  {
    accessorKey: 'paymentsCount',
    header: 'Customer payments this month',
    size: 200,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.paymentsCount.toLocaleString()}{' '}
        <span className="text-muted-foreground">· ৳{formatBdt(row.original.paymentsAmountBdt)}</span>
      </span>
    ),
  },
];

export function PlatformMeteringPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePlatformMetering(page, pageSize, search);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load metering"
        description={error instanceof Error ? error.message : undefined}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Usage Metering"
        subtitle={`Per-tenant usage for ${s.period}: subscribers, resellers, routers, SMS and collected customer payments`}
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Metering' },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{s.tenants.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">ISP tenants</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{s.customers.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">subscribers platform-wide</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">{s.routers.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">routers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{s.smsSent.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">SMS sent this month</span>
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
        emptyDescription="Tenant usage appears here once ISP admins exist."
      />
    </div>
  );
}
