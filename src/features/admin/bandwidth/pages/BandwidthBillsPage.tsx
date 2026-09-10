'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthPurchaseBillItem } from '@/data/admin/bandwidth.data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Download, FileText, Calendar, CheckCircle2, Clock, AlertTriangle, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    b.month.toLowerCase().includes(q) ||
    b.status.toLowerCase().includes(q)
  );
};

export function BandwidthBillsPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [bills, setBills] = useState<BandwidthPurchaseBillItem[]>([]);
  const [selectedBill, setSelectedBill] = useState<BandwidthPurchaseBillItem | null>(null);
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

  const stats = useMemo(() => {
    const totalBills = list.length;
    const paidBills = list.filter((b) => b.status === 'paid');
    const pendingBills = list.filter((b) => b.status === 'pending');
    const totalAmount = list.reduce((s, b) => s + b.totalBdt, 0);
    const paidAmount = paidBills.reduce((s, b) => s + b.totalBdt, 0);
    const pendingAmount = pendingBills.reduce((s, b) => s + b.totalBdt, 0);
    return { totalBills, totalAmount, paidAmount, pendingAmount, pendingCount: pendingBills.length };
  }, [list]);

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
    toast.success('Carrier purchase invoice entered into accounts payable.');
    setModalOpen(false);
    setBillNo('');
  };

  const handleExportCsv = () => {
    const headers = ['Bill Number', 'Carrier Provider', 'Month', 'Capacity (Mbps)', 'Base Amount (BDT)', 'VAT (BDT)', 'Total (BDT)', 'Due Date', 'Status'];
    const rows = list.map((b) => [
      b.billNumber,
      b.providerName,
      b.month,
      b.capacityMbps,
      b.amountBdt,
      b.vatBdt,
      b.totalBdt,
      b.dueDate,
      b.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_purchase_bills_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Carrier purchase invoices exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthPurchaseBillItem, unknown>[]>(
    () => [
      {
        accessorKey: 'billNumber',
        header: 'Bill Reference #',
        enableHiding: false,
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <span
                className="font-mono font-bold text-xs text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedBill(row.original)}
              >
                {row.original.billNumber}
              </span>
              <div className="text-[10px] text-muted-foreground font-mono">
                {row.original.billingDate}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Carrier Provider',
        size: 200,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-xs text-foreground">{row.original.providerName}</div>
            <div className="text-[10px] text-muted-foreground">{row.original.month}</div>
          </div>
        ),
      },
      {
        accessorKey: 'capacityMbps',
        header: 'Bandwidth',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.capacityMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Base Amount',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {formatBdtWithSymbol(row.original.amountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'vatBdt',
        header: '5% VAT',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {formatBdtWithSymbol(row.original.vatBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'totalBdt',
        header: 'Total Payable',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.totalBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.dueDate}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:bg-primary/10"
              onClick={() => setSelectedBill(row.original)}
            >
              Voucher
            </Button>
          </div>
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
          title="Failed to load purchase bills"
          description="Could not fetch bandwidth purchase bills."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Purchase Bills"
        subtitle="Upstream carrier invoices, NTTN transmission bills, 5% NBR VAT, and payment reconciliation"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Purchase Bills' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Bills
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Record Purchase Bill
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.length}</span>{' '}
          <span className="text-muted-foreground">carrier invoices</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            {formatBdtWithSymbol(stats.totalAmount)}
          </span>{' '}
          <span className="text-muted-foreground">total billed volume</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(stats.paidAmount)}
          </span>{' '}
          <span className="text-muted-foreground">disbursed settlements</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {formatBdtWithSymbol(stats.pendingAmount)} ({stats.pendingCount})
          </span>{' '}
          <span className="text-muted-foreground">pending approval</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="billNumber"
        searchPlaceholder="Search bill reference #, provider, or month..."
        searchFilterFn={billSearchFilter}
        facetFilters={[
          { columnId: 'providerName', title: 'Carrier' },
          { columnId: 'status', title: 'Payment Status' },
        ]}
        emptyTitle="No purchase bills"
        emptyDescription="Enter a carrier billing statement to get started."
      />

      {/* Bill Details Modal */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Purchase Bill Voucher</DialogTitle>
                  <DialogDescription className="text-xs font-mono">
                    {selectedBill?.billNumber}
                  </DialogDescription>
                </div>
              </div>
              {selectedBill && <StatusBadge status={selectedBill.status} />}
            </div>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Carrier / Provider:</span>
                  <span className="font-bold text-foreground">{selectedBill.providerName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Billing Period:</span>
                  <span className="font-medium text-foreground">{selectedBill.month}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Contracted Capacity:</span>
                  <span className="font-mono font-bold text-primary">{selectedBill.capacityMbps} Mbps</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-mono text-foreground">{selectedBill.dueDate}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">VAT Portion (5%):</span>
                  <span className="font-mono text-muted-foreground">৳{selectedBill.vatBdt.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-primary text-base">
                  ৳{selectedBill.totalBdt.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                </Button>
                <Button size="sm" onClick={() => setSelectedBill(null)} className="text-xs font-semibold">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Bill Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Enter Carrier Purchase Bill
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record a new billing statement received from an upstream IIG or NTTN carrier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bill Reference / Invoice # *</Label>
              <Input
                placeholder="e.g. BILL-SCL-2026-0901"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Carrier / Provider *</Label>
              <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Summit Communications Ltd.">Summit Communications Ltd.</SelectItem>
                  <SelectItem value="Fiber@Home Limited">Fiber@Home Limited</SelectItem>
                  <SelectItem value="Link3 Technologies Ltd.">Link3 Technologies Ltd.</SelectItem>
                  <SelectItem value="ADN Telecom Ltd.">ADN Telecom Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Capacity (Mbps)</Label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Base Amount (BDT) *</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-xs h-9 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/50 text-xs flex justify-between">
              <span className="text-muted-foreground">Computed Total (+ 5% VAT):</span>
              <span className="font-mono font-bold text-foreground">
                ৳{Math.round(amount * 1.05).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Submit Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
