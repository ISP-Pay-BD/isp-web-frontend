'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CreditCard,
  Zap,
  Download,
  Receipt,
  CheckCircle2,
  Hourglass,
  Calendar,
  FileText,
  Copy,
  Printer,
  ShieldCheck,
  Building,
  ArrowRight,
} from 'lucide-react';
import { useTenantBilling } from '../hooks/use-tenant-billing';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TenantBillingPayment } from '@/data/admin/tenant-billing.data';

export function AdminPaymentPage() {
  const { data, isLoading, isError, refetch } = useTenantBilling();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<TenantBillingPayment | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  useEffect(() => {
    if (!selectedInvoice) {
      setReceiptVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setReceiptVisible(true), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedInvoice]);

  const items = data?.items ?? [];
  const summary = data?.summary;

  const completedCount = useMemo(() => items.filter((p) => p.status === 'completed').length, [items]);
  const pendingCount = useMemo(() => items.filter((p) => p.status === 'pending').length, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchQuery =
        search === '' ||
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        p.planName.toLowerCase().includes(search.toLowerCase()) ||
        (p.note?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [items, search, statusFilter]);

  const handleCopyInvoice = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast.success(`Invoice number ${invoiceNo} copied`);
  };

  const handleExportCsv = () => {
    const headers = ['Invoice No', 'Plan', 'Period', 'Amount (BDT)', 'Method', 'Status', 'Date', 'Note'];
    const rows = filtered.map((item) => [
      item.invoiceNo,
      item.planName,
      item.period,
      item.amountBdt,
      item.method,
      item.status,
      item.paidAt,
      item.note ?? '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isppaybd_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load payments"
        description="Could not fetch ISP Pay BD billing and subscription history."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Subscription Invoices & Payments"
        subtitle="Manage your ISP Pay BD platform licensing invoices, receipts, and payment transactions."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Subscription', url: '/admin/subscription' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent transition-all duration-150 hover:shadow-sm"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>
            <Link href="/admin/subscription">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs transition-all duration-150 hover:shadow-md">
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Self Recharge
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Paid Volume"
          value={<CurrencyDisplay amount={summary?.totalPaidBdt ?? 0} className="font-mono text-foreground font-black" />}
          description="All settled license subscription fees"
          trend={{ value: `${completedCount} invoices paid`, positive: true }}
          icon={CreditCard}
        />
        <StatCard
          title="Pending Invoices"
          value={<CurrencyDisplay amount={summary?.pendingBdt ?? 0} className="font-mono text-amber-600 dark:text-amber-400 font-black" />}
          description="Awaiting gateway clearance"
          trend={{ value: `${pendingCount} awaiting approval`, positive: false }}
          icon={Hourglass}
        />
        <Card className="p-4 rounded-xl border-border/70 bg-card shadow-2xs flex flex-col justify-between animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Plan</span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 transition-transform duration-200 hover:scale-110">
              <Zap className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground mt-2">Pro SaaS License</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Up to 2,000 subscribers</span>
          </div>
        </Card>
        <Card className="p-4 rounded-xl border-border/70 bg-card shadow-2xs flex flex-col justify-between animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gateway Channels</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 transition-transform duration-200 hover:scale-110">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground mt-2">bKash & Cards</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero merchant charge</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '280ms' }}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice number, plan, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-background/50 rounded-lg transition-shadow duration-200 focus:shadow-[0_0_0_2px] focus:shadow-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="text-xs h-8 font-medium transition-all duration-150"
            >
              All ({items.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              className="text-xs h-8 font-medium transition-all duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
              Completed ({completedCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              className="text-xs h-8 font-medium transition-all duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
              Pending ({pendingCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Data Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '320ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Plan & Billing Cycle</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No matching subscription invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const isBkash = row.method === 'bkash';
                  const isNagad = row.method === 'nagad';
                  const isSsl = row.method === 'sslcommerz';
                  const isBank = row.method === 'bank';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                      style={{ animationDelay: `${350 + i * 40}ms` }}
                      onClick={() => setSelectedInvoice(row)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 transition-transform duration-200 group-hover:scale-110">
                            <Receipt className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                              <span>{row.invoiceNo}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyInvoice(row.invoiceNo);
                                }}
                                className="hover:text-primary transition-colors"
                                title="Copy invoice number"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-normal">
                              {formatDateTime(row.paidAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{row.planName}</div>
                        <div className="text-[11px] text-muted-foreground">{row.period}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sm text-foreground">
                          <CurrencyDisplay amount={row.amountBdt} />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border transition-all duration-150',
                            isBkash && 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                            isNagad && 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                            isSsl && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            isBank && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          )}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: isBkash
                                ? '#e2136e'
                                : isNagad
                                ? '#f7941d'
                                : isSsl
                                ? '#2563eb'
                                : '#10b981',
                            }}
                          />
                          {row.method.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {row.note ?? '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(row);
                          }}
                          className="h-7 text-xs text-primary hover:bg-primary/10 transition-all duration-150"
                        >
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Receipt Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => {
        if (!open) {
          setReceiptVisible(false);
          setTimeout(() => setSelectedInvoice(null), 200);
        }
      }}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border-border/80 shadow-2xl">
          {selectedInvoice && (
            <div className={cn(
              'transition-all duration-300 ease-out',
              receiptVisible ? 'opacity-100' : 'opacity-0'
            )}>
              {/* Header */}
              <div className="relative px-6 pt-5 pb-4 border-b animate-in fade-in slide-in-from-top-3 duration-400">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-sm font-bold leading-tight">Subscription Invoice Receipt</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <DialogDescription className="text-xs font-mono text-muted-foreground">
                          {selectedInvoice.invoiceNo}
                        </DialogDescription>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedInvoice.invoiceNo);
                            toast.success('Invoice number copied');
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                          title="Copy invoice number"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4 text-xs">
                {/* Issued To + Payment Date */}
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '80ms' }}>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Issued To</span>
                    <div className="font-bold text-foreground text-sm">Demo ISP Dhaka</div>
                    <div className="text-[11px] text-muted-foreground">Uttara NOC, Dhaka 1230</div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Payment Date</span>
                    <div className="font-semibold text-foreground text-sm">{formatDateTime(selectedInvoice.paidAt)}</div>
                    <div className="text-[11px] text-muted-foreground">Cycle: {selectedInvoice.period}</div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="rounded-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '140ms' }}>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        <th className="text-left py-2 px-3.5">Description</th>
                        <th className="text-right py-2 px-3.5">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-t">
                      <tr className="animate-in fade-in duration-200 fill-mode-both" style={{ animationDelay: '180ms' }}>
                        <td className="py-2.5 px-3.5 font-medium text-foreground">{selectedInvoice.planName}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground">৳{selectedInvoice.amountBdt.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-muted/20 animate-in fade-in duration-200 fill-mode-both" style={{ animationDelay: '220ms' }}>
                        <td className="py-2 px-3.5 text-muted-foreground">Payment Gateway Fee (0% subsidized)</td>
                        <td className="py-2 px-3.5 text-right font-mono text-muted-foreground">৳0.00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-foreground/10 bg-muted/30 animate-in fade-in duration-200 fill-mode-both" style={{ animationDelay: '260ms' }}>
                        <td className="py-2.5 px-3.5 font-bold text-foreground">Total Amount Paid</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-black text-base text-primary">৳{selectedInvoice.amountBdt.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Gateway Details */}
                <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Payment Gateway</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gateway Method</span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[10px] border',
                      selectedInvoice.method === 'bkash' && 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                      selectedInvoice.method === 'nagad' && 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                      selectedInvoice.method === 'sslcommerz' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                      selectedInvoice.method === 'bank' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                    )}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{
                        backgroundColor: selectedInvoice.method === 'bkash' ? '#e2136e' : selectedInvoice.method === 'nagad' ? '#f7941d' : selectedInvoice.method === 'sslcommerz' ? '#2563eb' : '#10b981',
                      }} />
                      {selectedInvoice.method.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gateway Reference</span>
                    <span className="font-mono font-semibold text-foreground">{selectedInvoice.note || 'Direct Merchant Settlement'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t bg-muted/20 animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both" style={{ animationDelay: '350ms' }}>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>ISP Pay BD Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-xs h-8 transition-all duration-150 hover:shadow-sm"
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success(`Receipt for ${selectedInvoice.invoiceNo} downloaded`);
                      setSelectedInvoice(null);
                    }}
                    className="text-xs h-8 font-semibold transition-all duration-150 hover:shadow-md"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
