'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCustomerActions, useFreeRequestCounts, useFreeRequests } from '../hooks/use-customers';
import type { FreeRequest } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useUrlParam } from '@/hooks/use-url-state';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { customerStatusLabel } from '../lib/labels';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_FILTERS: readonly StatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

const fmtDate = (v: string | null) => (v ? formatDate(v.replace(' ', 'T')) : '—');

export function FreeRequestsPage() {
  const t = useTranslations();
  const table = useServerTable();
  const { search } = table;
  const [statusParam, setStatusParam] = useUrlParam('status');
  const statusFilter: StatusFilter = STATUS_FILTERS.find((s) => s === statusParam) ?? 'pending';
  const [rejectTarget, setRejectTarget] = useState<FreeRequest | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useFreeRequests({
    status: statusFilter,
    search,
    page: table.page,
    perPage: table.pageSize,
  });
  const countsQuery = useFreeRequestCounts();
  const { approveFreeRequest, rejectFreeRequest } = useCustomerActions();

  const requests = useMemo(() => data?.items ?? [], [data?.items]);
  const busy = approveFreeRequest.isPending || rejectFreeRequest.isPending;
  const approveMutate = approveFreeRequest.mutate;

  const columns = useMemo<LegacyColumnDef<FreeRequest, unknown>[]>(
    () => [
      {
        id: 'serial',
        header: '#',
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'hide' },
        cell: ({ row, table: tbl }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(table.page - 1) * table.pageSize + tbl.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}
          </span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: t('admin.customers.freeRequests.colCustomer', 'Customer'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                {req.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/customers/${req.customerId}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline">
                  {req.customerName || `#${req.customerId}`}
                </Link>
                <div className="mt-0.5 font-mono text-xs font-normal text-muted-foreground">{req.customerMobile || '—'}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'resellerName',
        header: t('admin.customers.freeRequests.colRequestedBy', 'Requested by'),
        cell: ({ row }) =>
          row.original.resellerName ? (
            <Badge variant="outline" className="bg-muted/30 text-xs font-medium">
              {row.original.resellerName}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{t('admin.customers.freeRequests.direct', 'Direct')}</span>
          ),
      },
      {
        accessorKey: 'customerExpiry',
        header: t('admin.customers.freeRequests.colExpiry', 'Current Expiry'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtDate(row.original.customerExpiry)}</span>,
      },
      {
        accessorKey: 'requestedAt',
        header: t('admin.customers.freeRequests.colRequestDate', 'Request Date'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtDate(row.original.requestedAt)}</span>,
      },
      {
        accessorKey: 'status',
        header: t('admin.customers.freeRequests.colStatus', 'Status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} label={customerStatusLabel(t, row.original.status)} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.freeRequests.colAction', 'Action')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const req = row.original;
          if (req.status === 'pending') {
            return (
              <div className="flex items-center justify-end gap-1.5">
                <Button size="sm" disabled={busy} className="h-8 bg-emerald-700 text-xs text-white hover:bg-emerald-800" onClick={() => approveMutate(req.id)}>
                  <ThumbsUp className="mr-1 h-3 w-3" /> {t('admin.customers.freeRequests.approve', 'Approve')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  className="h-8 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => setRejectTarget(req)}
                >
                  <ThumbsDown className="mr-1 h-3 w-3" /> {t('admin.customers.freeRequests.reject', 'Reject')}
                </Button>
              </div>
            );
          }
          return req.status === 'approved' ? (
            <span className="flex items-center justify-end gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t('admin.customers.status.approved', 'Approved')}
            </span>
          ) : (
            <span className="flex items-center justify-end gap-1 text-xs font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" /> {t('admin.customers.status.rejected', 'Rejected')}
            </span>
          );
        },
      },
    ],
    [busy, approveMutate, table.page, table.pageSize, t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.freeRequests.loadFailed', 'Error loading free user requests')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.freeRequests.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const counts = countsQuery.data;
  const n = (v: number | undefined) => (counts ? v ?? 0 : '…');

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.customers.freeRequests.title', 'Free User Requests')}
        subtitle={t('admin.customers.freeRequests.subtitle', "POP requests to make a customer's connection free. Approving sets the customer's expiry far in the future; rejecting restores normal billing.")}
        breadcrumb={[
          { label: t('admin.customers.freeRequests.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.customers.freeRequests.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: t('admin.customers.freeRequests.title', 'Free User Requests') },
        ]}
      />

      {/* KPI strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{n(counts?.pending)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.customers.freeRequests.kpiPending', 'pending')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{n(counts?.approved)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.customers.freeRequests.kpiApproved', 'approved')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-destructive">{n(counts?.rejected)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.customers.freeRequests.kpiRejected', 'rejected')}</span>
        </p>
      </div>

      {/* Status filter */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: 'all', label: t('admin.customers.freeRequests.filterAll', 'All'), count: counts ? counts.pending + counts.approved + counts.rejected : undefined },
                { key: 'pending', label: t('admin.customers.status.pending', 'Pending'), count: counts?.pending },
                { key: 'approved', label: t('admin.customers.status.approved', 'Approved'), count: counts?.approved },
                { key: 'rejected', label: t('admin.customers.status.rejected', 'Rejected'), count: counts?.rejected },
              ] as { key: StatusFilter; label: string; count?: number }[]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setStatusParam(f.key === 'pending' ? '' : f.key);
                  table.resetPage();
                }}
                aria-pressed={statusFilter === f.key}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition duration-150',
                  statusFilter === f.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/30',
                )}
              >
                {f.label}
                <span className={cn('tabular-nums', statusFilter === f.key ? 'text-background/70' : 'text-muted-foreground')}>{n(f.count)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={requests}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.customers.freeRequests.searchPlaceholder', 'Search customer name or mobile...')}
        emptyTitle={t('admin.customers.freeRequests.emptyTitle', 'No requests match the current filter.')}
        server={table.server(data?.meta.total ?? 0)}
      />

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t('admin.customers.freeRequests.rejectTitle', 'Reject Free User Request?')}
        description={t('admin.customers.freeRequests.rejectHint', "The customer's billing status goes back to active (normal billing).")}
        confirmLabel={t('admin.customers.freeRequests.rejectConfirm', 'Reject Request')}
        destructive
        onConfirm={async () => {
          if (rejectTarget) {
            await rejectFreeRequest.mutateAsync(rejectTarget.id);
            setRejectTarget(null);
          }
        }}
      />
    </div>
  );
}
