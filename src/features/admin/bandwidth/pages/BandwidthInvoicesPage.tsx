'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthInvoiceItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBdtWithSymbol } from '@/lib/format';
import { FileText, Printer, Download, Receipt, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthInvoicesPage() {
  const { data, isLoading } = useBandwidthData();
  const [selectedInvoice, setSelectedInvoice] = useState<BandwidthInvoiceItem | null>(null);

  const invoices = data?.invoices ?? [];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && invoices.length === 0) return <PageSkeleton rows={4} />;

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

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client Enterprise</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>5% VAT</TableHead>
              <TableHead>Total Bill</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv, idx) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-mono text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-xs text-foreground">{inv.clientName}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.contactPerson}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{inv.billingMonth}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">{inv.capacityMbps} Mbps</TableCell>
                <TableCell className="font-mono text-xs">{formatBdtWithSymbol(inv.subTotalBdt)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{formatBdtWithSymbol(inv.vatAmountBdt)}</TableCell>
                <TableCell className="font-mono text-sm font-bold text-foreground">
                  {formatBdtWithSymbol(inv.totalBdt)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    View Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
