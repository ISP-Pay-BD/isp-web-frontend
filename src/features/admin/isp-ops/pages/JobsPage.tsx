'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Mail,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Search,
  Sliders,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import {
  useAssignWorkOrder,
  useSetWorkOrderStatus,
  useWorkOrder,
  useWorkOrders,
  type WorkOrder,
  type WorkOrderStatus,
} from '../hooks/use-work-orders';
import { useNetOpsOptions } from '../hooks/use-network-ops';
import { NetOpsPager, OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const PAGE_SIZE = 20;

const priorityClass: Record<string, string> = {
  high: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  low: 'bg-muted/60 text-muted-foreground border-border/80',
};

function StatusPill({ status }: { status: WorkOrderStatus }) {
  if (status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3" /> Done
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <Truck className="h-3 w-3" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
      <Clock className="h-3 w-3" /> Open
    </span>
  );
}

/** Work orders on the staff support-ticket desk (status + assignment). */
export function JobsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useWorkOrders({ page, pageSize: PAGE_SIZE, search, status: statusFilter });
  const options = useNetOpsOptions();
  const detail = useWorkOrder(selectedId);
  const setStatus = useSetWorkOrderStatus();
  const assign = useAssignWorkOrder();

  const jobs = data?.items ?? [];
  const stats = data?.stats;
  const employeeNames = useMemo(() => new Map((options.data?.employees ?? []).map((e) => [e.value, e.label])), [options.data?.employees]);
  const assigneeLabel = (job: WorkOrder) =>
    job.assigneeIds.length ? job.assigneeIds.map((id) => employeeNames.get(id) ?? `Staff #${id}`).join(', ') : 'Unassigned';

  const changeStatus = (id: string, status: WorkOrderStatus) => setStatus.mutate({ id, status });

  if (isLoading && !data) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load work orders" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const selected = detail.data ?? jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Work Orders & Field Service Operations"
        subtitle="Support and field work orders: progress, completion and technician assignment."
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Field Operations' }, { label: 'Work Orders' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Link
              href="/admin/support"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <ClipboardList className="h-3.5 w-3.5" /> Open Support Desk
            </Link>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stats?.opened ?? 0, hint: 'Awaiting action', icon: ClipboardList, tone: 'bg-primary/10 text-primary', text: 'text-foreground' },
          { label: 'In Progress', value: stats?.processing ?? 0, hint: 'Being worked on', icon: Truck, tone: 'bg-amber-500/10 text-amber-500', text: 'text-amber-500' },
          { label: 'Unread', value: stats?.unread ?? 0, hint: 'Not opened by staff yet', icon: Mail, tone: 'bg-rose-500/10 text-rose-500', text: 'text-rose-600 dark:text-rose-400' },
          { label: 'Completed', value: stats?.closed ?? 0, hint: `of ${stats?.total ?? 0} total`, icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
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
            <div className="mt-2 text-[11px] text-muted-foreground">{k.hint}</div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by subject or order #..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(v) => {
                setStatusFilter(!v || v === 'all' ? '' : (v as WorkOrderStatus));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                <Sliders className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="opened">Open</SelectItem>
                <SelectItem value="processing">In Progress</SelectItem>
                <SelectItem value="closed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Order # & Title</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {search || statusFilter ? 'No work orders match these filters' : 'No work orders yet'}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} onClick={() => setSelectedId(job.id)} className={cn('hover:bg-muted/30 cursor-pointer transition-colors group', !job.viewed && 'bg-sky-500/5')}>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{job.subject || '—'}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 font-mono">
                          <span className="text-primary font-semibold">#{job.id}</span>
                          <span>·</span>
                          <span>Created: {fmtDateTime(job.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{job.customerName || '—'}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="outline" className="capitalize text-[10px] font-semibold px-2 py-0.5">
                        {job.category || '—'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="outline" className={cn('capitalize text-[10px] font-semibold px-2 py-0.5', priorityClass[job.priority] ?? priorityClass.low)}>
                        {job.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-foreground">{assigneeLabel(job)}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusPill status={job.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(job.id)} className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1">
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 text-xs">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            {job.status !== 'processing' && (
                              <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'processing')}>
                                <Truck className="mr-2 h-3.5 w-3.5 text-amber-500" /> Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {job.status !== 'closed' && (
                              <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'closed')}>
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" /> Mark Completed
                              </DropdownMenuItem>
                            )}
                            {job.status !== 'opened' && (
                              <DropdownMenuItem disabled={setStatus.isPending} onClick={() => changeStatus(job.id, 'opened')}>
                                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reopen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <NetOpsPager page={page} totalPages={data?.meta.totalPages ?? 1} total={data?.meta.total ?? 0} onPageChange={setPage} label="work orders" />
      </Card>

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
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary">
                    {selected.category || '—'}
                  </Badge>
                  <StatusPill status={selected.status} />
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selected.subject || '—'}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  Order #{selected.id} · Priority: {selected.priority.toUpperCase()} · Created {fmtDateTime(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <Card className="p-4 border-border/80 bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Customer</span>
                <p className="text-sm font-bold text-foreground">{selected.customerName || '—'}</p>
                {selected.remarks && <p className="text-xs text-muted-foreground">Remarks: {selected.remarks}</p>}
              </Card>

              {detail.isLoading ? (
                <p className="text-xs text-muted-foreground">Loading details…</p>
              ) : detail.isError ? (
                <p className="text-xs text-destructive">{errorMessage(detail.error)}</p>
              ) : detail.data ? (
                <>
                  <Card className="p-4 border-border/80 bg-card space-y-3">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Assigned Staff</span>
                    <p className="text-sm font-semibold text-foreground">{assigneeLabel(detail.data)}</p>
                    {detail.data.employees.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <OptionSelect
                          value={assignee}
                          onChange={setAssignee}
                          options={detail.data.employees.map((e) => ({ value: e.id, label: e.name }))}
                          placeholder="Select employee"
                          className="h-9 text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          disabled={!assignee || assign.isPending}
                          onClick={() => assign.mutate({ ids: [selected.id], employeeIds: [assignee] }, { onSuccess: () => setAssignee('') })}
                          className="h-9 text-xs gap-1.5"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Assign
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No employees available to assign.</p>
                    )}
                  </Card>

                  {detail.data.messages.length > 0 && (
                    <Card className="p-4 border-border/80 bg-card space-y-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Latest messages</span>
                      {detail.data.messages.slice(-5).map((m, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold text-foreground">{m.senderName}</span>
                          <span className="text-muted-foreground font-mono text-[10px]"> · {m.datetime}</span>
                          <p className="text-foreground/90 leading-relaxed">{m.msg}</p>
                        </div>
                      ))}
                      <Link href={`/admin/support/${selected.id}`} className="text-xs font-medium text-primary hover:underline">
                        Open full conversation
                      </Link>
                    </Card>
                  )}
                </>
              ) : null}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  disabled={selected.status === 'processing' || setStatus.isPending}
                  onClick={() => changeStatus(selected.id, 'processing')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" /> Start (In Progress)
                </Button>
                <Button
                  disabled={selected.status === 'closed' || setStatus.isPending}
                  onClick={() => changeStatus(selected.id, 'closed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
