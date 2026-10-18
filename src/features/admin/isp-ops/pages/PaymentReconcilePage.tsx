'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { AlertTriangle, CheckCircle2, Clock, Scale, XCircle } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/features/shared/data-table';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { SettlePaymentDialog, type SettleTarget } from '@/features/admin/customer-payments/components/SettlePaymentDialog';
import { useCustomerPayments, useUpdatePaymentStatus } from '@/features/admin/customer-payments/hooks/use-customer-payments';
import type { CustomerPaymentRow, LedgerFilters } from '@/features/admin/customer-payments/types';

type ReviewStatus = 'pending' | 'failed';

/**
 * Payment reconciliation: the customer payments that still need a human
 * decision (pending / failed) from GET /v1/reseller/customer-payments/{rid}.
 * "Verify" records the payment as received and "Reject" marks it failed,
 * both through the existing PUT /v1/reseller/customer-payments/{rid}/{id}.
 */
export function PaymentReconcilePage() {
  const [status, setStatus] = useState<ReviewStatus>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [settle, setSettle] = useState<SettleTarget | null>(null);
  const [rejecting, setRejecting] = useState<CustomerPaymentRow | null>(null);

  const filters: LedgerFilters = { page, pageSize, search, status, method: '', from, to };
  const ledger = useCustomerPayments(filters);
  const update = useUpdatePaymentStatus();

  const columns = useMemo<LegacyColumnDef<CustomerPaymentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNo || '—'}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.customerName || '—'}</p>
            <p className="text-muted-foreground font-mono text-[11px]">{row.original.customerMobile}</p>
          </div>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} />,
      },
      {
        accessorKey: 'methodRaw',
        header: 'Method / TrxID',
        cell: ({ row }) => (
          <div className="text-xs">
            <p>{row.original.methodRaw || '—'}</p>
            <p className="text-muted-foreground font-mono">{row.original.trxId || 'No TrxID'}</p>
          </div>
        ),
      },
      {
        id: 'issue',
        header: 'Needs attention',
        cell: ({ row }) => {
          const r = row.original;
          if (r.status === 'failed') return <Badge variant="destructive">Failed</Badge>;
          return r.trxId ? (
            <Badge variant="outline">Awaiting verification</Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
              Missing TrxID
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Recorded',
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.createdAt || '—'}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() =>
                  setSettle({ id: r.id, invoiceNo: r.invoiceNo, amountBdt: r.amountBdt, billingMonth: r.billingMonth, customerName: r.customerName })
                }
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verify
              </Button>
              {r.status === 'pending' ? (
                <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => setRejecting(r)}>
                  <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (ledger.isLoading) return <PageSkeleton variant="table" />;

  const summary = ledger.data?.summary;

  return (
    <div className="w-full space-y-6 pb-20">
      <PageHeader
        title="Payment Reconciliation"
        subtitle="Customer payments that still need a decision — verify received money or reject failed attempts."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Payments' },
          { label: 'Reconcile' },
        ]}
      />

      {/* Totals cover the whole filtered set (backend summary), not just this page. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title={status === 'pending' ? 'Awaiting decision' : 'Failed attempts'}
          value={ledger.data?.meta.total ?? 0}
          icon={status === 'pending' ? Clock : AlertTriangle}
        />
        <StatCard title="Amount in this view" value={<CurrencyDisplay amount={summary?.totalAmount ?? 0} />} icon={Scale} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Status</p>
          <Select
            value={status}
            onValueChange={(v) => {
              if (!v) return;
              setStatus(v as ReviewStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">From</p>
          <Input type="date" className="h-9 w-40 text-xs" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">To</p>
          <Input type="date" className="h-9 w-40 text-xs" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
      </div>

      {ledger.isError ? (
        <EmptyState
          title="Could not load payments"
          description={errorMessage(ledger.error)}
          actionLabel="Retry"
          onAction={() => ledger.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={ledger.data?.items ?? []}
          emptyTitle={status === 'pending' ? 'Nothing waiting for verification' : 'No failed payments'}
          emptyDescription="Payments appear here when they are recorded as pending or failed."
          searchPlaceholder="Search invoice, customer, mobile or TrxID…"
          enableLayoutToggle={false}
          server={{
            page,
            pageSize,
            total: ledger.data?.meta.total ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            search,
            onSearchChange: (q) => {
              setSearch(q);
              setPage(1);
            },
          }}
        />
      )}

      <SettlePaymentDialog target={settle} onClose={() => setSettle(null)} />

      <ConfirmDialog
        open={!!rejecting}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this payment?"
        description={
          rejecting
            ? `Invoice ${rejecting.invoiceNo} for ${rejecting.customerName} will be marked as failed. The customer's subscription is not extended.`
            : ''
        }
        confirmLabel={update.isPending ? 'Rejecting…' : 'Reject payment'}
        destructive
        onConfirm={() => {
          if (!rejecting) return;
          update.mutate(
            {
              id: rejecting.id,
              amountBdt: rejecting.amountBdt,
              billingMonth: rejecting.billingMonth,
              status: 'failed',
              method: rejecting.methodRaw || 'Cash',
              trxId: rejecting.trxId || undefined,
            },
            { onSettled: () => setRejecting(null) },
          );
        }}
      />
    </div>
  );
}
