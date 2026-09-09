'use client';

import { useMemo, useState } from 'react';
import {
  Receipt,
  Download,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyDisplay, PageSkeleton, EmptyState, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useOtcReport } from '../hooks/use-otc-report';

export function OtcReportPage() {
  const { data: otcReport = [], isLoading, isError, refetch } = useOtcReport();
  const [periodFilter, setPeriodFilter] = useState('all'); // all | 7days | 30days
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const totalCollections = useMemo(
    () => otcReport.reduce((sum, r) => sum + r.collectionsBdt, 0),
    [otcReport]
  );
  const totalExpenses = useMemo(
    () => otcReport.reduce((sum, r) => sum + r.expensesBdt, 0),
    [otcReport]
  );
  const netCashFlow = totalCollections - totalExpenses;
  const latestClosing = otcReport[0]?.closingBdt ?? 0;

  const filtered = useMemo(() => {
    if (periodFilter === '7days') return otcReport.slice(0, 7);
    if (periodFilter === '30days') return otcReport.slice(0, 30);
    return otcReport;
  }, [otcReport, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedOtc = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = ['Date', 'Opening Balance (BDT)', 'Collections (BDT)', 'Expenses (BDT)', 'Closing Balance (BDT)'];
    const rows = filtered.map((r) => [r.date, r.openingBdt, r.collectionsBdt, r.expensesBdt, r.closingBdt]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `otc_cash_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Daily OTC cash report exported to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load OTC report"
          description="Could not load daily cash position."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <PageHeader
        title="OTC & Daily Cash Flow"
        subtitle="One-time installation charges, field hardware collections, operational cash outflows, and daily closing balances."
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
              onClick={() => toast.success('Daily cash flow statement printed')}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Print Statement
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export Ledger CSV
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total OTC Collected
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={totalCollections} className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Field Expenses
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={totalExpenses} className="text-2xl font-bold tracking-tight text-rose-500" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Cash Flow
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={netCashFlow} className="text-2xl font-bold tracking-tight text-foreground" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Latest Closing Balance
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={latestClosing} className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Period Filter:
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
              <Button
                type="button"
                size="sm"
                variant={periodFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setPeriodFilter('all')}
                className="text-xs h-7 px-2.5"
              >
                All Cycles
              </Button>
              <Button
                type="button"
                size="sm"
                variant={periodFilter === '7days' ? 'default' : 'ghost'}
                onClick={() => setPeriodFilter('7days')}
                className="text-xs h-7 px-2.5"
              >
                Last 7 Days
              </Button>
              <Button
                type="button"
                size="sm"
                variant={periodFilter === '30days' ? 'default' : 'ghost'}
                onClick={() => setPeriodFilter('30days')}
                className="text-xs h-7 px-2.5"
              >
                Last 30 Days
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            {filtered.length} daily ledger cycles
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Opening Balance</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Collections (+)</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Expenses (-)</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Closing Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {paginatedOtc.map((row) => (
                <TableRow key={row.date} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{row.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    <CurrencyDisplay amount={row.openingBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +<CurrencyDisplay amount={row.collectionsBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-rose-500">
                    -<CurrencyDisplay amount={row.expensesBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                    <CurrencyDisplay amount={row.closingBdt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Global Pagination Controls */}
        <TablePagination
          currentPage={safeCurrentPage}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>
    </div>
  );
}
