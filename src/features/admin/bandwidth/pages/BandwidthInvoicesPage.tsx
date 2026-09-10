'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthInvoiceItem } from '@/data/admin/bandwidth.data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatBdtWithSymbol } from '@/lib/format';
import { FileText, Printer, Download, Plus, Receipt, CheckCircle2, Clock, AlertTriangle, Building2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const invoiceSearchFilter = (
  row: LegacyRow<BandwidthInvoiceItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const inv = row.original;
  return (
    inv.invoiceNumber.toLowerCase().includes(q) ||
    inv.clientName.toLowerCase().includes(q) ||
    inv.contactPerson.toLowerCase().includes(q) ||
    inv.billingMonth.toLowerCase().includes(q)
  );
};

export function BandwidthInvoicesPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [selectedInvoice, setSelectedInvoice] = useState<BandwidthInvoiceItem | null>(null);

  const invoices = data?.invoices ?? [];

  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.status === 'paid');
    const unpaidInvoices = invoices.filter((i) => i.status !== 'paid');
    const totalVolume = invoices.reduce((s, i) => s + i.totalBdt, 0);
    const paidVolume = paidInvoices.reduce((s, i) => s + i.totalBdt, 0);
    const dueVolume = unpaidInvoices.reduce((s, i) => s + i.dueAmountBdt, 0);
    return { totalInvoices, totalVolume, paidVolume, dueVolume, unpaidCount: unpaidInvoices.length };
  }, [invoices]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Invoice Number', 'Client Enterprise', 'Contact Person', 'Month', 'Capacity (Mbps)', 'Subtotal (BDT)', 'VAT (BDT)', 'Total (BDT)', 'Due (BDT)', 'Status'];
    const rows = invoices.map((i) => [
      i.invoiceNumber,
      i.clientName,
      i.contactPerson,
      i.billingMonth,
      i.capacityMbps,
      i.subTotalBdt,
      i.vatAmountBdt,
      i.totalBdt,
      i.dueAmountBdt,
      i.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_sales_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sales invoices exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthInvoiceItem, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Reference #',
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
                onClick={() => setSelectedInvoice(row.original)}
              >
                {row.original.invoiceNumber}
              </span>
              <div className="text-[10px] text-muted-foreground font-mono">
                {row.original.invoiceDate}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'client',
        accessorKey: 'clientName',
        header: 'Wholesale Client',
        size: 210,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-xs text-foreground">{row.original.clientName}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.contactPerson}</div>
          </div>
        ),
      },
      {
        accessorKey: 'billingMonth',
        header: 'Billing Month',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium">{row.original.billingMonth}</span>
        ),
      },
      {
        accessorKey: 'capacityMbps',
        header: 'Bandwidth',
        size: 120,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-primary">
            <Zap className="h-3 w-3 text-amber-500" />
            {row.original.capacityMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'subTotalBdt',
        header: 'Subtotal',
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatBdtWithSymbol(row.original.subTotalBdt)}</span>
        ),
      },
      {
        accessorKey: 'vatAmountBdt',
        header: '5% NBR VAT',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {formatBdtWithSymbol(row.original.vatAmountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'totalBdt',
        header: 'Total Receivable',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.totalBdt)}
          </span>
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
        size: 100,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              onClick={() => setSelectedInvoice(row.original)}
            >
              View Invoice
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && invoices.length === 0) return <PageSkeleton variant="table" rows={6} />;
  if (isError && invoices.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load invoices"
          description="Could not fetch bandwidth sales invoices."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Sales Invoices"
        subtitle="Invoices generated for wholesale sub-ISPs and corporate leased line accounts"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Sell', url: '/admin/bandwidth/sell' },
          { label: 'Invoices' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Ledger
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Batch generation queued for all active wholesale clients')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Generate Invoices
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{invoices.length}</span>{' '}
          <span className="text-muted-foreground">invoices generated</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            {formatBdtWithSymbol(stats.totalVolume)}
          </span>{' '}
          <span className="text-muted-foreground">total sales volume</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(stats.paidVolume)}
          </span>{' '}
          <span className="text-muted-foreground">reconciled revenue</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {formatBdtWithSymbol(stats.dueVolume)} ({stats.unpaidCount})
          </span>{' '}
          <span className="text-muted-foreground">uncollected receivables</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={invoices}
        getRowId={(row) => row.id}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice #, wholesale client, or month..."
        searchFilterFn={invoiceSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Payment Status' }]}
        emptyTitle="No invoices found"
        emptyDescription="Sales invoices will appear here once generated."
      />

      {/* Printable Invoice Modal Preview */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl p-6 border-border/80 shadow-[var(--shadow-md)]">
          {selectedInvoice && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> ISP PAY BD LTD
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Carrier Wholesale & Bandwidth Distribution NOC</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-primary">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">Date: {selectedInvoice.invoiceDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Billed To:</span>
                  <div className="font-bold text-sm text-foreground">{selectedInvoice.clientName}</div>
                  <div className="text-muted-foreground">Attn: {selectedInvoice.contactPerson}</div>
                  <div className="text-muted-foreground">Billing Month: {selectedInvoice.billingMonth}</div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1.5">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Payment Terms:</span>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-mono font-semibold text-foreground">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Service Description</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Rate/Mbps</TableHead>
                      <TableHead className="text-right">Amount (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold text-xs">
                        Dedicated Internet Access (DIA) Wholesale Bandwidth
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold text-primary">
                        {selectedInvoice.capacityMbps} Mbps
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatBdtWithSymbol(selectedInvoice.ratePerMbpsBdt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right font-bold">
                        {formatBdtWithSymbol(selectedInvoice.subTotalBdt)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-xs p-3.5 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatBdtWithSymbol(selectedInvoice.subTotalBdt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NBR Govt VAT (5%):</span>
                    <span className="font-mono text-muted-foreground">
                      {formatBdtWithSymbol(selectedInvoice.vatAmountBdt)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                    <span className="text-foreground">Total Payable:</span>
                    <span className="font-mono text-primary text-base">
                      {formatBdtWithSymbol(selectedInvoice.totalBdt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)} className="text-xs">
                  Close
                </Button>
                <Button size="sm" onClick={handlePrint} className="text-xs font-semibold gap-1.5">
                  <Printer className="h-4 w-4" /> Print Tax Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
