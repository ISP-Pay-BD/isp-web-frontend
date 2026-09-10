'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { usePurchase, type PurchaseBill } from '../hooks/use-purchase';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Plus,
  Download,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  CreditCard,
  Printer,
  MoreHorizontal,
  FileCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const billSearchFilter = (
  row: LegacyRow<PurchaseBill>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const b = row.original;
  return (
    b.billNumber.toLowerCase().includes(q) ||
    b.vendorName.toLowerCase().includes(q) ||
    b.billDate.toLowerCase().includes(q) ||
    b.dueDate.toLowerCase().includes(q)
  );
};

export function PurchaseBillsPage() {
  const { bills: initialBills, isLoading, isError, refetch } = usePurchase();
  const [bills, setBills] = useState<PurchaseBill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [billNumber, setBillNumber] = useState('');
  const [vendorName, setVendorName] = useState('FiberHome Optical Ltd');
  const [amountBdt, setAmountBdt] = useState('85000');
  const [paidAmountBdt, setPaidAmountBdt] = useState('40000');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-10-15');

  const list = bills.length > 0 ? bills : initialBills;

  const totalBilled = list.reduce((acc, b) => acc + (b.amountBdt || 0), 0);
  const totalPaid = list.reduce((acc, b) => acc + (b.paidAmountBdt || 0), 0);
  const totalDue = list.reduce((acc, b) => acc + (b.dueAmountBdt || 0), 0);
  const totalInvoices = list.length;

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amountBdt) || 0;
    const paid = Number(paidAmountBdt) || 0;
    const due = Math.max(0, amt - paid);

    const newBill: PurchaseBill = {
      id: `pb_${Date.now()}`,
      billNumber: billNumber.trim() || `BILL-PB-${Date.now().toString().slice(-4)}`,
      vendorName,
      amountBdt: amt,
      paidAmountBdt: paid,
      dueAmountBdt: due,
      billDate,
      dueDate,
      status: due === 0 ? 'paid' : paid > 0 ? 'partial' : 'pending',
      itemsCount: 4,
    };

    setBills((prev) => [newBill, ...(prev.length > 0 ? prev : initialBills)]);
    toast.success(`Purchase Bill ${newBill.billNumber} from ${newBill.vendorName} recorded.`);
    setModalOpen(false);
    setBillNumber('');
    setAmountBdt('85000');
    setPaidAmountBdt('40000');
  };

  const handleExportCsv = () => {
    const headers = ['Bill Number', 'Vendor Name', 'Bill Date', 'Due Date', 'Total Amount (BDT)', 'Paid Amount (BDT)', 'Due Amount (BDT)', 'Status'];
    const rows = list.map((b) => [
      b.billNumber,
      `"${b.vendorName.replace(/"/g, '""')}"`,
      b.billDate,
      b.dueDate,
      b.amountBdt,
      b.paidAmountBdt,
      b.dueAmountBdt,
      b.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_bills_payables_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Purchase bills directory exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<PurchaseBill, unknown>[]>(
    () => [
      {
        accessorKey: 'billNumber',
        header: 'Bill Voucher #',
        enableHiding: false,
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {row.original.billNumber}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'vendorName',
        header: 'Supplier / Vendor',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="font-medium text-foreground text-sm line-clamp-1">{b.vendorName}</span>
                <span className="text-xs text-muted-foreground">{b.itemsCount || 3} items purchased</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'billDate',
        header: 'Invoice Date',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.billDate}</span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Payment Due',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">{row.original.dueDate}</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Total Bill',
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.amountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'paidAmountBdt',
        header: 'Paid Amount',
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(row.original.paidAmountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'dueAmountBdt',
        header: 'Balance Due',
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-rose-600 dark:text-rose-400">
            {formatBdtWithSymbol(row.original.dueAmountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Payment Status',
        size: 130,
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === 'paid') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Paid in Full
              </Badge>
            );
          }
          if (st === 'partial') {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                Partially Paid
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
              Unpaid / Due
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Payable Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Payment voucher created for ${b.billNumber}`)}>
                  <CreditCard className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Disburse Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Printing voucher for ${b.billNumber}`)}>
                  <Printer className="h-3.5 w-3.5 mr-2" />
                  Print Purchase Bill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Viewing vendor ledger for ${b.vendorName}`)}>
                  <FileCheck className="h-3.5 w-3.5 mr-2" />
                  View Vendor Ledger
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Bill ${b.billNumber} voided`)}
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Void / Cancel Bill
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load purchase bills" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Bills & Payables"
        subtitle="Manage supplier bills, disbursement schedules, partial payments, and vendor outstanding debt."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Purchase', href: '/admin/purchase/bills' },
          { label: 'Purchase Bills' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Payables
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Record Vendor Bill
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalBilled)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{totalInvoices} vendor bills logged</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Paid Disbursed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatBdtWithSymbol(totalPaid)}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Cleared disbursements</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Outstanding Due</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {formatBdtWithSymbol(totalDue)}
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">Pending vendor balance</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Payment Ratio</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Settlement performance</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="vendorName"
        searchFilterFn={billSearchFilter}
        searchPlaceholder="Search by bill #, vendor name, or date..."
      />

      {/* Record Bill Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateBill}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Record Vendor Purchase Bill
              </DialogTitle>
              <DialogDescription>
                Enter an equipment, fiber cable, or hardware procurement invoice from a vendor.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bill-no">Bill / Invoice Number *</Label>
                  <Input
                    id="bill-no"
                    placeholder="e.g. INV-2026-089"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bill-vendor">Supplier / Vendor *</Label>
                  <Select value={vendorName} onValueChange={(val) => { if (val) setVendorName(val); }}>
                    <SelectTrigger id="bill-vendor">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FiberHome Optical Ltd">FiberHome Optical Ltd</SelectItem>
                      <SelectItem value="Huawei Bangladesh Direct">Huawei Bangladesh Direct</SelectItem>
                      <SelectItem value="ZTE Corporation BD">ZTE Corporation BD</SelectItem>
                      <SelectItem value="Link3 Technologies Hardware">Link3 Technologies Hardware</SelectItem>
                      <SelectItem value="BDCOM Online Network Gear">BDCOM Online Network Gear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bill-amt">Total Amount (BDT) *</Label>
                  <Input
                    id="bill-amt"
                    type="number"
                    value={amountBdt}
                    onChange={(e) => setAmountBdt(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bill-paid">Initial Paid Amount (BDT)</Label>
                  <Input
                    id="bill-paid"
                    type="number"
                    value={paidAmountBdt}
                    onChange={(e) => setPaidAmountBdt(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bill-date">Invoice Date</Label>
                  <Input
                    id="bill-date"
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bill-due">Payment Due Date</Label>
                  <Input
                    id="bill-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Record Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
