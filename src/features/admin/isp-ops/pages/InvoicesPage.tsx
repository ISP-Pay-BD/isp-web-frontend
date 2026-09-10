'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  Copy,
  Check,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspInvoice } from '@/data/admin/isp-ops.data';

type InvoiceStatus = 'all' | 'paid' | 'sent' | 'overdue' | 'draft';
type SortOption = 'dueDate' | 'amountDesc' | 'amountAsc' | 'invoiceNo';

export function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [selectedInvoice, setSelectedInvoice] = useState<IspInvoice | null>(null);
  const [copiedInvoiceNo, setCopiedInvoiceNo] = useState<string | null>(null);

  const rawInvoices = useMemo(() => data?.invoices ?? [], [data?.invoices]);

  // Aggregate Billing Metrics
  const totalBilledBdt = useMemo(
    () => rawInvoices.reduce((s, i) => s + i.amountBdt + i.taxBdt, 0),
    [rawInvoices]
  );
  const totalCollectedBdt = useMemo(
    () =>
      rawInvoices
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + (i.paidAmountBdt ?? (i.amountBdt + i.taxBdt)), 0),
    [rawInvoices]
  );
  const totalOverdueBdt = useMemo(
    () =>
      rawInvoices
        .filter((i) => i.status === 'overdue')
        .reduce((s, i) => s + i.amountBdt + i.taxBdt, 0),
    [rawInvoices]
  );
  const totalTaxBdt = useMemo(
    () => rawInvoices.reduce((s, i) => s + i.taxBdt, 0),
    [rawInvoices]
  );

  const paidCount = useMemo(() => rawInvoices.filter((i) => i.status === 'paid').length, [rawInvoices]);
  const overdueCount = useMemo(() => rawInvoices.filter((i) => i.status === 'overdue').length, [rawInvoices]);
  const collectionRate = totalBilledBdt > 0 ? Math.round((totalCollectedBdt / totalBilledBdt) * 100) : 0;

  // Periods list
  const periodOptions = useMemo(() => {
    return Array.from(new Set(rawInvoices.map((i) => i.period))).sort().reverse();
  }, [rawInvoices]);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return rawInvoices
      .filter((inv) => {
        if (search) {
          const q = search.toLowerCase().trim();
          const match =
            inv.number.toLowerCase().includes(q) ||
            inv.customerName.toLowerCase().includes(q) ||
            inv.customerId.toLowerCase().includes(q) ||
            (inv.customerPhone && inv.customerPhone.toLowerCase().includes(q)) ||
            (inv.packageName && inv.packageName.toLowerCase().includes(q)) ||
            (inv.area && inv.area.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (statusFilter !== 'all' && inv.status !== statusFilter) {
          return false;
        }

        if (periodFilter !== 'all' && inv.period !== periodFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        if (sortBy === 'amountDesc') return (b.amountBdt + b.taxBdt) - (a.amountBdt + a.taxBdt);
        if (sortBy === 'amountAsc') return (a.amountBdt + a.taxBdt) - (b.amountBdt + b.taxBdt);
        if (sortBy === 'invoiceNo') return b.number.localeCompare(a.number);
        return 0;
      });
  }, [rawInvoices, search, statusFilter, periodFilter, sortBy]);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedInvoiceNo(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedInvoiceNo(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice Number',
      'Customer Name',
      'Customer ID',
      'Phone',
      'Package Plan',
      'Area',
      'Billing Period',
      'Subtotal (BDT)',
      '15% VAT (BDT)',
      'Total Amount (BDT)',
      'Status',
      'Payment Method',
      'TRX ID',
      'Due Date',
      'Created Date',
    ];
    const rows = filteredInvoices.map((i) => [
      i.number,
      `"${i.customerName.replace(/"/g, '""')}"`,
      i.customerId,
      i.customerPhone ?? '—',
      `"${(i.packageName ?? 'Internet Package').replace(/"/g, '""')}"`,
      `"${(i.area ?? 'Dhaka').replace(/"/g, '""')}"`,
      i.period,
      i.amountBdt,
      i.taxBdt,
      i.amountBdt + i.taxBdt,
      i.status.toUpperCase(),
      i.paymentMethod ?? '—',
      i.trxId ?? '—',
      i.dueDate,
      i.createdAt ?? '2026-09-01',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isppaybd_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredInvoices.length} invoices to CSV`);
  };

  const handleSendReminder = (customerName: string, channel: string) => {
    toast.success(`Billing payment reminder sent to ${customerName} via ${channel}`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load invoices"
        description="Could not synchronize with ISP billing engine."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Invoices & Billing Ledger"
        subtitle="Manage subscriber billing cycles, track bKash/bank collections, and issue NBR Mushak 6.3 invoices."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Invoices synchronized');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Ledger
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>

            <Button
              size="sm"
              onClick={() => toast.success('Generated batch billing cycle for September 2026 (480 invoices created)')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Generate Month Cycle
            </Button>
          </div>
        }
      />

      {/* KPI Financial Overview Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              ৳ {totalBilledBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{rawInvoices.length} total invoices</span>
            <span className="text-foreground/80 font-medium">VAT: ৳{totalTaxBdt.toLocaleString()}</span>
          </div>
        </Card>

        {/* Collected / Paid */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Collected / Paid
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              ৳ {totalCollectedBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Collection rate</span>
              <span className="text-emerald-500 font-semibold">{collectionRate}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Outstanding & Overdue */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Overdue & Unpaid
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              ৳ {totalOverdueBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-rose-500 font-semibold">{overdueCount} accounts overdue</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => setStatusFilter('overdue')}
              className="h-auto p-0 text-[11px] text-primary"
            >
              Filter Overdue →
            </Button>
          </div>
        </Card>

        {/* Total VAT NBR */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              VAT & Compliance
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              15.0%
            </span>
            <span className="text-xs text-muted-foreground">Standard VAT</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Mushak 6.3 Ready</span>
            <span className="text-emerald-500 font-medium">NBR Compliant</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter Card */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by invoice #, customer name, phone, area, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Selects */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v || 'all')}>
                <SelectTrigger className="h-9 text-xs w-[150px] bg-background border-border/60">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing Periods</SelectItem>
                  {periodOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy((v as SortOption) || 'dueDate')}>
                <SelectTrigger className="h-9 text-xs w-[170px] bg-background border-border/60">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Sort: Due Date</SelectItem>
                  <SelectItem value="amountDesc">Sort: Amount (High → Low)</SelectItem>
                  <SelectItem value="amountAsc">Sort: Amount (Low → High)</SelectItem>
                  <SelectItem value="invoiceNo">Sort: Invoice Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
              Status:
            </span>

            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                statusFilter === 'all' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              All Invoices ({rawInvoices.length})
            </Button>

            <Button
              variant={statusFilter === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('paid')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              )}
            >
              <CheckCircle2 className="h-3 w-3" /> Paid & Settled ({paidCount})
            </Button>

            <Button
              variant={statusFilter === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('sent')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                statusFilter === 'sent'
                  ? 'bg-sky-600 text-white'
                  : 'text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/10'
              )}
            >
              <Send className="h-3 w-3" /> Sent / Pending ({rawInvoices.filter((i) => i.status === 'sent').length})
            </Button>

            <Button
              variant={statusFilter === 'overdue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('overdue')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                statusFilter === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
              )}
            >
              <AlertTriangle className="h-3 w-3" /> Overdue ({overdueCount})
            </Button>

            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                statusFilter === 'draft' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              Drafts ({rawInvoices.filter((i) => i.status === 'draft').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-3">Plan / Period</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-3">15% VAT</th>
                <th className="py-3 px-4">Total (BDT)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No invoices match your search or filter</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setPeriodFilter('all');
                        }}
                        className="mt-1 text-xs"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const total = inv.amountBdt + inv.taxBdt;
                  const isOverdue = inv.status === 'overdue';
                  const isPaid = inv.status === 'paid';

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={cn(
                        'hover:bg-muted/30 cursor-pointer transition-colors group',
                        isOverdue && 'bg-rose-500/5'
                      )}
                    >
                      {/* Invoice No */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/invoices/${inv.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-xs font-bold text-primary hover:underline"
                          >
                            {inv.number}
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(inv.number, e)}
                            className="text-muted-foreground/60 hover:text-foreground p-0.5"
                            title="Copy Invoice #"
                          >
                            {copiedInvoiceNo === inv.number ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Created: {inv.createdAt ?? '2026-09-01'}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            {inv.customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground text-sm truncate">
                              {inv.customerName}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="font-mono text-[10px]">{inv.customerId}</span>
                              {inv.customerPhone && (
                                <>
                                  <span>·</span>
                                  <span>{inv.customerPhone}</span>
                                </>
                              )}
                            </div>
                            {inv.area && (
                              <span className="text-[10px] text-muted-foreground/70 truncate">
                                {inv.area}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Package / Period */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-xs truncate max-w-[150px]">
                            {inv.packageName ?? 'Broadband Plan'}
                          </span>
                          <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 h-4 border-border/80 font-mono mt-0.5">
                            {inv.period}
                          </Badge>
                        </div>
                      </td>

                      {/* Amount Subtotal */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-medium text-foreground tabular-nums text-xs">
                          ৳ {inv.amountBdt.toLocaleString()}
                        </span>
                      </td>

                      {/* 15% VAT */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          ৳ {inv.taxBdt.toLocaleString()}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground font-mono tabular-nums text-sm">
                          ৳ {total.toLocaleString()}
                        </span>
                        {inv.paymentMethod && isPaid && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            via {inv.paymentMethod}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> Overdue
                          </span>
                        ) : inv.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                            <Send className="h-3 w-3" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-foreground font-medium">
                            {inv.dueDate}
                          </span>
                          {isOverdue ? (
                            <span className="text-[10px] text-rose-500 font-semibold">Overdue</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Due date</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(inv)}
                            className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 text-xs">
                              <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.location.href = `/admin/invoices/${inv.id}`}>
                                <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                                Full Invoice View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Invoice PDF downloaded for ${inv.number}`)}>
                                <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendReminder(inv.customerName, 'WhatsApp')}>
                                <Send className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                Send via WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendReminder(inv.customerName, 'SMS')}>
                                <Phone className="mr-2 h-3.5 w-3.5 text-sky-500" />
                                Send SMS Reminder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!isPaid && (
                                <DropdownMenuItem onClick={() => toast.success(`Marked invoice ${inv.number} as Paid via Cash/bKash`)}>
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                  Record Payment Received
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="p-3.5 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <div>
            Showing <strong className="text-foreground">{filteredInvoices.length}</strong> of{' '}
            <strong className="text-foreground">{rawInvoices.length}</strong> invoices for billing ledger.
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Active Cycle: 2026-09</span>
            <span>·</span>
            <span className="text-emerald-500 font-medium">Gateway: Auto-Reconcile On</span>
          </div>
        </div>
      </Card>

      {/* Invoice Quick-Inspect Drawer Sheet */}
      <Sheet open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedInvoice && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold uppercase px-2 py-0.5',
                      selectedInvoice.status === 'paid'
                        ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                        : selectedInvoice.status === 'overdue'
                        ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
                        : 'border-sky-500/40 text-sky-500 bg-sky-500/10'
                    )}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Due: {selectedInvoice.dueDate}
                  </span>
                </div>

                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  Invoice {selectedInvoice.number}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  Period: {selectedInvoice.period} · Customer ID: {selectedInvoice.customerId}
                </SheetDescription>
              </SheetHeader>

              {/* Customer Profile Card */}
              <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                  Customer Billing Information
                </span>
                <p className="text-sm font-bold text-foreground">{selectedInvoice.customerName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span>Phone:</span>
                    <p className="text-foreground font-medium">{selectedInvoice.customerPhone ?? '+880 1700-000000'}</p>
                  </div>
                  <div>
                    <span>Area:</span>
                    <p className="text-foreground font-medium">{selectedInvoice.area ?? 'Dhaka'}</p>
                  </div>
                  <div className="col-span-2">
                    <span>Package Subscription:</span>
                    <p className="text-foreground font-medium">{selectedInvoice.packageName ?? 'Home Ultra 40 Mbps'}</p>
                  </div>
                </div>
              </Card>

              {/* Line Items Breakdown */}
              <Card className="p-4 border-border/80 bg-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Billing Itemization
                </h4>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-foreground">Monthly Internet Subscription ({selectedInvoice.period})</span>
                    <span className="font-mono font-medium text-foreground">৳ {selectedInvoice.amountBdt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Standard VAT (15% NBR Mushak 6.3)</span>
                    <span className="font-mono font-medium text-foreground">৳ {selectedInvoice.taxBdt.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.discountBdt ? (
                    <div className="flex justify-between pt-2 text-emerald-600 dark:text-emerald-400">
                      <span>Promotional Discount / Credit</span>
                      <span className="font-mono font-medium">-৳ {selectedInvoice.discountBdt.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-3 text-sm font-bold border-t border-border/80">
                    <span>Total Payable Amount</span>
                    <span className="font-mono text-primary">
                      ৳ {(selectedInvoice.amountBdt + selectedInvoice.taxBdt - (selectedInvoice.discountBdt ?? 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Verification / Method */}
              {selectedInvoice.status === 'paid' ? (
                <Card className="p-4 border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Paid & Reconciled
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 space-y-1">
                    <p>Payment Method: <strong className="text-foreground">{selectedInvoice.paymentMethod ?? 'bKash'}</strong></p>
                    {selectedInvoice.trxId && (
                      <p>Transaction ID: <strong className="font-mono text-foreground">{selectedInvoice.trxId}</strong></p>
                    )}
                    {selectedInvoice.paidAt && (
                      <p>Paid At: <strong className="font-mono text-foreground">{selectedInvoice.paidAt}</strong></p>
                    )}
                  </div>
                </Card>
              ) : null}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={`/admin/invoices/${selectedInvoice.id}`}
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold gap-1.5 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> Open Full Printable PDF Invoice
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendReminder(selectedInvoice.customerName, 'WhatsApp')}
                    className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => toast.success(`PDF downloaded for ${selectedInvoice.number}`)}
                    className="text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" /> Download PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
