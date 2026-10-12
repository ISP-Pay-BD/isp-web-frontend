'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Search, Calendar } from 'lucide-react';
import { useCustomerActions, useFreeRequestCounts, useFreeRequests } from '../hooks/use-customers';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import type { FreeRequest } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TablePagination } from '@/components/shared/TablePagination';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const fmtDate = (v: string | null) =>
  v ? new Date(v.replace(' ', 'T')).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function FreeRequestsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [pageSize, setPageSize] = useState(20);
  const pageKey = `${statusFilter}|${debouncedSearch}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const page = pageState.key === pageKey ? pageState.page : 1;
  const [rejectTarget, setRejectTarget] = useState<FreeRequest | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useFreeRequests({
    status: statusFilter,
    search: debouncedSearch,
    page,
    perPage: pageSize,
  });
  const countsQuery = useFreeRequestCounts();
  const { approveFreeRequest, rejectFreeRequest } = useCustomerActions();

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading free user requests"
        description={errorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const requests = data?.items ?? [];
  const counts = countsQuery.data;
  const busy = approveFreeRequest.isPending || rejectFreeRequest.isPending;
  const n = (v: number | undefined) => (counts ? v ?? 0 : '…');

  const actionCell = (req: FreeRequest, compact = false) =>
    req.status === 'pending' ? (
      <div className={cn('flex items-center gap-1.5', compact ? 'pt-1' : 'justify-end')}>
        <Button
          size="sm"
          disabled={busy}
          className={cn('bg-emerald-500 hover:bg-emerald-600 text-white', compact ? 'flex-1 h-8 text-xs' : 'h-7 text-[11px]')}
          onClick={() => approveFreeRequest.mutate(req.id)}
        >
          <ThumbsUp className="mr-1 h-3 w-3" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          className={cn('text-destructive border-destructive/30 hover:bg-destructive/10', compact ? 'h-8 text-xs' : 'h-7 text-[11px]')}
          onClick={() => setRejectTarget(req)}
        >
          <ThumbsDown className="mr-1 h-3 w-3" /> Reject
        </Button>
      </div>
    ) : req.status === 'approved' ? (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium justify-end">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs text-red-500 font-medium justify-end">
        <XCircle className="h-3.5 w-3.5" /> Rejected
      </span>
    );

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Free User Requests"
        subtitle="POP requests to make a customer's connection free. Approving sets the customer's expiry far in the future; rejecting restores normal billing."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Free User Requests' },
        ]}
      />

      {/* KPI strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{n(counts?.pending)}</span>{' '}
          <span className="text-muted-foreground">pending</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{n(counts?.approved)}</span>{' '}
          <span className="text-muted-foreground">approved</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-destructive">{n(counts?.rejected)}</span>{' '}
          <span className="text-muted-foreground">rejected</span>
        </p>
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search customer name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {(
              [
                { key: 'all', label: 'All', count: counts ? counts.pending + counts.approved + counts.rejected : undefined },
                { key: 'pending', label: 'Pending', count: counts?.pending },
                { key: 'approved', label: 'Approved', count: counts?.approved },
                { key: 'rejected', label: 'Rejected', count: counts?.rejected },
              ] as { key: StatusFilter; label: string; count?: number }[]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150',
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

      {/* Desktop Table */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden hidden sm:block', isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-medium tracking-wide">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Requested by</th>
                <th className="py-3.5 px-4 hidden xl:table-cell">Current Expiry</th>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No requests match the current filter.
                  </td>
                </tr>
              ) : (
                requests.map((req, i) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">{(page - 1) * pageSize + i + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs border border-primary/20 shrink-0">
                          {req.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/customers/${req.customerId}`} className="font-semibold text-foreground text-sm hover:text-primary hover:underline">
                            {req.customerName || `#${req.customerId}`}
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{req.customerMobile || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      {req.resellerName ? (
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">{req.resellerName}</Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">Direct</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden xl:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">{fmtDate(req.customerExpiry)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-muted-foreground">{fmtDate(req.requestedAt)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">{actionCell(req)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(p) => setPageState({ key: pageKey, page: p })}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {requests.length === 0 ? (
          <Card className="border-border/70 shadow-2xs bg-card p-8 text-center text-muted-foreground text-sm">
            No requests match the current filter.
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="border-border/70 bg-card shadow-2xs p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{req.customerName || `#${req.customerId}`}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{req.customerMobile || '—'}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {fmtDate(req.requestedAt)}
                {req.resellerName ? ` · ${req.resellerName}` : ''}
              </div>
              {req.status === 'pending' && actionCell(req, true)}
            </Card>
          ))
        )}
      </div>

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject Free User Request?"
        description="The customer's billing status goes back to active (normal billing)."
        confirmLabel="Reject Request"
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
