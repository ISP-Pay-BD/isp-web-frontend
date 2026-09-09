'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  PowerOff,
  Send,
  Download,
  MapPin,
  Calendar,
  Layers,
  Activity,
  Phone,
  RefreshCw,
  X,
  Clock,
  ArrowRight,
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
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type InactiveRow = IspOpsData['inactiveCustomers'][number];

export function InactiveCustomersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all'); // all | over_7 | over_30 | over_60
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState(
    'Dear customer, we noticed your internet connection has been offline. Please reach out to ISP Support if you need technical assistance.'
  );

  const rows: InactiveRow[] = useMemo(() => data?.inactiveCustomers ?? [], [data?.inactiveCustomers]);

  const uniqueAreas = useMemo(() => {
    const set = new Set(rows.map((r) => r.area));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q) ||
          r.packageName.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (areaFilter !== 'all' && r.area !== areaFilter) {
        return false;
      }

      if (durationFilter !== 'all') {
        if (durationFilter === 'over_7' && r.daysInactive < 7) return false;
        if (durationFilter === 'over_30' && r.daysInactive < 30) return false;
        if (durationFilter === 'over_60' && r.daysInactive < 60) return false;
      }

      return true;
    });
  }, [rows, search, areaFilter, durationFilter]);

  const over30Count = useMemo(() => rows.filter((r) => r.daysInactive >= 30).length, [rows]);
  const over60Count = useMemo(() => rows.filter((r) => r.daysInactive >= 60).length, [rows]);

  const handleExportCsv = () => {
    const headers = ['Customer Name', 'Username', 'Package', 'Area', 'Days Inactive', 'Last Online'];
    const dataRows = filtered.map((r) => [
      r.name,
      r.username,
      r.packageName,
      r.area,
      r.daysInactive,
      r.lastOnline,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inactive_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported inactive subscriber report to CSV');
  };

  const handleSendBulkSms = () => {
    toast.success(`Sent check-in SMS to ${filtered.length} inactive subscribers`);
    setSmsModalOpen(false);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load inactive subscribers"
        description="Could not query inactive sessions from the backend."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <PageHeader
        title="Inactive Customers"
        subtitle="Subscribers with no active PPPoE sessions or zero bandwidth transmission across recent billing windows."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Inactive Customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
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
              onClick={() => setSmsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Reconnect SMS
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Inactive
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <PowerOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rows.length}
            </span>
            <span className="text-xs text-muted-foreground">subscribers</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dormant 7+ Days
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {rows.length}
            </span>
            <span className="text-xs text-muted-foreground">lines</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Over 30 Days
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary tabular-nums">
              {over30Count}
            </span>
            <span className="text-xs text-muted-foreground">churn risk</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Over 60 Days
            </span>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-muted-foreground tabular-nums">
              {over60Count}
            </span>
            <span className="text-xs text-muted-foreground">candidates for purge</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, username, package, or area..."
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
                {uniqueAreas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={durationFilter} onValueChange={(v) => setDurationFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[150px] bg-background border-border/60">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="over_7">Over 7 Days</SelectItem>
                <SelectItem value="over_30">Over 30 Days</SelectItem>
                <SelectItem value="over_60">Over 60 Days</SelectItem>
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
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Area</th>
                <th className="py-3.5 px-4">Days Inactive</th>
                <th className="py-3.5 px-4">Last Online</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Activity className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No matching inactive subscribers</p>
                      <p className="text-xs text-muted-foreground">
                        All lines in this scope are reporting active sessions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-xs border border-border/60">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-foreground text-xs">{r.name}</span>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {r.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {r.packageName}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {r.area}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-mono text-xs font-semibold gap-1',
                          r.daysInactive >= 30
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        )}
                      >
                        <PowerOff className="h-3 w-3" />
                        {r.daysInactive} days
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                      {r.lastOnline}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-border/80 hover:bg-muted/80 gap-1"
                        onClick={() => toast.success(`Outreach SMS sent to ${r.username}`)}
                      >
                        <Send className="h-3 w-3 text-primary" /> Outreach
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SMS Modal */}
      <Dialog open={smsModalOpen} onOpenChange={setSmsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Reconnect Inactive Customers
            </DialogTitle>
            <DialogDescription>
              Deliver check-in and support notification to <strong className="text-foreground">{filtered.length}</strong> inactive accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">SMS Message</Label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs shadow-inner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSmsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendBulkSms} className="gap-1 bg-primary text-primary-foreground">
              <Send className="h-3.5 w-3.5" /> Send Messages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
