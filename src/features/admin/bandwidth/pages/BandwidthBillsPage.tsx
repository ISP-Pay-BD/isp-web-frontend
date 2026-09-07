'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthPurchaseBillItem } from '@/data/admin/bandwidth.data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

const billSearchFilter = (
  row: LegacyRow<BandwidthPurchaseBillItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const b = row.original;
  return (
    b.billNumber.toLowerCase().includes(q) ||
    b.providerName.toLowerCase().includes(q) ||
    b.month.toLowerCase().includes(q)
  );
};

export function BandwidthBillsPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [bills, setBills] = useState<BandwidthPurchaseBillItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [billNo, setBillNo] = useState('');
  const [provider, setProvider] = useState('Summit Communications Ltd.');
  const [amount, setAmount] = useState(250000);
  const [capacity, setCapacity] = useState(1000);

  const initial = data?.purchaseBills ?? [];
  if (bills.length === 0 && initial.length > 0) {
    setBills(initial);
  }

  const list = bills.length > 0 ? bills : initial;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: BandwidthPurchaseBillItem = {
      id: `bpb_${Date.now()}`,
      billNumber: billNo || `BILL-${Date.now()}`,
      providerId: 'bwp_1',
      providerName: provider,
      month: 'September 2026',
      billingDate: '2026-09-02',
      dueDate: '2026-09-20',
      capacityMbps: capacity,
      amountBdt: amount,
      vatBdt: Math.round(amount * 0.05),
      totalBdt: Math.round(amount * 1.05),
      status: 'pending',
    };
    setBills((prev) => [newBill, ...prev]);
    toast.success('Purchase bill entered into accounts.');
    setModalOpen(false);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthPurchaseBillItem, unknown>[]>(
    () => [
      {
        accessorKey: 'billNumber',
        header: 'Bill Number',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono font-medium text-xs text-foreground inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            {row.original.billNumber}
          </span>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => (
          <span className="font-semibold text-xs">{row.original.providerName}</span>
        ),
      },
      {
        accessorKey: 'month',
        header: 'Billing Month',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.month}</span>
        ),
      },
      {
        accessorKey: 'capacityMbps',
        header: 'Capacity',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.capacityMbps} Mbps</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount (BDT)',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{formatBdtWithSymbol(row.original.amountBdt)}</span>
        ),
      },
      {
        accessorKey: 'totalBdt',
        header: 'Total + VAT',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.totalBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.dueDate}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

    if (isLoading && bills.length === 0) return <PageSkeleton variant="table" rows={4} />;
  if (isError && bills.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load purchase bills"
          description="Could not fetch bandwidth purchase bills."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Purchase Bills"
        subtitle="Upstream invoices, transmission bills, and payment reconciliation"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
          { label: 'Purchase Bills' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Bill
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="billNumber"
        searchPlaceholder="Search bill number, provider, month..."
        searchFilterFn={billSearchFilter}
        facetFilters={[
          { columnId: 'providerName', title: 'Provider' },
          { columnId: 'status', title: 'Status' },
        ]}
        emptyTitle="No purchase bills"
        emptyDescription="Enter a carrier billing statement to get started."
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Carrier Purchase Bill</DialogTitle>
            <DialogDescription>Record a new billing statement received from upstream provider.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="bNo">Bill Reference # *</Label>
              <Input id="bNo" placeholder="e.g. BILL-SCL-2026-09" value={billNo} onChange={(e) => setBillNo(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bProv">Provider *</Label>
              <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
                <SelectTrigger id="bProv">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Summit Communications Ltd.">Summit Communications Ltd.</SelectItem>
                  <SelectItem value="Fiber@Home Limited">Fiber@Home Limited</SelectItem>
                  <SelectItem value="Link3 Technologies Ltd.">Link3 Technologies Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bCap">Capacity (Mbps)</Label>
                <Input id="bCap" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bAmt">Amount (BDT) *</Label>
                <Input id="bAmt" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
