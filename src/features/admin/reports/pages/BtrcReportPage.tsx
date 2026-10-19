'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Download, Users, Activity, Receipt, Building2, MapPin, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAreaOptions, useBtrcReport, downloadBtrc, type BtrcFilters, type BtrcSubscriber } from '../hooks/use-btrc-report';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useUrlParam } from '@/hooks/use-url-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';

const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function clientTypeLabel(t: ReturnType<typeof useTranslations>, value: string): string {
  const key = value.toLowerCase();
  if (key === 'home') return t('admin.reports.btrc.typeHome', 'Home');
  if (key === 'corporate') return t('admin.reports.btrc.typeCorporate', 'Corporate');
  return titleCase(value);
}

export function BtrcReportPage() {
  const t = useTranslations();
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(globalTableLayout ?? 'full');
  const table = useServerTable();
  const [statusParam, setStatusParam] = useUrlParam('status');
  const [typeParam, setTypeParam] = useUrlParam('type');
  const [areaParam, setAreaParam] = useUrlParam('area');
  const filters = useMemo<BtrcFilters>(
    () => ({
      page: table.page,
      pageSize: table.pageSize,
      search: table.search,
      status: statusParam || 'all',
      clientType: typeParam || 'all',
      areaId: areaParam || 'all',
    }),
    [table.page, table.pageSize, table.search, statusParam, typeParam, areaParam],
  );
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'csv' | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useBtrcReport(filters);
  const areas = useAreaOptions();

  useEffect(() => {
    if (globalTableLayout) setLayoutMode(globalTableLayout);
  }, [globalTableLayout]);

  // Client-type options come from the report itself (plus the active filter).
  const seenTypes = useMemo(() => {
    const keys = Object.keys(data?.summary.byClientType ?? {}).filter((k) => k !== 'unspecified');
    if (filters.clientType !== 'all') keys.push(filters.clientType);
    return Array.from(new Set(keys)).sort();
  }, [data, filters.clientType]);

  const subscribers = useMemo(() => data?.items ?? [], [data?.items]);

  const columns = useMemo<LegacyColumnDef<BtrcSubscriber, unknown>[]>(
    () => [
      {
        id: 'sl',
        header: t('admin.reports.btrc.colSl', 'SL'),
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'hide' },
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{(table.page - 1) * table.pageSize + row.index + 1}</span>,
      },
      {
        id: 'clientName',
        header: t('admin.reports.btrc.colName', 'Client name'),
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => <span className="font-bold text-foreground">{row.original.clientName || '—'}</span>,
      },
      {
        id: 'mobile',
        header: t('admin.reports.btrc.colMobile', 'Mobile'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.mobile || '—'}</span>,
      },
      {
        id: 'package',
        header: t('admin.reports.btrc.colPackage', 'Package'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.packageName || '—'}</span>,
      },
      {
        id: 'bandwidth',
        header: t('admin.reports.btrc.colBandwidth', 'Bandwidth'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.bandwidth ? (
            <Badge variant="secondary" className="bg-muted/60 font-mono text-xs">
              {row.original.bandwidth}
            </Badge>
          ) : (
            '—'
          ),
      },
      {
        id: 'rate',
        header: t('admin.reports.btrc.colRate', 'Rate (BDT)'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-foreground">{row.original.priceBdt === null ? '—' : <CurrencyDisplay amount={row.original.priceBdt} />}</span>
        ),
      },
      {
        id: 'area',
        header: t('admin.reports.btrc.colArea', 'Area'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-foreground">{row.original.area || '—'}</span>,
      },
      {
        id: 'clientType',
        header: t('admin.reports.btrc.colType', 'Client type'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.clientType ? (
            <Badge variant="outline" tone={row.original.clientType.toLowerCase() === 'corporate' ? undefined : 'info'} className="font-medium capitalize">
              {clientTypeLabel(t, row.original.clientType)}
            </Badge>
          ) : (
            '—'
          ),
      },
      {
        id: 'status',
        header: t('admin.reports.btrc.colStatus', 'Status'),
        enableSorting: false,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status === 'active' ? 'active' : 'expired'}
            label={row.original.status ? t(`status.${row.original.status.toLowerCase()}`, row.original.status) : '—'}
          />
        ),
      },
    ],
    [table.page, table.pageSize, t],
  );

  const patch = (apply: () => void) => {
    apply();
    table.resetPage();
  };

  const exportAs = async (kind: 'pdf' | 'excel' | 'csv') => {
    setExporting(kind);
    try {
      await downloadBtrc(kind, filters);
      toast.success(t('admin.reports.btrc.downloaded', 'BTRC report downloaded ({kind})', { kind: kind.toUpperCase() }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.reports.btrc.loadFailed', 'Failed to load BTRC report')}
        description={errorMessage(error)}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const summary = data?.summary;
  const home = summary?.byClientType.home ?? 0;
  const corporate = summary?.byClientType.corporate ?? 0;

  return (
    <div className={cn('space-y-6 pb-16', layoutMode === 'centered' ? 'max-w-6xl mx-auto' : 'w-full')}>
      <PageHeader
        title={t('admin.reports.btrc.title', 'BTRC Regulatory Report')}
        subtitle={t('admin.reports.btrc.subtitle', 'Subscriber census with package, bandwidth, area and client type for BTRC filing.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.reports', 'Reports') },
          { label: t('admin.reports.btrc.crumb', 'BTRC Report') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportAs('pdf')} disabled={!!exporting} className="text-xs h-8">
              {exporting === 'pdf' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />} PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAs('excel')} disabled={!!exporting} className="text-xs h-8">
              {exporting === 'excel' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />} Excel
            </Button>
            <Button size="sm" onClick={() => exportAs('csv')} disabled={!!exporting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5">
              {exporting === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label={t('admin.reports.btrc.kpiSubscribers', 'Subscribers')} icon={<Users className="h-4 w-4" />} tone="bg-primary/10 text-primary">
          {summary?.subscribers ?? 0}
        </Kpi>
        <Kpi label={t('status.active', 'Active')} icon={<Activity className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500">
          {summary?.active ?? 0}
        </Kpi>
        <Kpi label={t('admin.reports.btrc.kpiRevenue', 'Declared monthly revenue')} icon={<Receipt className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500">
          <CurrencyDisplay amount={summary?.declaredRevenueBdt ?? 0} />
        </Kpi>
        <Kpi label={t('admin.reports.btrc.kpiHomeCorporate', 'Home / Corporate')} icon={<Building2 className="h-4 w-4" />} tone="bg-purple-500/10 text-purple-500">
          {home} <span className="text-sm font-normal text-muted-foreground">/</span> {corporate}
        </Kpi>
      </div>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={subscribers}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.reports.btrc.searchPlaceholder', 'Search name, mobile or email...')}
        emptyTitle={t('admin.reports.btrc.emptyTitle', 'No subscribers match')}
        emptyDescription={t('admin.reports.btrc.emptyHint', 'Clear the search or filters.')}
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <>
            <Select value={filters.clientType} onValueChange={(v) => patch(() => setTypeParam(!v || v === 'all' ? '' : v))}>
              <SelectTrigger className="h-9 w-[130px] text-xs" aria-label={t('admin.reports.btrc.filterType', 'Filter by client type')}>
                <SelectValue placeholder={t('admin.reports.btrc.allTypes', 'All types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.reports.btrc.allTypes', 'All types')}</SelectItem>
                {seenTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {clientTypeLabel(t, type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.areaId} onValueChange={(v) => patch(() => setAreaParam(!v || v === 'all' ? '' : v))}>
              <SelectTrigger className="h-9 w-[150px] text-xs" aria-label={t('admin.reports.btrc.filterArea', 'Filter by area')}>
                <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder={t('admin.customers.list.allAreasShort', 'All areas')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.list.allAreasShort', 'All areas')}</SelectItem>
                {(areas.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => patch(() => setStatusParam(!v || v === 'all' ? '' : v))}>
              <SelectTrigger className="h-9 w-[120px] text-xs" aria-label={t('admin.reports.btrc.filterStatus', 'Filter by status')}>
                <SelectValue placeholder={t('admin.reports.btrc.allStatus', 'All status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.reports.btrc.allStatus', 'All status')}</SelectItem>
                <SelectItem value="active">{t('status.active', 'Active')}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive', 'Inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  );
}

function Kpi({ label, icon, tone, children }: { label: string; icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
    </Card>
  );
}
