'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { formatBdt, formatCount } from '@/lib/format';
import { usePlatformMetering } from '@/features/platform/shared/hooks/use-platform-catalog';
import { useLocale, useTranslations } from '@/i18n/locale-context';
import type { MeteringRow } from '@/features/platform/types';

type Translate = ReturnType<typeof useTranslations>;

const buildColumns = (t: Translate): LegacyColumnDef<MeteringRow, unknown>[] => [
  {
    accessorKey: 'name',
    header: t('platform.metering.page.colTenant', 'Tenant'),
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
        <div className="font-mono text-xs text-muted-foreground">{row.original.domain ?? t('platform.metering.page.noPortal', 'No portal')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'customers',
    header: t('platform.metering.page.colSubscribers', 'Subscribers'),
    size: 110,
    cell: ({ row }) => <span className="tabular-nums font-semibold">{formatCount(row.original.customers)}</span>,
  },
  {
    accessorKey: 'resellers',
    header: t('platform.metering.page.colResellers', 'Resellers'),
    size: 100,
    cell: ({ row }) => <span className="tabular-nums">{formatCount(row.original.resellers)}</span>,
  },
  {
    accessorKey: 'routers',
    header: t('platform.metering.page.colRouters', 'Routers'),
    size: 90,
    cell: ({ row }) => <span className="tabular-nums">{formatCount(row.original.routers)}</span>,
  },
  {
    accessorKey: 'smsSent',
    header: t('platform.metering.page.colSms', 'SMS this month'),
    size: 120,
    cell: ({ row }) => <span className="tabular-nums text-primary">{formatCount(row.original.smsSent)}</span>,
  },
  {
    accessorKey: 'paymentsCount',
    header: t('platform.metering.page.colPayments', 'Customer payments this month'),
    size: 200,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCount(row.original.paymentsCount)}{' '}
        <span className="text-muted-foreground">· ৳{formatBdt(row.original.paymentsAmountBdt)}</span>
      </span>
    ),
  },
];

export function PlatformMeteringPage() {
  const { t } = useLocale();
  const columns = useMemo(() => buildColumns(t), [t]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePlatformMetering(page, pageSize, search);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.metering.page.loadFailed', 'Failed to load metering')}
        description={error instanceof Error ? error.message : undefined}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.metering.page.title', 'Usage Metering')}
        subtitle={t('platform.metering.page.subtitle', 'Per-tenant usage for {period}: subscribers, resellers, routers, SMS and collected customer payments', { period: s.period })}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('nav.platform-metering', 'Metering') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatCount(s.tenants)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.metering.page.statTenants', 'ISP tenants')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{formatCount(s.customers)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.metering.page.statSubscribers', 'subscribers platform-wide')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">{formatCount(s.routers)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.metering.page.statRouters', 'routers')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{formatCount(s.smsSent)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.metering.page.statSms', 'SMS sent this month')}</span>
        </p>
      </div>

      <DataTable urlState
        columns={columns}
        data={data.items}
        getRowId={(row) => row.adminId}
        searchPlaceholder={t('platform.metering.page.searchPlaceholder', 'Search tenant admin name, email or phone...')}
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
        emptyTitle={t('platform.metering.page.emptyTitle', 'No tenants found')}
        emptyDescription={t('platform.metering.page.emptyHint', 'Tenant usage appears here once ISP admins exist.')}
      />
    </div>
  );
}
