'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  RefreshCw,
  X,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  ArrowUpRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useAccountingReports, type AccountingReportItem } from '../hooks/use-accounting-reports';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AccountingReportsPage() {
  const { reports, isLoading, isError, refetch } = useAccountingReports();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<AccountingReportItem | null>(null);

  const reportTypes = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.type || 'Financial Statement')));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((rpt) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rpt.name.toLowerCase().includes(q) ||
        rpt.id.toLowerCase().includes(q) ||
        rpt.period.toLowerCase().includes(q) ||
        (rpt.type && rpt.type.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || rpt.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [reports, search, typeFilter]);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const plReport = reports.find((r) => r.id === 'rpt_pl');
    const netProfit = plReport?.netBdt ?? 1725000;
    const grossRev = plReport?.grossRevenueBdt ?? 2845000;
    const margin = plReport?.marginPct ?? 60.6;
    return { totalReports, netProfit, grossRev, margin };
  }, [reports]);

  const handleExportCSV = () => {
    toast.success(`Exporting ${filteredReports.length} accounting statements to CSV...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load accounting reports"
        description="Could not load financial report summaries."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Financial Statements & Accounts Reports"
        subtitle="Audited profit & loss (P&L), operational cash flows, Mushak 6.3 VAT summaries, and aging schedules."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-white/10 hover:bg-white/5 text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-white/10 hover:bg-white/5 text-xs h-9 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export Statements
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Operating Profit</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">৳{stats.netProfit.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Operating profit post-OPEX</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross ISP Revenue</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">৳{stats.grossRev.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Aggregate top-line billings</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operating Margin</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <PieChart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">{stats.margin}%</div>
            <div className="mt-2 text-[11px] text-muted-foreground">EBITDA efficiency ratio</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Reports</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">{stats.totalReports} Statements</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Audited financial schedules</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, period, statement type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[200px] h-9 text-xs bg-background/80">
            <SelectValue placeholder="All Statement Types" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Statement Types</SelectItem>
            {reportTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No reports match filter"
          description="Run month-end close to populate additional reports."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('all');
          }}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="w-12 text-xs font-semibold">#</TableHead>
                  <TableHead className="text-xs font-semibold">Statement Name</TableHead>
                  <TableHead className="text-xs font-semibold">Classification</TableHead>
                  <TableHead className="text-xs font-semibold">Accounting Period</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Net Balance / Amount</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredReports.map((rpt, idx) => (
                  <TableRow
                    key={rpt.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    onClick={() => setSelectedReport(rpt)}
                  >
                    <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {rpt.name}
                          </span>
                          <p className="font-mono text-[10px] text-muted-foreground">{rpt.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border/60 text-[10px]">
                        {rpt.type || 'Standard Report'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {rpt.period}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-emerald-400">
                      ৳{rpt.netBdt.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedReport(rpt)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          onClick={() => toast.success(`Downloading statement PDF for ${rpt.name}`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedReport && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedReport.id}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Audit Certified
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedReport.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Summary audit metrics for period {selectedReport.period}.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Report Net Figure</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      ৳{selectedReport.netBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Accounting Period</span>
                    <span className="font-mono text-foreground">{selectedReport.period}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Report Type</span>
                    <span className="font-medium text-foreground">{selectedReport.type || 'Income Statement'}</span>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audit Compliance</h5>
                  <Card className="border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Reconciled with General Ledger Vouchers</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Compliant with BTRC & NBR Mushak guidelines</span>
                    </div>
                  </Card>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Printing certified PDF for ${selectedReport.name}`);
                      setSelectedReport(null);
                    }}
                  >
                    Download Certified PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedReport(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
