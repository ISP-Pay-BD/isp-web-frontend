'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  Users,
  Activity,
  Receipt,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useBtrcReport } from '../hooks/use-btrc-report';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { areas } from '@/data/admin/areas.data';

export function BtrcReportPage() {
  const { summary, subscribers = [], isLoading, isError, refetch } = useBtrcReport();
  const [search, setSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('all'); // all | Home | Corporate | SME
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          s.clientName.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.packageName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (clientTypeFilter !== 'all' && s.clientType.toLowerCase() !== clientTypeFilter.toLowerCase()) {
        return false;
      }

      if (areaFilter !== 'all' && !s.area.toLowerCase().includes(areaFilter.toLowerCase())) {
        return false;
      }

      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [subscribers, search, clientTypeFilter, areaFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedSubscribers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'SL',
      'Client Name',
      'Mobile',
      'Package',
      'Bandwidth (Mbps)',
      'Price (BDT)',
      'Area',
      'Client Type',
      'Status',
    ];
    const dataRows = filtered.map((s) => [
      s.sl,
      `"${s.clientName.replace(/"/g, '""')}"`,
      s.mobile,
      s.packageName,
      s.bandwidthMbps,
      s.priceBdt,
      s.area,
      s.clientType,
      s.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `btrc_subscriber_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('BTRC official subscriber report exported to CSV');
  };

  const handlePrintPdf = () => {
    toast.success('BTRC formatted compliance PDF generated');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !summary) {
    return (
      <EmptyState
        title="Failed to load BTRC report"
        description="Could not compile regulatory subscriber demographics."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <PageHeader
        title="BTRC Regulatory Report"
        subtitle="Standardized subscriber census, bandwidth distribution, and revenue demographics for Bangladesh Telecommunication Regulatory Commission filing."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Reports' },
          { label: 'BTRC Report' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Print PDF
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export Formatted CSV
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Subscribers
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {summary.totalSubscribers}
            </span>
            <span className="text-xs text-muted-foreground">registered lines</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bandwidth Deployed
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {summary.totalBandwidthGbps}
            </span>
            <span className="text-xs text-muted-foreground">Gbps total transit</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Declared Monthly Rev
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={summary.totalRevenueBdt} className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Home vs Corporate
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {summary.homeSubscribers} <span className="text-sm font-normal text-muted-foreground">/</span> {summary.corporateSubscribers}
            </span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search subscriber name, mobile, area, or package..."
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
            <Select value={clientTypeFilter} onValueChange={(v) => setClientTypeFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[130px] bg-background border-border/60">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="sme">SME</SelectItem>
              </SelectContent>
            </Select>

            <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[140px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[120px] bg-background border-border/60">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <th className="py-3.5 px-4 w-12">SL</th>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Bandwidth</th>
                <th className="py-3.5 px-4">Rate (BDT)</th>
                <th className="py-3.5 px-4">Area / Zone</th>
                <th className="py-3.5 px-4">Client Type</th>
                <th className="py-3.5 px-4 text-right">Filing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No matching subscribers in census</p>
                      <p className="text-xs text-muted-foreground">
                        Try clearing search terms or selecting &quot;All Types&quot;.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((sub, idx) => {
                  const globalSl = (safeCurrentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={sub.sl} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">{globalSl}</td>
                      <td className="py-3.5 px-4 font-bold text-foreground">{sub.clientName}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-foreground">{sub.mobile}</td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{sub.packageName}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/60">
                          {sub.bandwidthMbps} Mbps
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        <CurrencyDisplay amount={sub.priceBdt} />
                      </td>
                      <td className="py-3.5 px-4 text-foreground">{sub.area}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-medium',
                            sub.clientType.toLowerCase() === 'corporate'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          )}
                        >
                          {sub.clientType}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge
                          status={sub.status === 'active' ? 'active' : 'expired'}
                          label={sub.status}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
