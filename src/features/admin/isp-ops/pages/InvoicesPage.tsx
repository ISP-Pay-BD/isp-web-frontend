'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Send,
  Copy,
  MoreVertical,
  Plus,
  RefreshCw,
  Receipt,
  Loader2,
  Percent,
} from 'lucide-react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  downloadLedgerCsv,
  useCustomerPayments,
  useSendPaymentSms,
} from '@/features/admin/customer-payments/hooks/use-customer-payments';
import { MethodPill } from '@/features/admin/customer-payments/components/MethodPill';
import { SettlePaymentDialog, type SettleTarget } from '@/features/admin/customer-payments/components/SettlePaymentDialog';
import type { CustomerPaymentRow, LedgerFilters } from '@/features/admin/customer-payments/types';

const STATUS_TABS: { value: LedgerFilters['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'successful', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

/** Customer invoices = payments rows (invoice no, billing month, status). */
export function InvoicesPage() {
  const [filters, setFilters] = useState<LedgerFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    status: 'all',
    method: 'all',
    from: '',
    to: '',
  });
  const { data, isLoading, isError, isFetching, refetch } = useCustomerPayments(filters);
  const sendSms = useSendPaymentSms();
  const router = useRouter();
  const [settle, setSettle] = useState<SettleTarget | null>(null);
  const [exporting, setExporting] = useState(false);

  const patch = (next: Partial<LedgerFilters>) => setFilters((f) => ({ ...f, page: 1, ...next }));
  const summary = data?.summary;
  const items = data?.items ?? [];
  const collectionRate = summary && summary.totalAmount > 0 ? Math.round((summary.collected / summary.totalAmount) * 100) : null;

  const sendMutate = sendSms.mutate;
  const smsBusy = sendSms.isPending;

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadLedgerCsv(filters);
      toast.success('Invoices exported to CSV');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<CustomerPaymentRow, unknown>[]>(() => {
    const copy = (text: string) =>
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(`Copied ${text}`))
        .catch(() => toast.error('Clipboard is not available'));
    const remind = (inv: CustomerPaymentRow) =>
      sendMutate({
        customerId: inv.customerId,
        content:
          inv.status === 'completed'
            ? `Dear ${inv.customerName}, we received BDT ${inv.amountBdt.toFixed(2)} for ${inv.billingMonth || 'your bill'}. Invoice ${inv.invoiceNo}.`
            : `Dear ${inv.customerName}, your bill of BDT ${inv.amountBdt.toFixed(2)} for ${inv.billingMonth || 'this month'} is due. Invoice ${inv.invoiceNo}.`,
      });
    return [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
              <Link href={`/admin/invoices/${row.original.id}`} className="hover:text-primary truncate">
                {row.original.invoiceNo}
              </Link>
              <button type="button" onClick={() => copy(row.original.invoiceNo)} className="text-muted-foreground hover:text-primary" title="Copy">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 190,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.customerName}</div>
            <div className="text-[11px] text-muted-foreground font-mono">
              ID {row.original.customerId}
              {row.original.customerMobile ? ` · ${row.original.customerMobile}` : ''}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'billingMonth',
        header: 'Billing month',
        size: 110,
        cell: ({ row }) => <span className="text-xs">{row.original.billingMonth || '—'}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 110,
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} className="font-bold text-foreground" />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => <StatusBadge status={row.original.status === 'completed' ? 'paid' : row.original.status} />,
      },
      {
        accessorKey: 'method',
        header: 'Method',
        size: 130,
        cell: ({ row }) => (row.original.methodRaw ? <MethodPill method={row.original.method} methodRaw={row.original.methodRaw} /> : <span className="text-muted-foreground">—</span>),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        enableHiding: false,
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 text-xs">
                  <DropdownMenuLabel>Invoice actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${inv.id}`)}>
                    <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                    Open invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/admin/customer-payments/${inv.id}/pos`)}>
                    <Receipt className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    POS receipt
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={smsBusy} onClick={() => remind(inv)}>
                    <Send className="mr-2 h-3.5 w-3.5 text-sky-500" />
                    {inv.status === 'completed' ? 'Send receipt SMS' : 'Send SMS reminder'}
                  </DropdownMenuItem>
                  {inv.status === 'pending' ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setSettle({ id: inv.id, invoiceNo: inv.invoiceNo, amountBdt: inv.amountBdt, billingMonth: inv.billingMonth, customerName: inv.customerName })
                        }
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                        Record payment received
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [sendMutate, smsBusy, router]);

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load invoices" description="Could not query invoice records." actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title="Customer Invoices"
        subtitle="Monthly subscriber invoices and their settlement status"
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Billing' }, { label: 'Invoices' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs h-8">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Can menu="reports" action="read">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="text-xs h-8">
                {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} Export CSV
              </Button>
            </Can>
            <Can menu="customer_payment" action="create">
              <Link href="/admin/customer-payments/new">
                <Button size="sm" className="text-xs h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Record payment
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<FileText className="h-4 w-4" />} label="Total billed" tone="text-primary bg-primary/10">
          <CurrencyDisplay amount={summary?.totalAmount ?? 0} />
          <span className="text-xs text-muted-foreground font-normal ml-1">({summary?.count ?? 0})</span>
        </Kpi>
        <Kpi icon={<DollarSign className="h-4 w-4" />} label="Collected" tone="text-emerald-500 bg-emerald-500/10">
          <CurrencyDisplay amount={summary?.collected ?? 0} />
          <span className="text-xs text-muted-foreground font-normal ml-1">({summary?.paidCount ?? 0})</span>
        </Kpi>
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Pending" tone="text-amber-500 bg-amber-500/10">
          <CurrencyDisplay amount={summary?.pending ?? 0} />
          <span className="text-xs text-muted-foreground font-normal ml-1">({summary?.pendingCount ?? 0})</span>
        </Kpi>
        <Kpi icon={<Percent className="h-4 w-4" />} label="Collection rate" tone="text-blue-500 bg-blue-500/10">
          {collectionRate === null ? '—' : `${collectionRate}%`}
        </Kpi>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
            {STATUS_TABS.map((t) => (
              <Button
                key={t.value}
                size="sm"
                variant={filters.status === t.value ? 'default' : 'ghost'}
                className="h-7 text-xs px-3"
                onClick={() => patch({ status: t.value })}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => patch({ from: e.target.value })} className="h-8 w-[140px] text-xs" aria-label="From" />
            <Input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => patch({ to: e.target.value })} className="h-8 w-[140px] text-xs" aria-label="To" />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(r) => r.id}
        searchPlaceholder="Search invoice, customer, mobile or TrxID..."
        emptyTitle="No invoices found"
        emptyDescription="No invoices match the current filters."
        server={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
          onPageSizeChange: (pageSize) => patch({ pageSize }),
          search: filters.search,
          onSearchChange: (search) => setFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
        }}
      />

      <SettlePaymentDialog target={settle} onClose={() => setSettle(null)} />
    </div>
  );
}

function Kpi({ icon, label, tone, children }: { icon: ReactNode; label: string; tone: string; children: ReactNode }) {
  return (
    <Card className="p-4 border-border/60 bg-card/80 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
    </Card>
  );
}
