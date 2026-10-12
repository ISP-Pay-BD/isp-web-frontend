'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  AlignJustify,
  AlignCenter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CurrencyDisplay, PageSkeleton, EmptyState, TablePagination } from '@/components/shared';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useServerTable } from '@/features/admin/accounting/shared/table-utils';
import {
  DateRangeInputs,
  DebouncedSearchInput,
} from '@/features/admin/accounting/shared/components';
import { humanize, ymd } from '@/features/admin/accounting/shared/format';
import {
  useExportOtcReport,
  useOtcReport,
  type OtcFilters,
  type OtcStatusFilter,
} from '../hooks/use-otc-report';

const STATUS_TABS: Array<{ value: OtcStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'due', label: 'Due' },
  { value: 'pending', label: 'Pending' },
];

const OTC_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  due: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export function OtcReportPage() {
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const setGlobalTableLayout = useThemeCustomizerStore((s) => s.setTableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(globalTableLayout ?? 'full');

  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const toggleLayoutMode = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    setGlobalTableLayout(mode);
  };

  const { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage } =
    useServerTable(20);
  const [status, setStatus] = useState<OtcStatusFilter>('all');
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
  const rows = data?.items ?? [];
  const summary = data?.summary;

  if (isPending) return <PageSkeleton variant="table" rows={6} />;

  return (
    <div
      className={cn(
        'space-y-6 pb-16 transition-all duration-200',
        layoutMode === 'centered' ? 'mx-auto max-w-6xl' : 'w-full',
      )}
    >
      {/* Header */}
      <PageHeader
        title="OTC Report — One-time connection charges"
        subtitle="One-time installation / connection charges billed per customer connection, with their payment status."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Reports' },
          { label: 'OTC Report' },
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
              Refresh
            </Button>
            <Button
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate(filters, {
                  onSuccess: (n) =>
                    toast.success(n ? `Exported ${n} OTC records` : 'No OTC records to export'),
                })
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />{' '}
              {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips — summary for the current filters */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Total OTC
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
              Paid OTC
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
                  {summary.paidCount.toLocaleString()} paid
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
              Due OTC
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
                  {summary.dueCount.toLocaleString()} due
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
              Pending
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
              {summary ? summary.pendingCount.toLocaleString() : '—'}
            </span>
            {summary && <span className="text-muted-foreground text-xs">connections</span>}
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <DebouncedSearchInput
            onSearchChange={onSearchChange}
            placeholder="Search customer, fiber code..."
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
              {STATUS_TABS.map((t) => (
                <Button
                  key={t.value}
                  type="button"
                  size="sm"
                  variant={status === t.value ? 'default' : 'ghost'}
                  onClick={() => {
                    setStatus(t.value);
                    resetPage();
                  }}
                  className="h-7 px-2.5 text-xs"
                >
                  {t.label}
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

            {/* Table Layout Toggle */}
            <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
              <button
                type="button"
                onClick={() => toggleLayoutMode('full')}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition duration-150',
                  layoutMode === 'full'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Full width layout"
              >
                <AlignJustify className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full</span>
              </button>
              <button
                type="button"
                onClick={() => toggleLayoutMode('centered')}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition duration-150',
                  layoutMode === 'centered'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title="Centered container layout"
              >
                <AlignCenter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isError ? (
        <EmptyState
          title="Failed to load OTC report"
          description={error.message}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No OTC records"
          description={
            search || status !== 'all' || range.from || range.to
              ? 'No connections match the current filters.'
              : 'Connections with a one-time charge will appear here.'
          }
        />
      ) : (
        <Card
          className={cn(
            'border-border/70 bg-card ring-border/50 overflow-hidden shadow-2xs ring-1 transition-opacity',
            isPlaceholderData && 'opacity-60',
          )}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Connection
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Client Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Fiber Code
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                    OTC Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    OTC Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Billing Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider uppercase">
                    Created
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border/60 divide-y">
                {rows.map((row) => (
                  <TableRow key={row.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs">
                      <div className="text-foreground font-medium">{row.userName || '—'}</div>
                      {row.userId && (
                        <div className="text-muted-foreground font-mono text-[10px]">
                          #{row.userId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {row.connectionType ? humanize(row.connectionType) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {row.clientType ? humanize(row.clientType) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {row.fiberCode || '—'}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-mono text-xs font-bold">
                      <CurrencyDisplay amount={row.otc} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-medium',
                          OTC_STATUS_STYLES[row.otcStatus] ?? 'text-muted-foreground',
                        )}
                      >
                        {humanize(row.otcStatus) || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.billingStatus ? (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground border-border/60 text-[10px] font-medium"
                        >
                          {humanize(row.billingStatus)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{ymd(row.createdAt) || '—'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Server pagination */}
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={data?.meta.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Card>
      )}
    </div>
  );
}
