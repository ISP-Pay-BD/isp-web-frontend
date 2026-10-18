'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/features/shared/data-table';
import { usePlatformSla } from '@/features/platform/shared/hooks/use-platform-catalog';
import type { SlaRow } from '@/features/platform/types';
import { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

function postureLabel(t: Translate, severity: string): string {
  if (severity === 'ok') return t('platform.sla.page.postureOk', 'ok');
  if (severity === 'watch') return t('platform.sla.page.postureWatch', 'watch');
  if (severity === 'critical') return t('platform.sla.page.postureCritical', 'critical');
  return severity;
}

function buildColumns(t: Translate): LegacyColumnDef<SlaRow, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: t('platform.sla.page.colTenant', 'Tenant'),
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
          <div className="font-mono text-xs text-muted-foreground">{row.original.tenantSlug ?? t('platform.sla.page.noPortal', 'No portal')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'routerAvailabilityPct',
      header: t('platform.sla.page.colRouters', 'Routers active'),
      size: 170,
      cell: ({ row }) => {
        const r = row.original;
        if (r.routerAvailabilityPct === null) return <span className="text-muted-foreground">{t('platform.sla.page.noRouters', 'No routers')}</span>;
        return (
          <div>
            <span className="tabular-nums font-semibold">{r.routerAvailabilityPct.toFixed(1)}%</span>
            <span className="ml-1 text-xs text-muted-foreground">
              {t('platform.sla.page.routerDetail', '({active}/{total}, target {target}%)', {
                active: r.routersActive,
                total: r.routersTotal,
                target: r.targetPct,
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'openTickets',
      header: t('platform.sla.page.colTickets', 'Open tickets'),
      size: 110,
      cell: ({ row }) => <span className="tabular-nums font-semibold text-primary">{row.original.openTickets}</span>,
    },
    {
      accessorKey: 'severity',
      header: t('platform.sla.page.colPosture', 'Posture'),
      size: 110,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          tone={row.original.severity === 'ok' ? 'success' : row.original.severity === 'watch' ? 'warning' : row.original.severity === 'critical' ? 'danger' : undefined} className="capitalize font-semibold text-xs px-2 py-0.5"
        >
          {postureLabel(t, row.original.severity)}
        </Badge>
      ),
    },
  ];
}

export function PlatformSlaPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePlatformSla(page, pageSize, search);
  const columns = useMemo(() => buildColumns(t), [t]);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.sla.page.loadFailed', 'Failed to load SLA')}
        description={error instanceof Error ? error.message : undefined}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const watching = data.items.filter((r) => r.severity !== 'ok').length;
  const openTickets = data.items.reduce((s, r) => s + r.openTickets, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.sla.page.title', 'Tenant SLA Monitoring')}
        subtitle={t('platform.sla.page.subtitle', "Router availability (share of each tenant's routers currently marked active) and open support tickets")}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('nav.platform-sla', 'Tenant SLA') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.total}</span>{' '}
          <span className="text-muted-foreground">{t('platform.sla.page.monitored', 'monitored tenants')}</span>
        </p>
        <p>
          <span className={`font-semibold tabular-nums ${watching > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{watching}</span>{' '}
          <span className="text-muted-foreground">{t('platform.sla.page.attention', 'need attention on this page')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{openTickets}</span>{' '}
          <span className="text-muted-foreground">{t('platform.sla.page.ticketsOnPage', 'open tickets on this page')}</span>
        </p>
      </div>

      <DataTable urlState
        columns={columns}
        data={data.items}
        getRowId={(row) => row.adminId}
        searchPlaceholder={t('platform.sla.page.searchPlaceholder', 'Search tenant admin name, email or phone...')}
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
        emptyTitle={t('platform.sla.page.emptyTitle', 'No tenants found')}
        emptyDescription={t('platform.sla.page.emptyDesc', 'Tenant posture appears here once ISP admins exist.')}
      />
    </div>
  );
}
