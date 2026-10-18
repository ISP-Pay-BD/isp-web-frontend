'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Mail,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Sliders,
  Truck,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useUrlParam } from '@/hooks/use-url-state';
import type { Tone } from '@/components/shared/status-tones';
import { useLocale, useTranslations } from '@/i18n/locale-context';
import {
  useAssignWorkOrder,
  useSetWorkOrderStatus,
  useWorkOrder,
  useWorkOrders,
  type WorkOrder,
  type WorkOrderStatus,
} from '../hooks/use-work-orders';
import { useNetOpsOptions } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = ['opened', 'processing', 'closed'];

const priorityTone: Record<string, Tone> = { high: 'warning', medium: 'info', low: 'neutral' };

const STATUS_TONE: Record<WorkOrderStatus, Tone> = {
  opened: 'info',
  processing: 'warning',
  closed: 'success',
};

type Translate = ReturnType<typeof useTranslations>;

function priorityLabel(t: Translate, priority: string): string {
  if (priority === 'high') return t('admin.ops.jobs.priorityHigh', 'High');
  if (priority === 'medium') return t('admin.ops.jobs.priorityMedium', 'Medium');
  if (priority === 'low') return t('admin.ops.jobs.priorityLow', 'Low');
  return priority;
}

function StatusPill({ status }: { status: WorkOrderStatus }) {
  const t = useTranslations();
  const label =
    status === 'opened'
      ? t('status.open', 'Open')
      : status === 'processing'
        ? t('status.in_progress', 'In Progress')
        : t('status.done', 'Done');
  return <StatusBadge status={status} tone={STATUS_TONE[status]} label={label} />;
}

/** Work orders on the staff support-ticket desk (status + assignment). */
export function JobsPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const { search } = table;
  const [statusParam, setStatusParam] = useUrlParam('status');
  const statusFilter: WorkOrderStatus | '' = WORK_ORDER_STATUSES.find((s) => s === statusParam) ?? '';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useWorkOrders({ page: table.page, pageSize: table.pageSize, search, status: statusFilter });
  const options = useNetOpsOptions();
  const detail = useWorkOrder(selectedId);
  const setStatus = useSetWorkOrderStatus();
  const assign = useAssignWorkOrder();

  const jobs = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = data?.stats;
  const employeeNames = useMemo(() => new Map((options.data?.employees ?? []).map((e) => [e.value, e.label])), [options.data?.employees]);
  const assigneeLabel = useCallback(
    (job: WorkOrder) => (job.assigneeIds.length ? job.assigneeIds.map((id) => employeeNames.get(id) ?? t('admin.ops.jobs.staffN', 'Staff #{id}', { id })).join(', ') : t('admin.ops.jobs.unassigned', 'Unassigned')),
    [employeeNames, t],
  );

  const setStatusMutate = setStatus.mutate;
  const changeStatus = useCallback((id: string, status: WorkOrderStatus) => setStatusMutate({ id, status }), [setStatusMutate]);

  const columns = useMemo<LegacyColumnDef<WorkOrder, unknown>[]>(
    () => [
      {
        accessorKey: 'subject',
        header: t('admin.ops.jobs.colOrder', 'Order # & Title'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                {!job.viewed && (
                  <>
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    <span className="sr-only">{t('admin.ops.jobs.unread', 'Unread')}</span>
                  </>
                )}
                {job.subject || '—'}
              </span>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-xs font-normal text-muted-foreground">
                <span className="font-semibold text-primary">#{job.id}</span>
                <span aria-hidden>·</span>
                <span>{t('admin.ops.jobs.created', 'Created: {date}', { date: fmtDateTime(job.createdAt) })}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'customerName',
        header: t('admin.ops.jobs.colCustomer', 'Customer'),
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.customerName || '—'}</span>,
      },
      {
        accessorKey: 'category',
        header: t('admin.ops.jobs.colCategory', 'Category'),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-semibold capitalize">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'priority',
        header: t('admin.ops.jobs.colPriority', 'Priority'),
        cell: ({ row }) => (
          <Badge variant="outline" tone={priorityTone[row.original.priority] ?? 'neutral'} className="font-semibold capitalize">
            {priorityLabel(t, row.original.priority)}
          </Badge>
        ),
      },
      {
        id: 'assignee',
        header: t('admin.ops.jobs.colAssigned', 'Assigned To'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-foreground">{assigneeLabel(row.original)}</span>,
      },
      {
        accessorKey: 'status',
        header: t('admin.customerPayments.list.colStatus', 'Status'),
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(job.id)} className="h-8 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10">
                <Eye className="h-3.5 w-3.5" /> {t('admin.ops.jobs.details', 'Details')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t('admin.ops.jobs.changeStatus', 'Change status')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none"
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 text-xs">
                  <DropdownMenuLabel>{t('admin.customerPayments.list.colStatus', 'Status')}</DropdownMenuLabel>
                  {job.status !== 'processing' && (
                    <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'processing')}>
                      <Truck className="mr-2 h-3.5 w-3.5 text-amber-500" /> {t('admin.ops.jobs.markInProgress', 'Mark In Progress')}
                    </DropdownMenuItem>
                  )}
                  {job.status !== 'closed' && (
                    <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'closed')}>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" /> {t('admin.ops.jobs.markCompleted', 'Mark Completed')}
                    </DropdownMenuItem>
                  )}
                  {job.status !== 'opened' && (
                    <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'opened')}>
                      <RotateCcw className="mr-2 h-3.5 w-3.5" /> {t('admin.ops.jobs.reopen', 'Reopen')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [assigneeLabel, changeStatus, setStatus.isPending, t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.jobs.loadFailed', 'Failed to load work orders')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const selected = detail.data ?? jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('admin.ops.jobs.title', 'Work Orders & Field Service Operations')}
        subtitle={t('admin.ops.jobs.subtitle', 'Support and field work orders: progress, completion and technician assignment.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.field_operations', 'Field Operations') },
          { label: t('common.crumb.work_orders', 'Work Orders') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> {t('admin.ops.jobs.refresh', 'Refresh')}
            </Button>
            <Link
              href="/admin/support"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <ClipboardList className="h-3.5 w-3.5" /> {t('admin.ops.jobs.openDesk', 'Open Support Desk')}
            </Link>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('status.open', 'Open'), value: stats?.opened ?? 0, hint: t('admin.ops.jobs.hintOpen', 'Awaiting action'), icon: ClipboardList, tone: 'bg-primary/10 text-primary', text: 'text-foreground' },
          { label: t('status.in_progress', 'In Progress'), value: stats?.processing ?? 0, hint: t('admin.ops.jobs.hintProgress', 'Being worked on'), icon: Truck, tone: 'bg-amber-500/10 text-amber-500', text: 'text-amber-500' },
          { label: t('admin.ops.jobs.unread', 'Unread'), value: stats?.unread ?? 0, hint: t('admin.ops.jobs.hintUnread', 'Not opened by staff yet'), icon: Mail, tone: 'bg-rose-500/10 text-rose-500', text: 'text-rose-600 dark:text-rose-400' },
          { label: t('status.completed', 'Completed'), value: stats?.closed ?? 0, hint: t('admin.ops.jobs.hintCompleted', 'of {n} total', { n: stats?.total ?? 0 }), icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
        ].map((k) => (
          <Card key={k.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
              <div className={cn('p-2 rounded-lg', k.tone)}>
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={cn('text-2xl font-bold tracking-tight tabular-nums', k.text)}>{k.value}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{k.hint}</div>
          </Card>
        ))}
      </div>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={jobs}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.ops.jobs.searchPlaceholder', 'Search by subject or order #...')}
        emptyTitle={
          search || statusFilter
            ? t('admin.ops.jobs.emptyFiltered', 'No work orders match these filters')
            : t('admin.ops.jobs.emptyNone', 'No work orders yet')
        }
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) => {
              setStatusParam(!v || v === 'all' ? '' : v);
              table.setPage(1);
            }}
            items={{
              all: t('admin.customerPayments.list.allStatuses', 'All statuses'),
              opened: t('status.open', 'Open'),
              processing: t('status.in_progress', 'In Progress'),
              closed: t('status.completed', 'Completed'),
            }}
          >
            <SelectTrigger className="h-9 min-w-[160px] border-border/60 bg-background text-xs" aria-label={t('admin.ops.jobs.filterStatus', 'Filter by status')}>
              <Sliders className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder={t('admin.customerPayments.list.allStatuses', 'All statuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.customerPayments.list.allStatuses', 'All statuses')}</SelectItem>
              <SelectItem value="opened">{t('status.open', 'Open')}</SelectItem>
              <SelectItem value="processing">{t('status.in_progress', 'In Progress')}</SelectItem>
              <SelectItem value="closed">{t('status.completed', 'Completed')}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Detail drawer */}
      <Sheet
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setAssignee('');
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary">
                    {selected.category || '—'}
                  </Badge>
                  <StatusPill status={selected.status} />
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selected.subject || '—'}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  {t('admin.ops.jobs.orderLine', 'Order #{id} · Priority: {priority} · Created {date}', {
                    id: selected.id,
                    priority: priorityLabel(t, selected.priority).toUpperCase(),
                    date: fmtDateTime(selected.createdAt),
                  })}
                </SheetDescription>
              </SheetHeader>

              <Card className="p-4 border-border/80 bg-muted/20 space-y-1">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.jobs.colCustomer', 'Customer')}</span>
                <p className="text-sm font-bold text-foreground">{selected.customerName || '—'}</p>
                {selected.remarks && (
                  <p className="text-xs text-muted-foreground">{t('admin.ops.jobs.remarks', 'Remarks: {text}', { text: selected.remarks })}</p>
                )}
              </Card>

              {detail.isLoading ? (
                <p className="text-xs text-muted-foreground">{t('admin.ops.jobs.loadingDetails', 'Loading details…')}</p>
              ) : detail.isError ? (
                <p className="text-xs text-destructive">{errorMessage(detail.error)}</p>
              ) : detail.data ? (
                <>
                  <Card className="p-4 border-border/80 bg-card space-y-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.jobs.assignedStaff', 'Assigned Staff')}</span>
                    <p className="text-sm font-semibold text-foreground">{assigneeLabel(detail.data)}</p>
                    {detail.data.employees.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <OptionSelect
                          value={assignee}
                          onChange={setAssignee}
                          options={detail.data.employees.map((e) => ({ value: e.id, label: e.name }))}
                          placeholder={t('admin.ops.jobs.selectEmployee', 'Select employee')}
                          className="h-9 text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          disabled={!assignee || assign.isPending}
                          onClick={() => assign.mutate({ ids: [selected.id], employeeIds: [assignee] }, { onSuccess: () => setAssignee('') })}
                          className="h-9 text-xs gap-1.5"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> {t('admin.ops.jobs.assign', 'Assign')}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('admin.ops.jobs.noEmployees', 'No employees available to assign.')}</p>
                    )}
                  </Card>

                  {detail.data.messages.length > 0 && (
                    <Card className="p-4 border-border/80 bg-card space-y-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('admin.ops.jobs.latestMessages', 'Latest messages')}</span>
                      {detail.data.messages.slice(-5).map((m, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold text-foreground">{m.senderName}</span>
                          <span className="text-muted-foreground font-mono text-xs"> · {m.datetime}</span>
                          <p className="text-foreground/90 leading-relaxed">{m.msg}</p>
                        </div>
                      ))}
                      <Link href={`/admin/support/${selected.id}`} className="text-xs font-medium text-primary hover:underline">
                        {t('admin.ops.jobs.openConversation', 'Open full conversation')}
                      </Link>
                    </Card>
                  )}
                </>
              ) : null}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  disabled={selected.status === 'processing' || setStatus.isPending}
                  onClick={() => changeStatus(selected.id, 'processing')}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" /> {t('admin.ops.jobs.start', 'Start (In Progress)')}
                </Button>
                <Button
                  disabled={selected.status === 'closed' || setStatus.isPending}
                  onClick={() => changeStatus(selected.id, 'closed')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('admin.ops.jobs.markCompleted', 'Mark Completed')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
