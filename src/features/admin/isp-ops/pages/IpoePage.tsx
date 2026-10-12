'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useIpoeCustomers, type IpoeCustomer } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';

const statusBadgeClass: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
  inactive: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/25',
};

const mono = (v: string | null) => <span className="text-foreground font-mono text-xs tabular-nums">{v ?? '—'}</span>;

/** IPoE = static (MAC/IP-bound) customers and their router binding. */
export function IpoePage() {
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useIpoeCustomers({ page: table.page, pageSize: table.pageSize, search: table.search });

  const columns = useMemo<LegacyColumnDef<IpoeCustomer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <p className="text-foreground font-medium">{row.original.name}</p>
            <p className="text-muted-foreground text-xs font-mono">{row.original.mobile ?? '—'}</p>
          </div>
        ),
      },
      { accessorKey: 'mac', header: 'MAC', cell: ({ row }) => mono(row.original.mac) },
      { accessorKey: 'ip', header: 'IPv4', cell: ({ row }) => mono(row.original.ip) },
      { accessorKey: 'gateway', header: 'Gateway', cell: ({ row }) => mono(row.original.gateway) },
      {
        accessorKey: 'maxLimit',
        header: 'Rate limit',
        cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{row.original.maxLimit ?? '—'}</span>,
      },
      {
        accessorKey: 'routerName',
        header: 'Router',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.routerName ?? '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className={`capitalize ${statusBadgeClass[row.original.status] ?? ''}`}>
            {row.original.status || '—'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load IPoE customers" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="IPoE Sessions"
        subtitle="MAC/IP-bound static customers and their router binding"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'IPoE' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: (data?.summary.total ?? 0).toLocaleString(), label: 'static customers' },
          { value: (data?.summary.active ?? 0).toLocaleString(), label: 'active' },
        ]}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row, i) => `${row.userId}-${i}`}
        searchPlaceholder="Search name, mobile, IP or MAC…"
        emptyTitle={table.search ? 'No customers match your search' : 'No static (IPoE) customers'}
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
