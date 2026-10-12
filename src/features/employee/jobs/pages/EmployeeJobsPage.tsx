'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { cn } from '@/lib/utils';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import type { JobStatus } from '@/features/employee/shared/types';
import { useEmployeeJobs, useUpdateJobStatus } from '../hooks/use-employee-jobs';

const STATUS_LABEL: Record<JobStatus, string> = { opened: 'Open', processing: 'In progress', closed: 'Closed' };
const FILTER_ITEMS = { all: 'All jobs', opened: 'Open', processing: 'In progress', closed: 'Closed' };

export function EmployeeJobsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('all');
  const { data, isLoading, isError, error, refetch } = useEmployeeJobs(page, pageSize, status);
  const update = useUpdateJobStatus();

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load jobs" description={error?.message} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const { items: jobs, stats } = data;
  const total = data.meta.total;

  const changeStatus = (id: string, next: JobStatus) =>
    update.mutate({ id, status: next }, { onSuccess: () => toast.success(`Ticket #${id} marked ${STATUS_LABEL[next].toLowerCase()}`) });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My work orders"
        subtitle="Support tickets assigned to you"
        breadcrumb={[{ label: 'Employee' }, { label: 'Jobs' }]}
        actions={
          <Select
            items={FILTER_ITEMS}
            value={status}
            onValueChange={(v) => {
              setStatus(v ? String(v) : 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {stats.total} jobs · {stats.opened} open · {stats.processing} in progress · {stats.closed} closed
      </p>

      {jobs.length === 0 ? (
        <EmptyState
          title={status === 'all' ? 'No assigned jobs' : 'No jobs with this status'}
          description="Tickets your admin assigns to you will show here."
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((j) => (
              <Card key={j.id} className="border-border/60">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      <span className="text-muted-foreground font-mono text-sm">#{j.id}</span> {j.subject || 'Untitled ticket'}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {[j.customerName, j.category].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline">{STATUS_LABEL[j.status]}</Badge>
                    {j.priority ? (
                      <Badge
                        variant="secondary"
                        className={cn('capitalize', j.priority === 'high' && 'bg-amber-500/15 text-amber-800 dark:text-amber-300')}
                      >
                        {j.priority}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{formatDayTime(j.datetime) || j.datetime || '—'}</span>
                  <Select
                    items={STATUS_LABEL}
                    value={j.status}
                    onValueChange={(v) => v && v !== j.status && changeStatus(j.id, v as JobStatus)}
                    disabled={update.isPending}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Update status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABEL) as JobStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination
            currentPage={data.meta.page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
