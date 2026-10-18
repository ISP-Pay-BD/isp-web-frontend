'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { useIpoeCustomers, type IpoeCustomer } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';

import { formatCount } from '@/lib/format';
const mono = (v: string | null) => <span className="text-foreground font-mono text-xs tabular-nums">{v ?? '—'}</span>;

/** IPoE = static (MAC/IP-bound) customers and their router binding. */
export function IpoePage() {
  const t = useTranslations();
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useIpoeCustomers({ page: table.page, pageSize: table.pageSize, search: table.search });

  const columns = useMemo<LegacyColumnDef<IpoeCustomer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.ipoe.colCustomer', 'Customer'),
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <p className="text-foreground font-medium">{row.original.name}</p>
            <p className="text-muted-foreground text-xs font-mono">{row.original.mobile ?? '—'}</p>
          </div>
        ),
      },
      { accessorKey: 'mac', header: t('admin.ops.ipoe.colMac', 'MAC'), cell: ({ row }) => mono(row.original.mac) },
      { accessorKey: 'ip', header: 'IPv4', cell: ({ row }) => mono(row.original.ip) },
      { accessorKey: 'gateway', header: t('admin.ops.ipoe.colGateway', 'Gateway'), cell: ({ row }) => mono(row.original.gateway) },
      {
        accessorKey: 'maxLimit',
        header: t('admin.ops.ipoe.colRateLimit', 'Rate limit'),
        cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{row.original.maxLimit ?? '—'}</span>,
      },
      {
        accessorKey: 'routerName',
        header: t('admin.ops.ipoe.colRouter', 'Router'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.routerName ?? '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: t('admin.ops.ipoe.colStatus', 'Status'),
        cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : '—'),
      },
    ],
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.ipoe.loadFailed', 'Failed to load IPoE customers')} description={errorMessage(error)} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.ops.ipoe.title', 'IPoE Sessions')}
        subtitle={t('admin.ops.ipoe.subtitle', 'MAC/IP-bound static customers and their router binding')}
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'IPoE' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: formatCount((data?.summary.total ?? 0)), label: t('admin.ops.ipoe.sumStatic', 'static customers') },
          { value: formatCount((data?.summary.active ?? 0)), label: t('admin.ops.ipoe.sumActive', 'active') },
        ]}
      />
      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row, i) => `${row.userId}-${i}`}
        searchPlaceholder={t('admin.ops.ipoe.search', 'Search name, mobile, IP or MAC…')}
        emptyTitle={table.search ? t('admin.ops.ipoe.noMatch', 'No customers match your search') : t('admin.ops.ipoe.empty', 'No static (IPoE) customers')}
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
