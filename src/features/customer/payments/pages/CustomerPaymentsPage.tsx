'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  CreditCard,
  Download,
  Search,
  Filter,
  Receipt,
  Printer,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState, CustomerEmptyState } from '@/features/customer/shared';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import type { Payment } from '@/data/shared/types';
import { toast } from 'sonner';

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useCustomerPayments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  const payments = data?.payments;
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter((p) => {
      const matchSearch =
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        (p.note ?? '').toLowerCase().includes(search.toLowerCase()) ||
        p.method.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  if (isLoading) {
    return (
      <CustomerPageShell title="My Payments" subtitle="Loading invoice and transaction history...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="My Payments" subtitle="Billing & Invoice Center">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { summary } = data;

  const handlePrint = () => {
    toast.success('Preparing invoice for printing/download...');
    window.print();
  };

  return (
    <CustomerPageShell
      title="Payment History"
      subtitle="Track all your monthly internet recharges, payment method TrxIDs, and official tax invoices."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Payments' },
      ]}
      actions={
        <Link href="/customer/payments/pay">
          <Button className="font-semibold shadow-sm gap-2">
            <CreditCard className="h-4 w-4" />
            Make a Payment
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Payment Summary KPI Cards matching PHP payments/customer/user.php */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Paid</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatBdtWithSymbol(summary.totalPaidBdt)}
                </h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {summary.successfulCount} successful invoices
                </span>
              </div>
              <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Due</p>
                <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                  {formatBdtWithSymbol(summary.pendingDueBdt)}
                </h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {summary.pendingCount} pending payment
                </span>
              </div>
              <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Gateways</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">bKash / Nagad</h3>
                <span className="text-xs text-muted-foreground mt-1 block">Instant automated recharge</span>
              </div>
              <div className="rounded-xl p-3 bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Invoicing Method</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">Monthly Pre-paid</h3>
                <span className="text-xs text-muted-foreground mt-1 block">Cycle renews on 1st of month</span>
              </div>
              <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Receipt className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border bg-card">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice number, TrxID, method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
              <SelectTrigger className="w-full sm:w-44 text-xs h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="completed">Paid (Completed)</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed / Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payments Table (Desktop) / Cards (Mobile fallback below 768px DoD rule) */}
        {filteredPayments.length === 0 ? (
          <CustomerEmptyState
            title="No payments found"
            description="There are no transaction records matching your current search or filter criteria."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b font-semibold">
                    <tr>
                      <th className="px-4 py-3">Invoice No</th>
                      <th className="px-4 py-3">Payment Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Gateway</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Trx Note</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-semibold text-primary">
                          {payment.invoiceNo}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {formatDate(payment.paidAt)}
                        </td>
                        <td className="px-4 py-3.5 font-bold">
                          {formatBdtWithSymbol(payment.amountBdt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="capitalize font-medium text-xs rounded-md bg-muted px-2 py-1">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              payment.status === 'completed'
                                ? 'default'
                                : payment.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="text-[11px] capitalize"
                          >
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                          {payment.note ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(payment)}
                            className="h-8 gap-1.5 text-xs"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Invoice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (< 768px DoD rule) */}
            <div className="grid gap-3 md:hidden">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-primary">{payment.invoiceNo}</span>
                    <Badge
                      variant={
                        payment.status === 'completed'
                          ? 'default'
                          : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-xs capitalize"
                    >
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-bold text-sm">{formatBdtWithSymbol(payment.amountBdt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gateway:</span>
                      <div className="font-semibold uppercase">{payment.method}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div>{formatDate(payment.paidAt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trx Details:</span>
                      <div className="font-mono truncate">{payment.note ?? 'Monthly fee'}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(payment)}
                    className="w-full h-8 text-xs gap-2"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    View & Print Invoice
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Invoice Detail / Printable Modal */}
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-md print:max-w-none print:m-0">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Official Receipt</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedInvoice?.invoiceNo}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6 pt-2">
                <div className="border-b pb-4 space-y-1 text-center">
                  <h3 className="font-black text-lg text-primary tracking-tight">ISP Pay BD Network</h3>
                  <p className="text-xs text-muted-foreground">
                    Licensed Internet Service Provider · Uttara Central POP, Dhaka
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    BIN / Tax No: 001847291-0101
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Billed To:</span>
                    <div className="font-bold text-sm mt-0.5">{selectedInvoice.customerName}</div>
                    <div className="text-muted-foreground font-mono">ID: {selectedInvoice.customerId}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Date of Payment:</span>
                    <div className="font-bold mt-0.5">{formatDate(selectedInvoice.paidAt)}</div>
                    <div className="text-muted-foreground capitalize">Via {selectedInvoice.method}</div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Broadband Subscription Recharge</span>
                    <span>{formatBdtWithSymbol(selectedInvoice.amountBdt)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Includes 5% Govt VAT / SD</span>
                    <span>৳0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-sm">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatBdtWithSymbol(selectedInvoice.amountBdt)}</span>
                  </div>
                </div>

                {selectedInvoice.note && (
                  <div className="rounded-md bg-muted/40 p-2.5 text-xs font-mono text-muted-foreground">
                    Transaction ID: {selectedInvoice.note}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Verified electronically
                  </span>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </Button>
                    <Button size="sm" onClick={() => setSelectedInvoice(null)} className="text-xs">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}
