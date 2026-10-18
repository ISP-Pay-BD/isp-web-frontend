'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useIpPools } from '@/features/admin/ip-pools/hooks/useIpPools';
import { utilisationPct, type IpPool } from '@/features/admin/ip-pools/types';
import { useServerTable } from '../hooks/use-server-table';

/**
 * CGNAT map = the tenant's PRIVATE (NAT) IP pools with their real address
 * usage (GET /v1/ip-pools?pool_type=private). Public-pool pairing and
 * per-user port budgets are not recorded by the platform, so not shown.
 */
export function CgnatPage() {
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useIpPools({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    type: 'private',
  });

  const columns = useMemo<LegacyColumnDef<IpPool, unknown>[]>(
    () => [
      {
        accessorKey: 'cidr',
        header: 'Private range',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-xs tabular-nums">
            {row.original.cidr || `${row.original.startIp} – ${row.original.endIp}`}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Pool',
        cell: ({ row }) => <span className="text-foreground font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'routerName',
        header: 'Router',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.routerName || '—'}</span>,
      },
      {
        id: 'usage',
        accessorKey: 'used',
        header: 'Assigned',
        cell: ({ row }) => {
          const { used, size } = row.original;
          const pct = utilisationPct(used, size);
          return (
            <div className="min-w-[150px] space-y-1">
              <span className="text-foreground font-mono text-xs tabular-nums">
                {used.toLocaleString()}
                <span className="text-muted-foreground/60">/{size === null ? '—' : size.toLocaleString()}</span>
                <span className={`ml-1.5 text-[10px] ${pct > 80 ? 'text-red-500' : pct > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{pct}%</span>
              </span>
              <Progress value={pct} className="h-1" />
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs">
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load NAT pools" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data?.items ?? [];
  const assigned = rows.reduce((s, r) => s + r.used, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="CGNAT Map"
        subtitle="Private (NAT) address pools and how many addresses are assigned"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'CGNAT Map' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: (data?.meta.total ?? 0).toLocaleString(), label: 'private pools' },
          { value: assigned.toLocaleString(), label: 'addresses assigned (this page)' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchPlaceholder="Search pool, range or router…"
        emptyTitle={table.search ? 'No pools match your search' : 'No private pools yet'}
        emptyDescription="Create a private IP pool under IP Pools to manage CGNAT ranges."
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
