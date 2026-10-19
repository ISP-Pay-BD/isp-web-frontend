'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TablePagination } from '@/components/shared/TablePagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useUrlParam } from '@/hooks/use-url-state';
import { useTranslations } from '@/i18n/locale-context';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import { statusLabel } from '@/features/employee/shared/lib/labels';
import type { JobStatus } from '@/features/employee/shared/types';
import { useEmployeeJobs, useUpdateJobStatus } from '../hooks/use-employee-jobs';

const JOB_STATUSES: JobStatus[] = ['opened', 'processing', 'closed'];
const FILTERS = ['all', ...JOB_STATUSES] as const;
type Filter = (typeof FILTERS)[number];
/** The API's job states, spelled as the shared status map and label list know them. */
const BADGE_STATUS: Record<JobStatus, string> = { opened: 'open', processing: 'in_progress', closed: 'closed' };

export function EmployeeJobsPage() {
  const t = useTranslations();
  const [filterParam, setFilterParam] = useUrlParam('status');
  const status: Filter = (FILTERS as readonly string[]).includes(filterParam) ? (filterParam as Filter) : 'all';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error, refetch } = useEmployeeJobs(page, pageSize, status);
  const update = useUpdateJobStatus();

  const jobLabel = (s: JobStatus) => statusLabel(t, BADGE_STATUS[s]);
  const statusItems = Object.fromEntries(JOB_STATUSES.map((s) => [s, jobLabel(s)])) as Record<JobStatus, string>;
  const filterItems: Record<Filter, string> = { all: t('employee.jobs.filterAll', 'All jobs'), ...statusItems };

  const priorityLabel = (p: string) => {
    switch (p.toLowerCase()) {
      case 'low':
        return t('employee.jobs.priority.low', 'Low');
      case 'medium':
        return t('employee.jobs.priority.medium', 'Medium');
      case 'high':
        return t('employee.jobs.priority.high', 'High');
      case 'urgent':
        return t('employee.jobs.priority.urgent', 'Urgent');
      default:
        return p;
    }
  };

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('employee.jobs.loadFailed', 'Failed to load jobs')}
        description={error?.message}
        actionLabel={t('employee.common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const { items: jobs, stats } = data;
  const total = data.meta.total;

  const changeStatus = (id: string, next: JobStatus) =>
    update.mutate(
      { id, status: next },
      {
        onSuccess: () =>
          toast.success(t('employee.jobs.marked', 'Ticket #{id} marked {status}', { id, status: jobLabel(next).toLowerCase() })),
      },
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employee.jobs.title', 'My work orders')}
        subtitle={t('employee.jobs.subtitle', 'Support tickets assigned to you')}
        breadcrumb={[{ label: t('employee.common.breadcrumb', 'Employee') }, { label: t('employee.jobs.breadcrumb', 'Jobs') }]}
        actions={
          <Select
            items={filterItems}
            value={status}
            onValueChange={(v) => {
              setFilterParam(v && v !== 'all' ? String(v) : '');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full text-sm data-[size=default]:h-11 sm:w-[170px]" aria-label={t('employee.jobs.filterLabel', 'Filter jobs')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((value) => (
                <SelectItem key={value} value={value} className="min-h-11">
                  {filterItems[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {t('employee.jobs.stats', '{total} jobs · {opened} open · {processing} in progress · {closed} closed', {
          total: stats.total,
          opened: stats.opened,
          processing: stats.processing,
          closed: stats.closed,
        })}
      </p>

      {jobs.length === 0 ? (
        <EmptyState
          title={status === 'all' ? t('employee.jobs.empty', 'No assigned jobs') : t('employee.jobs.emptyFiltered', 'No jobs with this status')}
          description={t('employee.jobs.emptyHint', 'Tickets your admin assigns to you will show here.')}
          actionLabel={t('employee.common.refresh', 'Refresh')}
          onAction={() => refetch()}
        />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((j) => (
              <Card key={j.id} className="border-border/60">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold break-words">
                      <span className="text-muted-foreground font-mono text-sm">#{j.id}</span>{' '}
                      {j.subject || t('employee.jobs.untitled', 'Untitled ticket')}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm break-words">
                      {[j.customerName, j.category].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={BADGE_STATUS[j.status]} label={jobLabel(j.status)} />
                    {j.priority ? (
                      <Badge
                        variant="secondary"
                        tone={j.priority === 'high' ? 'warning' : j.priority === 'urgent' ? 'danger' : undefined}
                      >
                        {priorityLabel(j.priority)}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">{formatDayTime(j.datetime) || j.datetime || '—'}</span>
                  <Select
                    items={statusItems}
                    value={j.status}
                    onValueChange={(v) => v && v !== j.status && changeStatus(j.id, v as JobStatus)}
                    disabled={update.isPending}
                  >
                    <SelectTrigger
                      className="w-full text-sm data-[size=default]:h-11 sm:w-[170px]"
                      aria-label={t('employee.jobs.updateStatus', 'Update status')}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="min-h-11">
                          {statusItems[s]}
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
