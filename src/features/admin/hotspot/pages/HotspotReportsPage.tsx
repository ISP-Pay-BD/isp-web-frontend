'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useHotspotRouter } from '../hooks/useHotspotRouter';
import { fetchHotspotReportRows, useHotspotReport } from '../hooks/useHotspotData';
import { HotspotRouterSelect } from '../components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '../components/HotspotStates';
import { HotspotKpi, HotspotKpiRow } from '../components/HotspotKpi';
import type { HotspotSale } from '../types';
import { downloadCsv, ymd } from '../utils';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';
import { CalendarRange, Download, Loader2, Receipt, Ticket, TrendingUp, User } from 'lucide-react';

type Period = 'today' | '7d' | 'month' | 'all';

type Translate = ReturnType<typeof useLocale>['t'];

const periods = (t: Translate): { value: Period; label: string }[] => [
  { value: 'today', label: t('admin.hotspot.reports.today', 'Today') },
  { value: '7d', label: t('admin.hotspot.reports.last7', 'Last 7 days') },
  { value: 'month', label: t('admin.hotspot.reports.thisMonth', 'This month') },
  { value: 'all', label: t('admin.hotspot.reports.allTime', 'All time') },
];

function periodRange(period: Period): { from?: string; to?: string } {
  const now = new Date();
  if (period === 'all') return {};
  if (period === 'today') return { from: ymd(now), to: ymd(now) };
  if (period === '7d') return { from: ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)), to: ymd(now) };
  return { from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: ymd(now) };
}

export function HotspotReportsPage() {
  const { t } = useLocale();
  const hs = useHotspotRouter();
  const [period, setPeriod] = useState<Period>('month');
  const periodOptions = periods(t);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.hotspot.reports.title', 'Hotspot Sales & Revenue Report')}
        subtitle={t(
          'admin.hotspot.reports.subtitle',
          'Voucher sales recorded on the selected router by profiles whose expiry mode records sales.',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.hotspot', 'Hotspot'), href: '/admin/hotspot' },
          { label: t('admin.hotspot.reports.crumb', 'Sales Reports') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            <Select value={period} onValueChange={(v) => v && setPeriod(v as Period)} items={periodOptions}>
              <SelectTrigger className="h-9 min-w-36" aria-label={t('admin.hotspot.reports.period', 'Period')}>
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? (
          <ReportBody key={`${hs.router.id}-${period}`} routerId={hs.router.id} routerName={hs.router.name} period={period} />
        ) : null}
      </HotspotRouterGate>
    </div>
  );
}

function ReportBody({ routerId, routerName, period }: { routerId: string; routerName: string; period: Period }) {
  const { t } = useLocale();
  const table = useServerTable();
  const { page, pageSize } = table;
  const [exporting, setExporting] = useState(false);
  const range = useMemo(() => periodRange(period), [period]);
  const report = useHotspotReport(routerId, { page, pageSize, ...range });

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await fetchHotspotReportRows(routerId, range);
      if (rows.length === 0) {
        toast.info(t('admin.hotspot.reports.nothingToExport', 'No sales in this period to export'));
        return;
      }
      downloadCsv(
        `hotspot_sales_${routerName || routerId}_${range.from ?? 'all'}_${range.to ?? 'all'}.csv`,
        ['Date', 'Time', 'Username', 'Profile', 'Price (BDT)', 'Comment'],
        rows.map((r) => [r.date, r.time, r.username, r.profile, r.price, r.comment]),
      );
      toast.success(t('admin.hotspot.reports.exported', 'Exported {n} sales', { n: rows.length }));
    } catch (err) {
      toast.error(errorMessage(err, t('admin.hotspot.reports.exportFailed', 'Export failed.')));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<HotspotSale, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: t('admin.hotspot.reports.colDate', 'Sale Date'),
        enableHiding: false,
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.date} {row.original.time}
          </span>
        ),
      },
      {
        accessorKey: 'username',
        header: t('admin.hotspot.reports.colUser', 'Voucher User'),
        enableHiding: false,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-foreground text-sm">{row.original.username}</span>
          </div>
        ),
      },
      {
        accessorKey: 'profile',
        header: t('admin.hotspot.col.profile', 'Profile'),
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-xs font-medium">
            {row.original.profile}
          </Badge>
        ),
      },
      {
        accessorKey: 'price',
        header: t('admin.hotspot.reports.colAmount', 'Amount'),
        size: 120,
        cell: ({ row }) => (
          <span className="font-bold text-sm tabular-nums text-foreground">{formatBdtWithSymbol(row.original.price)}</span>
        ),
      },
      {
        accessorKey: 'comment',
        header: t('admin.hotspot.reports.colComment', 'Comment'),
        size: 200,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.comment || '—'}</span>,
      },
    ],
    [t],
  );

  if (report.isError) {
    return (
      <HotspotQueryError
        error={report.error}
        routerName={routerName}
        title={t('admin.hotspot.reports.loadFailed', 'Failed to load hotspot sales')}
        onRetry={() => void report.refetch()}
      />
    );
  }

  const d = report.data;
  const periodLabel = periods(t).find((p) => p.value === period)?.label ?? '';

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label={t('admin.hotspot.reports.kpiTotal', 'Total Sales')}
          value={d ? formatBdtWithSymbol(d.totalSales) : '—'}
          hint={periodLabel}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.reports.kpiSold', 'Vouchers Sold')}
          value={d ? d.count : '—'}
          hint={t('admin.hotspot.reports.kpiSoldHint', 'Sales recorded on the router')}
          icon={<Ticket className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label={t('admin.hotspot.reports.kpiAvg', 'Avg per Voucher')}
          value={d ? formatBdtWithSymbol(d.count > 0 ? Math.round(d.totalSales / d.count) : 0) : '—'}
          hint={t('admin.hotspot.reports.kpiAvgHint', 'Total ÷ vouchers sold')}
          icon={<Receipt className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.reports.period', 'Period')}
          value={<span className="text-lg">{periodLabel}</span>}
          hint={range.from ? `${range.from} → ${range.to}` : t('admin.hotspot.reports.everySale', 'Every recorded sale')}
          icon={<CalendarRange className="h-4 w-4 text-sky-500" />}
        />
      </HotspotKpiRow>

      <DataTable urlState
        columns={columns}
        data={d?.items ?? []}
        isLoading={report.isLoading}
        emptyTitle={t('admin.hotspot.reports.emptyTitle', 'No sales in this period')}
        emptyDescription={t(
          'admin.hotspot.reports.emptyDesc',
          'A sale is recorded when a voucher on a “record sale” profile logs in for the first time.',
        )}
        getRowId={(r) => `${r.no}-${r.username}`}
        toolbarActions={
          <Button variant="outline" size="sm" onClick={() => void handleExport()} disabled={exporting || !d?.count} className="h-9">
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {t('admin.hotspot.reports.exportCsv', 'Export Sales CSV')}
          </Button>
        }
        // The report endpoint has no text search — paging only.
        server={{ ...table.server(d?.meta.total ?? 0), search: undefined, onSearchChange: undefined }}
      />
    </>
  );
}
