'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Receipt,
  Download,
  Wallet,
  CheckCircle2,
  Hourglass,
  Copy,
  Smartphone,
  CreditCard,
  FileText,
  Printer,
} from 'lucide-react';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Payment } from '@/data/shared/types';

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useCustomerPayments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const items = data?.items ?? [];

  // Metrics
  const totalCollected = useMemo(
    () => items.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amountBdt, 0),
    [items]
  );
  const pendingCount = useMemo(
    () => items.filter((p) => p.status === 'pending').length,
    [items]
  );
  const mfsVolume = useMemo(
    () => items.filter((p) => p.method === 'bkash' || p.method === 'nagad').reduce((s, p) => s + p.amountBdt, 0),
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        search === '' ||
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        (p.note ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [items, search, statusFilter, methodFilter]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleExportCsv = () => {
    const headers = ['Invoice No', 'Customer Name', 'Customer ID', 'Amount (BDT)', 'Method', 'Status', 'Date', 'Note'];
    const rows = filtered.map((p) => [
      p.invoiceNo,
      p.customerName,
      p.customerId,
      p.amountBdt,
      p.method,
      p.status,
      p.paidAt,
      p.note ?? '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payment ledger exported to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load payments"
        description="Could not fetch payment records from ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Customer Payments"
        subtitle="Broadband subscriber collection ledger — bKash, Nagad, cash handovers, and bank deposits"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customer Payments' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>
            <Can menu="customer_payment" action="create">
              <Link href="/admin/customer-payments/new">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Record Payment
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collections"
          value={<CurrencyDisplay amount={totalCollected} className="font-mono text-foreground font-bold" />}
          description={`${items.length} total receipts recorded`}
          trend={{ value: '100% verified ledger', positive: true }}
          icon={Wallet}
        />
        <StatCard
          title="MFS Gateway Share"
          value={<CurrencyDisplay amount={mfsVolume} className="font-mono text-emerald-600 dark:text-emerald-400 font-bold" />}
          description="Direct bKash & Nagad payments"
          trend={{ value: 'Instant settlement', positive: true }}
          icon={Smartphone}
        />
        <StatCard
          title="Pending Clearances"
          value={
            <div className="flex items-baseline gap-1 text-amber-600 dark:text-amber-400">
              <span>{pendingCount}</span>
              <span className="text-xs font-normal text-muted-foreground">invoices</span>
            </div>
          }
          description="Manual bank or cheque transfers"
          trend={{ value: 'Verification needed', positive: false }}
          icon={Hourglass}
        />
        <Card className="p-4 rounded-xl border-border/70 bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Bill / User</span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Receipt className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-foreground mt-2 font-mono">
            ৳{items.length ? Math.round(totalCollected / items.length).toLocaleString() : '0'}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Monthly package average</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter Bar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, customer name, or TrxID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-background/50 rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[125px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={(v) => v && setMethodFilter(v)}>
              <SelectTrigger className="w-[125px] h-9 text-xs">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Deposit</SelectItem>
                <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Data Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Transaction / Note</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const isBkash = row.method === 'bkash';
                  const isNagad = row.method === 'nagad';
                  const isCash = row.method === 'cash';
                  const isBank = row.method === 'bank';
                  const isCard = row.method === 'sslcommerz';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPayment(row)}
                    >
                      {/* Invoice */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <Receipt className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                              <span>{row.invoiceNo}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(row.invoiceNo, 'Invoice');
                                }}
                                className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
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

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground hover:text-primary transition-colors">
                          {row.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">{row.customerId}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sm text-foreground">
                          <CurrencyDisplay amount={row.amountBdt} />
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border',
                            isBkash && 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                            isNagad && 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                            isCash && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                            isBank && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            isCard && 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          )}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: isBkash
                                ? '#e2136e'
                                : isNagad
                                ? '#f7941d'
                                : isCash
                                ? '#10b981'
                                : isBank
                                ? '#3b82f6'
                                : '#6366f1',
                            }}
                          />
                          {row.method.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[200px] block">
                          {row.note ?? '—'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(row);
                          }}
                          className="h-7 text-xs text-primary hover:bg-primary/10"
                        >
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          View
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

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Payment Receipt</DialogTitle>
                  <DialogDescription className="text-xs font-mono">{selectedPayment?.invoiceNo}</DialogDescription>
                </div>
              </div>
              {selectedPayment && <StatusBadge status={selectedPayment.status} />}
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscriber:</span>
                  <span className="font-bold text-foreground">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscriber ID:</span>
                  <span className="font-mono text-foreground">{selectedPayment.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-semibold text-foreground">{formatDateTime(selectedPayment.paidAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold uppercase">{selectedPayment.method}</span>
                </div>
                {selectedPayment.note && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference / TrxID:</span>
                    <span className="font-mono font-bold text-foreground">{selectedPayment.note}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono text-primary text-base">৳{selectedPayment.amountBdt.toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Receipt for ${selectedPayment.invoiceNo} downloaded`);
                    setSelectedPayment(null);
                  }}
                  className="text-xs font-semibold"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
