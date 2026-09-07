'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthInvoiceItem } from '@/data/admin/bandwidth.data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatBdtWithSymbol } from '@/lib/format';
import { FileText, Printer } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  const columns = useMemo<LegacyColumnDef<BandwidthInvoiceItem, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            {row.original.invoiceNumber}
          </span>
        ),
      },
      {
        id: 'client',
        accessorKey: 'clientName',
        header: 'Client Enterprise',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-xs text-foreground">{row.original.clientName}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.contactPerson}</div>
          </div>
        ),
      },
      {
        accessorKey: 'billingMonth',
        header: 'Month',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.billingMonth}</span>
        ),
      },
      {
        accessorKey: 'capacityMbps',
        header: 'Capacity',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.capacityMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'subTotalBdt',
        header: 'Subtotal',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatBdtWithSymbol(row.original.subTotalBdt)}</span>
        ),
      },
      {
        accessorKey: 'vatAmountBdt',
        header: '5% VAT',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {formatBdtWithSymbol(row.original.vatAmountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'totalBdt',
        header: 'Total Bill',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.totalBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
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

  if (isLoading && invoices.length === 0) return <PageSkeleton variant="table" rows={4} />;
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
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Sales Invoices"
        subtitle="Invoices generated for wholesale sub-ISPs and corporate leased line accounts"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Sell' },
          { label: 'Invoices' },
        ]}
      />

      <DataTable
        columns={columns}
        data={invoices}
        getRowId={(row) => row.id}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice, client, month..."
        searchFilterFn={invoiceSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No invoices"
        emptyDescription="Sales invoices will appear here once generated."
      />

      {/* Invoice Modal Preview (Mirroring PHP reference invoice.php) */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          {selectedInvoice && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">ISP PAY BD LTD</h2>
                  <p className="text-xs text-muted-foreground">Carrier Wholesale & Bandwidth Distribution NOC</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-primary">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">Date: {selectedInvoice.invoiceDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border p-3 space-y-1">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">Billed To:</span>
                  <div className="font-bold text-sm text-foreground">{selectedInvoice.clientName}</div>
                  <div className="text-muted-foreground">Attn: {selectedInvoice.contactPerson}</div>
                  <div className="text-muted-foreground">Billing Month: {selectedInvoice.billingMonth}</div>
                </div>

                <div className="rounded-lg border p-3 space-y-1">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">Payment Summary:</span>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-mono font-medium">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden">
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
                      <TableCell className="font-medium text-xs">
                        Dedicated Internet Access (DIA) Wholesale Bandwidth
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">{selectedInvoice.capacityMbps} Mbps</TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatBdtWithSymbol(selectedInvoice.ratePerMbpsBdt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right font-medium">
                        {formatBdtWithSymbol(selectedInvoice.subTotalBdt)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono font-medium">{formatBdtWithSymbol(selectedInvoice.subTotalBdt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Govt VAT (5%):</span>
                    <span className="font-mono font-medium">{formatBdtWithSymbol(selectedInvoice.vatAmountBdt)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold">
                    <span>Total Payable:</span>
                    <span className="font-mono text-primary">{formatBdtWithSymbol(selectedInvoice.totalBdt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
