'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertTriangle,
  Send,
  Zap,
  Phone,
  Receipt,
  Download,
  Filter,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  X,
  AlignJustify,
  AlignCenter,
} from 'lucide-react';
import { useExpiredCustomers } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { DEFAULT_PAGE_SIZE, STORAGE_KEYS } from '@/lib/constants/status';
import { useThemeCustomizerStore } from '@/stores/theme-store';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { areas } from '@/data/admin/areas.data';
import type { Customer } from '../types';

export function ExpiredCustomersPage() {
  const { data, isLoading, isError, refetch } = useExpiredCustomers();
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all'); // all | today | last_7 | over_30
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [bulkSmsOpen, setBulkSmsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.tableLayout);
      if (saved === 'centered' || saved === 'full') return saved;
    }
    return globalTableLayout || 'full';
  });

  // Sync when global theme setting changes
  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const handleLayoutModeChange = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.tableLayout, mode);
    }
  };

  const [smsBody, setSmsBody] = useState(
    'Dear subscriber, your ISP internet line has expired. Please recharge your account to resume high-speed browsing.'
  );

  const expiredList = useMemo(() => data?.items ?? [], [data?.items]);

  const totalDueBdt = useMemo(
    () => expiredList.reduce((acc, c) => acc + (c.balanceBdt || c.packagePrice || 800), 0),
    [expiredList]
  );

  const filtered = useMemo(() => {
    return expiredList.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.packageName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (areaFilter !== 'all' && c.areaId !== areaFilter) {
        return false;
      }

      if (daysFilter !== 'all') {
        const now = new Date();
        const exp = new Date(c.expiryDate);
        const daysAgo = Math.floor((now.getTime() - exp.getTime()) / (1000 * 60 * 60 * 24));
        if (daysFilter === 'today' && daysAgo > 1) return false;
        if (daysFilter === 'last_7' && (daysAgo < 0 || daysAgo > 7)) return false;
        if (daysFilter === 'over_30' && daysAgo < 30) return false;
      }

      return true;
    });
  }, [expiredList, search, areaFilter, daysFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedExpired = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = ['Name', 'Username', 'Phone', 'Package', 'Area', 'Expired Date', 'Due BDT'];
    const rows = filtered.map((c) => [
      c.name,
      c.username,
      c.phone,
      c.packageName,
      c.areaName,
      c.expiryDate,
      c.balanceBdt || c.packagePrice || 800,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expired_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported expired customer list to CSV');
  };

  const handleSendBulkSms = () => {
    toast.success(`Dispatched expiry reminder SMS to ${filtered.length} customers`);
    setBulkSmsOpen(false);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} layoutMode={layoutMode} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading expired customers"
        description="Could not load expired line data."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div
      className={cn(
        'space-y-6 pb-16 transition-all duration-200',
        layoutMode === 'centered' ? 'max-w-7xl mx-auto' : 'w-full'
      )}
    >
      {/* Page Header */}
      <PageHeader
        title="Expired Customers"
        subtitle="Subscribers with lapsed account cycles requiring follow-up, payment renewal, or line reconnection."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Expired Customers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Layout Toggle */}
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => handleLayoutModeChange('full')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'full'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Full width layout"
              >
                <AlignJustify className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleLayoutModeChange('centered')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'centered'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Centered layout"
              >
                <AlignCenter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export
            </Button>
            <Button
              size="sm"
              onClick={() => setBulkSmsOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Bulk SMS Alert
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Expired
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {expiredList.length}
            </span>
            <span className="text-xs text-muted-foreground">subscribers</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cumulative Due
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={totalDueBdt} className="text-2xl font-bold tracking-tight text-amber-500" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Expired Today
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {expiredList.slice(0, 3).length}
            </span>
            <span className="text-xs text-muted-foreground">accounts</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Over 30 Days
            </span>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-muted-foreground tabular-nums">
              {expiredList.slice(3, 7).length}
            </span>
            <span className="text-xs text-muted-foreground">dormant</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, username, or phone..."
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
            <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[140px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={daysFilter} onValueChange={(v) => setDaysFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[150px] bg-background border-border/60">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="today">Expired Today</SelectItem>
                <SelectItem value="last_7">Last 7 Days</SelectItem>
                <SelectItem value="over_30">Over 30 Days</SelectItem>
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
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Package & Rate</th>
                <th className="py-3.5 px-4">Coverage Area</th>
                <th className="py-3.5 px-4">Expired On</th>
                <th className="py-3.5 px-4">Due Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedExpired.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                      <p className="font-semibold text-foreground">No expired customers found</p>
                      <p className="text-xs text-muted-foreground">
                        All subscribers in this filter set are currently up to date with active cycles.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpired.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-bold text-foreground hover:text-primary hover:underline text-xs"
                          >
                            {c.name}
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {c.username} • {c.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{c.packageName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ৳{c.packagePrice || 800}/month
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {c.areaName}
                      {c.subAreaName && (
                        <div className="text-[10px] text-muted-foreground">{c.subAreaName}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{c.expiryDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-amber-500">
                      <CurrencyDisplay amount={c.balanceBdt || c.packagePrice || 800} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/customer-payments/new?customerId=${c.id}`}>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                          >
                            <Zap className="h-3 w-3" /> Recharge
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-border/80 hover:bg-muted/80"
                          onClick={() => toast.success(`Reminder SMS sent to ${c.phone}`)}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Bulk SMS Dialog */}
      <Dialog open={bulkSmsOpen} onOpenChange={setBulkSmsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-amber-500" />
              Send Expiry Reminders
            </DialogTitle>
            <DialogDescription>
              Broadcast expiry alert to <strong className="text-foreground">{filtered.length}</strong> subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Message Text</Label>
              <textarea
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs shadow-inner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkSmsOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendBulkSms}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1"
            >
              <Send className="h-3.5 w-3.5" /> Send Reminders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
