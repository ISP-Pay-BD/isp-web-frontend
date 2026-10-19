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
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useServerTable } from '../hooks/use-server-table';

/**
 * CGNAT map = the tenant's PRIVATE (NAT) IP pools with their real address
 * usage (GET /v1/ip-pools?pool_type=private). Public-pool pairing and
 * per-user port budgets are not recorded by the platform, so not shown.
 */
export function CgnatPage() {
  const t = useTranslations();
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
        header: t('admin.ops.cgnat.colRange', 'Private range'),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-xs tabular-nums">
            {row.original.cidr || `${row.original.startIp} – ${row.original.endIp}`}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('admin.ops.cgnat.colPool', 'Pool'),
        cell: ({ row }) => <span className="text-foreground font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'routerName',
        header: t('admin.ops.cgnat.colRouter', 'Router'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.routerName || '—'}</span>,
      },
      {
        id: 'usage',
        accessorKey: 'used',
        header: t('admin.ops.cgnat.colAssigned', 'Assigned'),
        cell: ({ row }) => {
          const { used, size } = row.original;
          const pct = utilisationPct(used, size);
          return (
            <div className="min-w-[150px] space-y-1">
              <span className="text-foreground font-mono text-xs tabular-nums">
                {formatCount(used)}
                <span className="text-muted-foreground/60">/{size === null ? '—' : formatCount(size)}</span>
                <span className={`ml-1.5 text-xs ${pct > 80 ? 'text-red-500' : pct > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{pct}%</span>
              </span>
              <Progress value={pct} className="h-1" />
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs">
            {t(`status.${row.original.status}`, row.original.status)}
          </Badge>
        ),
      },
    ],
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.cgnat.loadFailed', 'Failed to load NAT pools')}
        description={errorMessage(error)}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const rows = data?.items ?? [];
  const assigned = rows.reduce((s, r) => s + r.used, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.ops.cgnat.title', 'CGNAT Map')}
        subtitle={t('admin.ops.cgnat.subtitle', 'Private (NAT) address pools and how many addresses are assigned')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('admin.ops.cgnat.title', 'CGNAT Map') },
        ]}
      />
      <OpsSummaryStrip
        items={[
          { value: formatCount((data?.meta.total ?? 0)), label: t('admin.ops.cgnat.kpiPools', 'private pools') },
          { value: formatCount(assigned), label: t('admin.ops.cgnat.kpiAssigned', 'addresses assigned (this page)') },
        ]}
      />
      <DataTable urlState
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.cgnat.searchPlaceholder', 'Search pool, range or router…')}
        emptyTitle={table.search ? t('admin.ops.cgnat.emptyFiltered', 'No pools match your search') : t('admin.ops.cgnat.emptyNone', 'No private pools yet')}
        emptyDescription={t('admin.ops.cgnat.emptyHint', 'Create a private IP pool under IP Pools to manage CGNAT ranges.')}
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
