'use client';

import { useMemo, useState, useEffect } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Receipt, Download, Calendar, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay, PageSkeleton, EmptyState } from '@/components/shared';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUrlParam } from '@/hooks/use-url-state';
import type { Tone } from '@/components/shared/status-tones';
import { useServerTable } from '@/features/admin/accounting/shared/table-utils';
import { DateRangeInputs } from '@/features/admin/accounting/shared/components';
import { humanize, ymd } from '@/features/admin/accounting/shared/format';
import {
  useExportOtcReport,
  useOtcReport,
  type OtcFilters,
  type OtcReportRow,
  type OtcStatusFilter,
} from '../hooks/use-otc-report';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

const STATUS_TABS: OtcStatusFilter[] = ['all', 'paid', 'due', 'pending'];

type Translate = ReturnType<typeof useTranslations>;

function statusText(t: Translate, value: string): string {
  return t(`status.${value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, humanize(value));
}

function clientTypeText(t: Translate, value: string): string {
  const key = value.toLowerCase();
  if (key === 'home') return t('admin.reports.btrc.typeHome', 'Home');
  if (key === 'corporate') return t('admin.reports.btrc.typeCorporate', 'Corporate');
  return humanize(value);
}

const OTC_STATUS_TONE: Record<string, Tone> = { paid: 'success', due: 'danger', pending: 'warning' };

export function OtcReportPage() {
  const t = useTranslations();
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(globalTableLayout ?? 'full');

  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage } =
    useServerTable(20);
  const [statusParam, setStatusParam] = useUrlParam('status');
  const status: OtcStatusFilter = STATUS_TABS.find((tab) => tab === statusParam) ?? 'all';
  const [range, setRange] = useState({ from: '', to: '' });
  const filters: OtcFilters = useMemo(
    () => ({ status, fromDate: range.from, toDate: range.to, search }),
    [status, range, search],
  );

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useOtcReport(
    filters,
    page,
    pageSize,
  );
  const exportCsv = useExportOtcReport();
  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;

  const tabLabel = (value: OtcStatusFilter) =>
    value === 'all'
      ? t('admin.customers.list.pillAll', 'All')
      : value === 'paid'
        ? t('status.paid', 'Paid')
        : value === 'due'
          ? t('status.due', 'Due')
          : t('status.pending', 'Pending');

  const columns = useMemo<LegacyColumnDef<OtcReportRow, unknown>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: t('admin.reports.otc.colCustomer', 'Customer'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div>
            <div className="text-foreground font-medium">{row.original.userName || '—'}</div>
            {row.original.userId && (
              <div className="text-muted-foreground font-mono text-xs font-normal">#{row.original.userId}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'connectionType',
        header: t('admin.reports.otc.colConnection', 'Connection'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.connectionType ? humanize(row.original.connectionType) : '—'}</span>
        ),
      },
      {
        accessorKey: 'clientType',
        header: t('admin.reports.otc.colClientType', 'Client Type'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.clientType ? clientTypeText(t, row.original.clientType) : '—'}</span>
        ),
      },
      {
        accessorKey: 'fiberCode',
        header: t('admin.reports.otc.colFiber', 'Fiber Code'),
        cell: ({ row }) => <span className="text-muted-foreground font-mono">{row.original.fiberCode || '—'}</span>,
      },
      {
        accessorKey: 'otc',
        header: t('admin.reports.otc.colOtc', 'OTC Amount'),
        cell: ({ row }) => (
          <span className="text-foreground font-mono font-bold">
            <CurrencyDisplay amount={row.original.otc} />
          </span>
        ),
      },
      {
        accessorKey: 'otcStatus',
        header: t('admin.reports.otc.colOtcStatus', 'OTC Status'),
        cell: ({ row }) => (
          <Badge variant="outline" tone={OTC_STATUS_TONE[row.original.otcStatus] ?? 'neutral'} className="font-medium">
            {row.original.otcStatus ? statusText(t, row.original.otcStatus) : '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'billingStatus',
        id: 'billing',
        header: t('admin.reports.otc.colBilling', 'Billing Status'),
        cell: ({ row }) =>
          row.original.billingStatus ? (
            <Badge variant="outline" tone="neutral" className="font-medium">
              {statusText(t, row.original.billingStatus)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.reports.otc.colCreated', 'Created'),
        cell: ({ row }) => (
          <div className="text-muted-foreground flex items-center gap-1.5 font-mono whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            <span>{ymd(row.original.createdAt) || '—'}</span>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isPending) return <PageSkeleton variant="table" rows={6} />;

  return (
    <div
      className={cn(
        'space-y-6 pb-16',
        layoutMode === 'centered' ? 'mx-auto max-w-6xl' : 'w-full',
      )}
    >
      {/* Header */}
      <PageHeader
        title={t('admin.reports.otc.title', 'OTC Report — One-time connection charges')}
        subtitle={t('admin.reports.otc.subtitle', 'One-time installation / connection charges billed per customer connection, with their payment status.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.reports', 'Reports') },
          { label: t('admin.reports.otc.crumb', 'OTC Report') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent h-8 text-xs"
            >
              <RefreshCw
                className={cn(
                  'text-muted-foreground mr-1.5 h-3.5 w-3.5',
                  isFetching && 'animate-spin',
                )}
              />{' '}
              {t('admin.reports.otc.refresh', 'Refresh')}
            </Button>
            <Button
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate(filters, {
                  onSuccess: (n) =>
                    toast.success(
                      n
                        ? t('admin.reports.otc.exported', 'Exported {n} OTC records', { n })
                        : t('admin.reports.otc.nothingToExport', 'No OTC records to export'),
                    ),
                })
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />{' '}
              {exportCsv.isPending ? t('admin.reports.otc.exporting', 'Exporting…') : t('admin.reports.otc.export', 'Export CSV')}
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips — summary for the current filters */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('admin.reports.otc.kpiTotal', 'Total OTC')}
            </span>
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {summary ? (
              <CurrencyDisplay
                amount={summary.totalOtc}
                className="text-foreground text-2xl font-bold tracking-tight"
              />
            ) : (
              <span className="text-muted-foreground text-2xl font-bold">—</span>
            )}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('admin.reports.otc.kpiPaid', 'Paid OTC')}
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {summary ? (
              <>
                <CurrencyDisplay
                  amount={summary.paidOtc}
                  className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-muted-foreground text-xs">
                  {t('admin.reports.otc.paidCount', '{n} paid', { n: formatCount(summary.paidCount) })}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-2xl font-bold">—</span>
            )}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('admin.reports.otc.kpiDue', 'Due OTC')}
            </span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {summary ? (
              <>
                <CurrencyDisplay
                  amount={summary.dueOtc}
                  className="text-2xl font-bold tracking-tight text-rose-500"
                />
                <span className="text-muted-foreground text-xs">
                  {t('admin.reports.otc.dueCount', '{n} due', { n: formatCount(summary.dueCount) })}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-2xl font-bold">—</span>
            )}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('status.pending', 'Pending')}
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
              {summary ? formatCount(summary.pendingCount) : '—'}
            </span>
            {summary && <span className="text-muted-foreground text-xs">{t('admin.reports.otc.connections', 'connections')}</span>}
          </div>
        </Card>
      </div>

      {isError ? (
        <EmptyState variant="error"
          title={t('admin.reports.otc.loadFailed', 'Failed to load OTC report')}
          description={error.message}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      ) : (
        <DataTable
          urlState
          className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.reports.otc.searchPlaceholder', 'Search customer, fiber code...')}
          emptyTitle={t('admin.reports.otc.emptyTitle', 'No OTC records')}
          emptyDescription={
            search || status !== 'all' || range.from || range.to
              ? t('admin.reports.otc.emptyFiltered', 'No connections match the current filters.')
              : t('admin.reports.otc.emptyHint', 'Connections with a one-time charge will appear here.')
          }
          server={{
            page,
            pageSize,
            total: data?.meta.total ?? 0,
            onPageChange: setPage,
            onPageSizeChange,
            search,
            onSearchChange,
          }}
          toolbarActions={
            <>
              <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
                {STATUS_TABS.map((tab) => (
                  <Button
                    key={tab}
                    type="button"
                    size="sm"
                    variant={status === tab ? 'default' : 'ghost'}
                    aria-pressed={status === tab}
                    onClick={() => {
                      setStatusParam(tab === 'all' ? '' : tab);
                      resetPage();
                    }}
                    className="h-7 px-2.5 text-xs"
                  >
                    {tabLabel(tab)}
                  </Button>
                ))}
              </div>

              <DateRangeInputs
                from={range.from}
                to={range.to}
                onChange={(r) => {
                  setRange(r);
                  resetPage();
                }}
              />
            </>
          }
        />
      )}
    </div>
  );
}
