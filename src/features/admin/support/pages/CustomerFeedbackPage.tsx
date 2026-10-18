'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { MessageSquare, Smile, Frown, Star } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/features/shared/data-table';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useCustomerFeedbackList, type CustomerFeedbackRow } from '../hooks/use-customer-feedback';

const RATING_FILTER = { all: 'All ratings', '5': '5 stars', '4': '4 stars', '3': '3 stars', '2': '2 stars', '1': '1 star' };

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('h-3.5 w-3.5', n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40', className)}
        />
      ))}
    </span>
  );
}

/** Staff CSAT desk: GET /v1/reseller/customer-feedback (server-paginated, tenant-scoped). */
export function CustomerFeedbackPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('all');
  const feedback = useCustomerFeedbackList({ page, pageSize, search, rating });

  const columns = useMemo<LegacyColumnDef<CustomerFeedbackRow, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="text-foreground block text-xs font-medium">{row.original.customerName || '—'}</span>
            {row.original.customerMobile && (
              <span className="text-muted-foreground font-mono text-[10px]">{row.original.customerMobile}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        size: 110,
        cell: ({ row }) => <Stars value={row.original.rating} />,
      },
      {
        accessorKey: 'categoryLabel',
        header: 'Category',
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px]">
            {row.original.categoryLabel || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 320,
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-2 max-w-md text-xs">{row.original.comment || '—'}</span>
        ),
      },
      {
        accessorKey: 'ticketId',
        header: 'Ticket',
        size: 90,
        cell: ({ row }) =>
          row.original.ticketId ? (
            <Link href={`/admin/support/${row.original.ticketId}`} className="text-primary font-mono text-xs hover:underline">
              #{row.original.ticketId}
            </Link>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted',
        size: 130,
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs">{row.original.createdAt ? formatDate(row.original.createdAt) : '—'}</span>
        ),
      },
    ],
    [],
  );

  if (feedback.isLoading) return <PageSkeleton variant="table" />;
  if (feedback.isError && !feedback.data) {
    return (
      <EmptyState
        title="Failed to load customer feedback"
        description={errorMessage(feedback.error, 'Could not fetch customer feedback.')}
        actionLabel="Retry"
        onAction={() => feedback.refetch()}
      />
    );
  }

  const summary = feedback.data?.summary;
  const total = summary?.total ?? 0;
  const byRating = summary?.byRating ?? [0, 0, 0, 0, 0];
  const satisfied = byRating[3] + byRating[4];
  const unhappy = byRating[0] + byRating[1];
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Feedback"
        subtitle="Ratings and comments your customers sent from their portal"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Customer Feedback' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Average rating"
          value={summary?.averageRating === null || summary?.averageRating === undefined ? '—' : `${summary.averageRating.toFixed(2)} / 5`}
          icon={Star}
        />
        <StatCard title="Responses" value={total} icon={MessageSquare} />
        <StatCard title="Satisfied (4–5★)" value={total > 0 ? `${pct(satisfied)}%` : '—'} description={`${satisfied} responses`} icon={Smile} />
        <StatCard title="Unhappy (1–2★)" value={unhappy} description={total > 0 ? `${pct(unhappy)}% of responses` : undefined} icon={Frown} />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rating distribution</CardTitle>
          <CardDescription>All feedback from your customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = byRating[star - 1];
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground w-10 font-mono">{star}★</span>
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div className="h-full rounded-full bg-amber-400 transition-[width] duration-300 ease-out" style={{ width: `${pct(count)}%` }} />
                </div>
                <span className="text-muted-foreground w-10 text-right font-mono">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="text-primary h-4 w-4" />
                Feedback
              </CardTitle>
              <CardDescription>Newest first</CardDescription>
            </div>
            <Select
              value={rating}
              items={RATING_FILTER}
              onValueChange={(v) => {
                if (v) {
                  setRating(String(v));
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RATING_FILTER).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={feedback.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="customerName"
            searchPlaceholder="Search by customer, phone or comment..."
            emptyTitle="No feedback yet"
            emptyDescription={rating !== 'all' || search ? 'Try adjusting your search or rating filter.' : 'Feedback your customers send from their portal appears here.'}
            server={{
              page,
              pageSize,
              total: feedback.data?.meta.total ?? 0,
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
        </CardContent>
      </Card>
    </div>
  );
}
