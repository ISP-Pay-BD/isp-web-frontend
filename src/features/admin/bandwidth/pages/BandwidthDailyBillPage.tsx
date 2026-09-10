'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Plus,
  Calendar,
  HardDrive,
  DollarSign,
  ArrowDownToLine,
  Download,
  Activity,
  Zap,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { DailyBillItem } from '@/data/admin/bandwidth.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format';
import { toast } from 'sonner';

const dailyBillSearchFilter = (
  row: LegacyRow<DailyBillItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const b = row.original;
  return (
    b.popName.toLowerCase().includes(q) ||
    b.vendor.toLowerCase().includes(q) ||
    b.receivedBy.toLowerCase().includes(q) ||
    b.date.includes(q)
  );
};

export function BandwidthDailyBillPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [bills, setBills] = useState<DailyBillItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPop, setSelectedPop] = useState('Demo POP Uttara');
  const [usageGb, setUsageGb] = useState(1500);
  const [ratePerGb, setRatePerGb] = useState(2.5);
  const [receivedBy, setReceivedBy] = useState('Sabbir Hossain (NOC)');

  const initial = data?.dailyBills ?? [];
  if (bills.length === 0 && initial.length > 0) {
    setBills(initial);
  }

  const list = bills.length > 0 ? bills : initial;
  const totalVolumeGb = list.reduce((sum, b) => sum + b.usageGb, 0);
  const totalBillAmount = list.reduce((sum, b) => sum + b.amountBdt, 0);

  const handleReceiveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: DailyBillItem = {
      id: `db_${Date.now()}`,
      date: new Date().toISOString().split('T')[0]!,
      popName: selectedPop,
      usageGb,
      ratePerGb,
      amountBdt: Math.round(usageGb * ratePerGb),
      receivedBy,
      createdBy: 'Admin NOC',
      vendor: 'Summit Communications Ltd.',
      status: 'received',
    };
    setBills((prev) => [newBill, ...prev]);
    toast.success('Daily consumption bill logged and reconciled successfully.');
    setModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'POP Distribution Node', 'Carrier Vendor', 'Usage (GB)', 'Rate/GB (BDT)', 'Total Amount (BDT)', 'Received By', 'Status'];
    const rows = list.map((b) => [
      b.date,
      b.popName,
      b.vendor,
      b.usageGb,
      b.ratePerGb,
      b.amountBdt,
      b.receivedBy,
      b.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_daily_bills_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Daily consumption log exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<DailyBillItem, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Posting Date',
        enableHiding: false,
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.date}</span>
          </div>
        ),
      },
      {
        accessorKey: 'popName',
        header: 'POP Distribution Node',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">{row.original.popName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'vendor',
        header: 'Carrier Upstream Link',
        size: 190,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.vendor}</span>
        ),
      },
      {
        accessorKey: 'usageGb',
        header: 'Consumption (GB)',
        size: 140,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-primary">
            <HardDrive className="h-3 w-3 text-primary" />
            {row.original.usageGb.toLocaleString()} GB
          </span>
        ),
      },
      {
        accessorKey: 'ratePerGb',
        header: 'Unit Rate / GB',
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">৳{row.original.ratePerGb.toFixed(2)}</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Calculated Amount',
        size: 150,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(row.original.amountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'receivedBy',
        header: 'Duty Officer',
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.receivedBy}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) =>
          row.original.status === 'received' ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Received
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-medium gap-1"
            >
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          ),
      },
    ],
    [],
  );

  if (isLoading && bills.length === 0) return <PageSkeleton variant="table" rows={6} />;
  if (isError && bills.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load daily bills"
          description="Could not fetch daily bandwidth bills."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Daily Bills & Consumption Log"
        subtitle="Daily gigabyte consumption tracking and micro-reconciliation per POP distribution node"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth', url: '/admin/bandwidth/buy' },
          { label: 'Daily Bill' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Daily Log
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Record Daily Bill
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{`${totalVolumeGb.toLocaleString()} GB`}</span>{' '}
          <span className="text-muted-foreground">total data logged ({(totalVolumeGb / 1024).toFixed(1)} TB)</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">৳2.50</span>{' '}
          <span className="text-muted-foreground">average cost / GB</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(totalBillAmount)}
          </span>{' '}
          <span className="text-muted-foreground">total daily billing receipts</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="popName"
        searchPlaceholder="Search by POP distribution node, carrier, or duty staff..."
        searchFilterFn={dailyBillSearchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Receipt Status' },
          { columnId: 'popName', title: 'POP Node' },
        ]}
        emptyTitle="No daily bills"
        emptyDescription="Receive a daily consumption bill to start logging."
      />

      {/* Receive Daily Bill Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-primary" /> Receive Daily Bandwidth Bill
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record daily data consumption metrics from POP distribution gateway.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReceiveBill} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">POP Node *</Label>
              <Select value={selectedPop} onValueChange={(v) => v && setSelectedPop(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Demo POP Uttara">Demo POP Uttara</SelectItem>
                  <SelectItem value="Demo POP Mirpur">Demo POP Mirpur</SelectItem>
                  <SelectItem value="Demo POP Dhanmondi">Demo POP Dhanmondi</SelectItem>
                  <SelectItem value="Demo POP Chittagong">Demo POP Chittagong</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Daily Usage (GB) *</Label>
                <Input
                  type="number"
                  value={usageGb}
                  onChange={(e) => setUsageGb(Number(e.target.value))}
                  className="text-xs h-9 font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate / GB (BDT) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ratePerGb}
                  onChange={(e) => setRatePerGb(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/50 text-xs flex justify-between">
              <span className="text-muted-foreground">Computed Bill Total:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ৳{Math.round(usageGb * ratePerGb).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Received By (Staff / Officer) *</Label>
              <Input
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Record Daily Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
