'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Layers,
  Calendar,
  X,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type UsageRow = IspOpsData['usageReports'][number];

export function UsageReportPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all'); // all | This month | Last month

  const rows: UsageRow[] = useMemo(() => data?.usageReports ?? [], [data?.usageReports]);

  const totalDownloadGb = useMemo(() => rows.reduce((s, r) => s + r.downloadGb, 0), [rows]);
  const totalUploadGb = useMemo(() => rows.reduce((s, r) => s + r.uploadGb, 0), [rows]);
  const maxPeakMbps = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.peakMbps)) : 0),
    [rows]
  );
  const avgUsageGb = useMemo(
    () => (rows.length ? Math.round((totalDownloadGb + totalUploadGb) / rows.length) : 0),
    [rows, totalDownloadGb, totalUploadGb]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          r.customerName.toLowerCase().includes(q) ||
          r.packageName.toLowerCase().includes(q) ||
          String(r.downloadGb).includes(q) ||
          String(r.peakMbps).includes(q);
        if (!matches) return false;
      }

      if (periodFilter !== 'all' && r.period.toLowerCase() !== periodFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [rows, search, periodFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Customer Name',
      'Package Plan',
      'Download (GB)',
      'Upload (GB)',
      'Total (GB)',
      'Peak Bandwidth (Mbps)',
      'Billing Period',
    ];
    const dataRows = filtered.map((r) => [
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.packageName,
      r.downloadGb,
      r.uploadGb,
      r.downloadGb + r.uploadGb,
      r.peakMbps,
      r.period,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_usage_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported bandwidth consumption report to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load usage reports"
        description="Could not query subscriber traffic logs."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <PageHeader
        title="Bandwidth Consumption Report"
        subtitle="Per-subscriber download/upload traffic breakdown, peak throughput measurements, and monthly quota audits."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Reports' },
          { label: 'Bandwidth Usage' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Bandwidth consumption summary printed')}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Print Summary
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export Usage CSV
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Download
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {totalDownloadGb.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">GB</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Upload
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalUploadGb.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">GB</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Network Peak Rate
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {maxPeakMbps}
            </span>
            <span className="text-xs text-muted-foreground">Mbps burst</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average / Subscriber
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {avgUsageGb}
            </span>
            <span className="text-xs text-muted-foreground">GB / month</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by customer name or package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Periods</SelectItem>
                <SelectItem value="this month">This Month</SelectItem>
                <SelectItem value="last month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Package Plan</th>
                <th className="py-3.5 px-4 text-right">Download (GB)</th>
                <th className="py-3.5 px-4 text-right">Upload (GB)</th>
                <th className="py-3.5 px-4 text-right">Total (GB)</th>
                <th className="py-3.5 px-4 text-right">Peak Rate</th>
                <th className="py-3.5 px-4 text-right">Billing Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Activity className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No usage logs found</p>
                      <p className="text-xs text-muted-foreground">
                        Try clearing or adjusting search keywords.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 font-bold text-xs border border-blue-500/20">
                          {r.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground text-xs">{r.customerName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {r.packageName}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-blue-600 dark:text-blue-400">
                      {r.downloadGb.toLocaleString()} GB
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {r.uploadGb.toLocaleString()} GB
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                      {(r.downloadGb + r.uploadGb).toLocaleString()} GB
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="secondary" className="font-mono text-xs bg-muted/70">
                        <Zap className="h-3 w-3 mr-1 text-amber-500" />
                        {r.peakMbps} Mbps
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                      {r.period}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
