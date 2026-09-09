'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Plus,
  Calendar,
  HardDrive,
  DollarSign,
  ArrowDownToLine,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
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
  const [receivedBy, setReceivedBy] = useState('Sabbir Hossain');

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
    toast.success('Daily bill logged and received.');
    setModalOpen(false);
  };

  const columns = useMemo<LegacyColumnDef<DailyBillItem, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold">{row.original.date}</span>
        ),
      },
      {
        accessorKey: 'popName',
        header: 'POP Distribution Node',
        cell: ({ row }) => (
          <span className="text-sm font-semibold">{row.original.popName}</span>
        ),
      },
      {
        accessorKey: 'vendor',
        header: 'Carrier / Upstream',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.vendor}</span>
        ),
      },
      {
        accessorKey: 'usageGb',
        header: 'Usage (GB)',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.usageGb} GB
          </span>
        ),
      },
      {
        accessorKey: 'ratePerGb',
        header: 'Rate / GB',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ratePerGb} BDT</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount (BDT)',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold">
            {formatBdtWithSymbol(row.original.amountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'receivedBy',
        header: 'Received By',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.receivedBy}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.status === 'received' ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Received
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-medium gap-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
              Pending
            </Badge>
          ),
      },
    ],
    [],
  );

  if (isLoading && bills.length === 0) return <PageSkeleton variant="table" rows={5} />;
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
    <div
      className="space-y-6 w-full pb-12"
    >
      <div>
        <PageHeader
          title="Bandwidth Daily Bills & Consumption Log"
          subtitle="Daily gigabyte consumption tracking per POP distribution node"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Bandwidth' },
            { label: 'Daily Bill' },
          ]}
          actions={
            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 font-semibold shadow-sm">
              <Plus className="h-4 w-4" /> Receive Bill
            </Button>
          }
        />
      </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{`${totalVolumeGb.toLocaleString()} GB`}</span>{' '}
          <span className="text-muted-foreground">total data logged</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{"2.50 BDT"}</span>{' '}
          <span className="text-muted-foreground">average cost / gb</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatBdtWithSymbol(totalBillAmount)}</span>{' '}
          <span className="text-muted-foreground">total daily billings</span>
        </p>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={list}
          getRowId={(row) => row.id}
          searchKey="popName"
          searchPlaceholder="Search POP, carrier, staff, or date..."
          searchFilterFn={dailyBillSearchFilter}
          facetFilters={[
            { columnId: 'status', title: 'Status' },
            { columnId: 'popName', title: 'POP' },
          ]}
          emptyTitle="No daily bills"
          emptyDescription="Receive a daily consumption bill to start logging."
        />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ArrowDownToLine className="h-4 w-4" />
              </div>
              Receive Daily Bandwidth Bill
            </DialogTitle>
            <DialogDescription>Record daily consumption data from POP transmission router.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReceiveBill} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">POP Node *</Label>
              <Select value={selectedPop} onValueChange={(v) => v && setSelectedPop(v)}>
                <SelectTrigger className="h-10 shadow-sm"><SelectValue /></SelectTrigger>
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
                <Input type="number" value={usageGb} onChange={(e) => setUsageGb(Number(e.target.value))} className="h-10 font-mono shadow-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate / GB (BDT) *</Label>
                <Input type="number" step="0.1" value={ratePerGb} onChange={(e) => setRatePerGb(Number(e.target.value))} className="h-10 font-mono shadow-sm" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Received By (Staff / Officer) *</Label>
              <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} className="h-10 shadow-sm" required />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 font-semibold shadow-sm gap-1.5">
                <ArrowDownToLine className="h-4 w-4" /> Record Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
