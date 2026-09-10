'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';

export function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useIspOps();
  const [copied, setCopied] = useState(false);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load invoice"
        description="Could not query invoice records."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const inv = data.invoices.find((i) => i.id === params.id) ?? data.invoices[0];
  if (!inv) return <EmptyState title="Invoice not found" actionLabel="Back to Invoices" onAction={() => router.push('/admin/invoices')} />;

  const subtotal = inv.amountBdt;
  const vat = inv.taxBdt;
  const discount = inv.discountBdt ?? 0;
  const total = subtotal + vat - discount;
  const isPaid = inv.status === 'paid';
  const isOverdue = inv.status === 'overdue';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied invoice number');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-24">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center justify-center rounded-md border border-border/80 bg-background hover:bg-accent h-8 px-2.5 text-xs text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> All Invoices
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground font-mono">{inv.number}</h1>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-semibold uppercase px-2 py-0.5',
                  isPaid
                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                    : isOverdue
                    ? 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                    : 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10'
                )}
              >
                {inv.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billing Period: <span className="font-semibold text-foreground">{inv.period}</span> · Due: <span className="font-semibold text-foreground">{inv.dueDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 gap-1.5 border-border/80 hover:bg-accent"
          >
            <Printer className="h-3.5 w-3.5 text-muted-foreground" /> Print / Save PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`Invoice ${inv.number} sent to ${inv.customerName} via WhatsApp & SMS`)}
            className="text-xs h-8 gap-1.5 border-border/80 hover:bg-accent"
          >
            <Send className="h-3.5 w-3.5 text-emerald-500" /> Send to Customer
          </Button>

          {!isPaid && (
            <Button
              size="sm"
              onClick={() => toast.success(`Payment recorded for ${inv.number} (৳ ${total.toLocaleString()})`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Document Sheet */}
      <Card className="border-border/80 bg-card shadow-md overflow-hidden print:border-none print:shadow-none">
        <CardContent className="p-8 sm:p-12 space-y-8">
          {/* Header Row: Company & Invoice Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/80 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  IP
                </div>
                <span className="text-xl font-bold text-foreground tracking-tight">ISP Pay BD</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Broadband Internet, Fiber-To-The-Home (FTTH) & Corporate Telecommunications Services
              </p>
              <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
                <p>House 42, Road 11, Block D, Banani, Dhaka-1213</p>
                <p>Support Hotline: 09678-000111 · support@isppaybd.com</p>
                <p className="font-mono text-[10px]">NBR BIN: 002391024-0101 · Trade Lic: TRAD/DNCC/091244</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> NBR Mushak 6.3 Invoice
              </div>
              <h2 className="text-2xl font-bold text-foreground font-mono">{inv.number}</h2>
              <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                <p>Issue Date: <strong className="text-foreground">{inv.createdAt ?? '2026-09-01'}</strong></p>
                <p>Billing Cycle: <strong className="text-foreground">{inv.period}</strong></p>
                <p>Payment Due: <strong className={cn(isOverdue ? 'text-rose-500 font-bold' : 'text-foreground')}>{inv.dueDate}</strong></p>
              </div>
            </div>
          </div>

          {/* Billing Meta Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-lg border border-border/60 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Billed To (Subscriber)
              </span>
              <h3 className="text-sm font-bold text-foreground mt-1">{inv.customerName}</h3>
              <p className="font-mono text-muted-foreground mt-0.5">Customer ID: {inv.customerId}</p>
              <p className="text-muted-foreground mt-0.5">{inv.customerPhone ?? '+880 1711-000000'}</p>
              <p className="text-muted-foreground mt-0.5">{inv.area ?? 'Gulshan, Dhaka'}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Subscription Details
              </span>
              <p className="text-sm font-bold text-foreground mt-1">{inv.packageName ?? 'Home Ultra 40 Mbps'}</p>
              <p className="text-muted-foreground mt-0.5">Connection: Fiber Optical FTTH</p>
              <p className="text-muted-foreground mt-0.5">Gateway: MK-Gulshan-Core (VLAN-100)</p>
              <div className="mt-2 inline-flex items-center gap-1.5 font-semibold">
                Payment Status:{' '}
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] uppercase font-bold',
                    isPaid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  )}
                >
                  {inv.status}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Invoice Itemization
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">SL</th>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-3 text-center">Qty / Period</th>
                    <th className="py-2.5 px-4 text-right">Unit Price (BDT)</th>
                    <th className="py-2.5 px-4 text-right">VAT Rate</th>
                    <th className="py-2.5 px-4 text-right">Total Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-3 px-3 font-mono text-muted-foreground">01</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{inv.packageName ?? 'High-Speed Broadband Internet'}</p>
                      <p className="text-[11px] text-muted-foreground">Dedicated monthly bandwidth allocation for cycle {inv.period}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">1 Month</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">৳ {subtotal.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">15% NBR</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground tabular-nums">
                      ৳ {subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-border/80 pt-6">
            <div className="space-y-2 max-w-sm text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Payment Instructions:</span>
              <p>
                Pay instantly using bKash / Nagad / Rocket merchant payment. Select "Make Payment" → Enter Merchant No: <strong>01700-000000</strong> → Counter: <strong>1</strong> → Reference: <strong>{inv.number}</strong>.
              </p>
              {isPaid && (
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-0.5 font-mono text-[11px]">
                  <p>✔ Payment Settled: ৳ {total.toLocaleString()} BDT</p>
                  <p>Payment Method: {inv.paymentMethod ?? 'bKash'} {inv.trxId ? `· TRX: ${inv.trxId}` : ''}</p>
                  <p>Reconciled At: {inv.paidAt ?? '2026-09-05'}</p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (Net)</span>
                <span className="font-mono tabular-nums text-foreground">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>15% VAT (Govt. Levy)</span>
                <span className="font-mono tabular-nums text-foreground">৳ {vat.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promotional Discount</span>
                  <span className="font-mono tabular-nums">-৳ {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-border/80 pt-3 text-base font-bold text-foreground">
                <span>Grand Total</span>
                <span className="font-mono text-primary tabular-nums">৳ {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="border-t border-border/60 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-muted-foreground">
            <div>
              <p>This is a computer-generated official billing statement.</p>
              <p>For billing discrepancies, contact billing@isppaybd.com within 7 days.</p>
            </div>
            <div className="text-center sm:text-right border-t border-muted-foreground/30 pt-2 w-48">
              <p className="font-semibold text-foreground">Authorized Signature</p>
              <p className="text-[10px]">ISP Pay BD Accounts Dept.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
