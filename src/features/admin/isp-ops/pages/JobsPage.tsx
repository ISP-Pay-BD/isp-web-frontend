'use client';

import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Wrench,
  Truck,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Layers,
  RefreshCw,
  X,
  Sliders,
  Check,
  ArrowRight,
  MoreVertical,
  Eye,
  SlidersHorizontal,
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
import type { WorkOrder } from '@/data/admin/isp-ops.data';

type JobTypeFilter = 'all' | 'install' | 'repair' | 'shift' | 'collect' | 'upgrade' | 'maintenance';
type StatusFilter = 'all' | 'open' | 'in_progress' | 'done';

export function JobsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<JobTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedJob, setSelectedJob] = useState<WorkOrder | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // New order form state
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newType, setNewType] = useState<WorkOrder['type']>('install');
  const [newPriority, setNewPriority] = useState<WorkOrder['priority']>('high');
  const [newArea, setNewArea] = useState('');
  const [newAssignee, setNewAssignee] = useState('Rafiq Field (Lead Technician)');

  const rawJobs = useMemo(() => data?.workOrders ?? [], [data?.workOrders]);

  // Aggregate Metrics
  const openCount = useMemo(() => rawJobs.filter((j) => j.status === 'open').length, [rawJobs]);
  const inProgressCount = useMemo(() => rawJobs.filter((j) => j.status === 'in_progress').length, [rawJobs]);
  const criticalCount = useMemo(() => rawJobs.filter((j) => j.priority === 'critical').length, [rawJobs]);
  const doneCount = useMemo(() => rawJobs.filter((j) => j.status === 'done').length, [rawJobs]);

  const filteredJobs = useMemo(() => {
    return rawJobs.filter((job) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          job.title.toLowerCase().includes(q) ||
          job.customerName.toLowerCase().includes(q) ||
          (job.orderNo && job.orderNo.toLowerCase().includes(q)) ||
          (job.area && job.area.toLowerCase().includes(q)) ||
          job.assignee.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (typeFilter !== 'all' && job.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [rawJobs, search, typeFilter, statusFilter]);

  const handleStatusChange = (jobId: string, newStatus: WorkOrder['status']) => {
    toast.success(`Work order updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, status: newStatus });
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCustomer.trim()) {
      toast.error('Please enter job title and customer name');
      return;
    }
    toast.success(`Work order "${newTitle}" dispatched to ${newAssignee}!`);
    setIsNewOrderOpen(false);
    setNewTitle('');
    setNewCustomer('');
    setNewArea('');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load work orders"
        description="Could not query field operations service queue."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Work Orders & Field Service Operations"
        subtitle="Manage fiber optical installations, LOS repairs, subscriber physical line shifts, and field technician dispatches."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Field Operations' },
          { label: 'Work Orders' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Field dispatch queue synchronized');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Queue
            </Button>

            <Button
              size="sm"
              onClick={() => setIsNewOrderOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Dispatch Work Order
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open / Unassigned */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Dispatch
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {openCount}
            </span>
            <span className="text-xs text-muted-foreground">open orders</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Awaiting field team action</span>
          </div>
        </Card>

        {/* In Progress / Active Field Crew */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active on Field
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-xs text-muted-foreground">crews working</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Splicing & physical drop repair</span>
          </div>
        </Card>

        {/* Critical Emergency Outages */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Critical Fiber Cuts
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {criticalCount}
            </span>
            <span className="text-xs text-muted-foreground">urgent jobs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-rose-500 font-medium">SLA: &lt; 2 Hours Target</span>
          </div>
        </Card>

        {/* Completed Jobs */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed Today
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {doneCount}
            </span>
            <span className="text-xs text-muted-foreground">jobs closed</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Avg completion: 74 mins</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter Card */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search orders by order #, title, customer, area, technician..."
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

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v as StatusFilter) || 'all')}>
                <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                  <Sliders className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open (Unassigned)</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
              Job Type:
            </span>

            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                typeFilter === 'all' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              All Orders ({rawJobs.length})
            </Button>

            <Button
              variant={typeFilter === 'install' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('install')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                typeFilter === 'install' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              🔌 FTTH Installation
            </Button>

            <Button
              variant={typeFilter === 'repair' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('repair')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                typeFilter === 'repair'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
              )}
            >
              <Wrench className="h-3 w-3" /> LOS Repair
            </Button>

            <Button
              variant={typeFilter === 'shift' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('shift')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                typeFilter === 'shift' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              🚚 Address Shift
            </Button>

            <Button
              variant={typeFilter === 'collect' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('collect')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                typeFilter === 'collect' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              💰 Cash Collection
            </Button>

            <Button
              variant={typeFilter === 'upgrade' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('upgrade')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                typeFilter === 'upgrade' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              ⚡ Hardware Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Order # & Title</th>
                <th className="py-3 px-4">Subscriber & Location</th>
                <th className="py-3 px-3">Job Type</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4">Assigned Technician</th>
                <th className="py-3 px-3">Due Date / Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredJobs.map((job) => {
                const isCritical = job.priority === 'critical';
                const isDone = job.status === 'done';
                const isInProgress = job.status === 'in_progress';

                return (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={cn(
                      'hover:bg-muted/30 cursor-pointer transition-colors group',
                      isCritical && !isDone && 'bg-rose-500/5'
                    )}
                  >
                    {/* Order # & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {job.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 font-mono">
                          <span className="text-primary font-semibold">{job.orderNo ?? 'WO-2026-0890'}</span>
                          <span>·</span>
                          <span>Created: {job.createdAt ?? '2026-09-07'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Customer & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">
                          {job.customerName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                          <span className="truncate max-w-[180px]">{job.area ?? 'Dhaka'}</span>
                        </div>
                        {job.phone && (
                          <span className="text-[10px] text-muted-foreground/70 font-mono">
                            {job.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Job Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold px-2 py-0.5',
                          job.type === 'install' && 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
                          job.type === 'repair' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                          job.type === 'shift' && 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                          job.type === 'collect' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                          job.type === 'upgrade' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                          job.type === 'maintenance' && 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        )}
                      >
                        {job.type}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold px-2 py-0.5',
                          job.priority === 'critical' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse',
                          job.priority === 'high' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                          job.priority === 'medium' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          (!job.priority || job.priority === 'low') && 'bg-muted/60 text-muted-foreground border-border/80'
                        )}
                      >
                        {job.priority ?? 'medium'}
                      </Badge>
                    </td>

                    {/* Assigned Technician */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">
                          {job.assignee}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{job.team ?? 'Field Unit'}</span>
                          {job.assigneePhone && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{job.assigneePhone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="font-medium text-foreground">{job.dueAt}</span>
                        {job.estimatedMinutes && (
                          <span className="text-[10px] text-muted-foreground">
                            Est: ~{job.estimatedMinutes} mins
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Truck className="h-3 w-3" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                          <Clock className="h-3 w-3" /> Open
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                          className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 text-xs">
                            <DropdownMenuLabel>Field Dispatch Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'in_progress')}>
                              <Truck className="mr-2 h-3.5 w-3.5 text-amber-500" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'done')}>
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info(`Calling technician ${job.assigneePhone ?? ''}`)}>
                              <Phone className="mr-2 h-3.5 w-3.5 text-sky-500" />
                              Call Assigned Technician
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Work Order Detail Drawer */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedJob && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                  >
                    {selectedJob.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Due: {selectedJob.dueAt}
                  </span>
                </div>

                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedJob.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  Order: {selectedJob.orderNo ?? 'WO-2026-0890'} · Priority: {(selectedJob.priority ?? 'medium').toUpperCase()}
                </SheetDescription>
              </SheetHeader>

              {/* Subscriber Location Card */}
              <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Location & Subscriber Details
                </span>
                <p className="text-sm font-bold text-foreground">{selectedJob.customerName}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{selectedJob.address ?? selectedJob.area}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{selectedJob.phone ?? '+880 1700-000000'}</span>
                  </p>
                </div>
              </Card>

              {/* Technician Dispatch Assignment */}
              <Card className="p-4 border-border/80 bg-card space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Assigned Field Crew
                </span>
                <p className="text-sm font-bold text-foreground">{selectedJob.assignee}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Unit: <strong className="text-foreground">{selectedJob.team ?? 'North Field Operations'}</strong></p>
                  <p>Contact: <strong className="font-mono text-foreground">{selectedJob.assigneePhone ?? '+880 1700-112233'}</strong></p>
                </div>
              </Card>

              {/* Materials & Equipment Used */}
              {selectedJob.materialsUsed && (
                <Card className="p-4 border-border/80 bg-card space-y-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    Equipment & Optical Materials
                  </span>
                  <p className="text-xs font-mono text-foreground">{selectedJob.materialsUsed}</p>
                </Card>
              )}

              {/* Dispatch Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedJob.id, 'in_progress')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-semibold gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" /> Start Job (In Progress)
                  </Button>

                  <Button
                    onClick={() => handleStatusChange(selectedJob.id, 'done')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => toast.success(`Technician ${selectedJob.assignee} notified via SMS dispatch push`)}
                  className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" /> Send Dispatch SMS to Technician
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Work Order Sheet */}
      <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground">Dispatch New Work Order</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Create and route a physical service task to on-field technicians.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Task Title *</label>
              <Input
                placeholder="e.g. New FTTH Optical Fiber Splicing"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Subscriber Name / Entity *</label>
              <Input
                placeholder="e.g. Rahim Uddin"
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Job Type</label>
                <Select value={newType} onValueChange={(v) => v && setNewType(v as WorkOrder['type'])}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="install">FTTH Installation</SelectItem>
                    <SelectItem value="repair">LOS Optical Repair</SelectItem>
                    <SelectItem value="shift">Address Shift</SelectItem>
                    <SelectItem value="collect">Cash Collection</SelectItem>
                    <SelectItem value="upgrade">Hardware Upgrade</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Priority</label>
                <Select value={newPriority} onValueChange={(v) => v && setNewPriority(v as WorkOrder['priority'])}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical (Emergency)</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Installation Area & Address</label>
              <Input
                placeholder="e.g. Banani Block C, House 14"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Assigned Field Technician</label>
              <Select value={newAssignee} onValueChange={(v) => v && setNewAssignee(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rafiq Field (Lead Technician)">Rafiq Field (Lead Technician)</SelectItem>
                  <SelectItem value="Imtiaz Tech">Imtiaz Tech</SelectItem>
                  <SelectItem value="Kamal Lineman">Kamal Lineman</SelectItem>
                  <SelectItem value="Salma Desk">Salma Desk (Accounts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold">
                Dispatch Work Order
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewOrderOpen(false)}
                className="w-full text-xs h-9 border-border/80 hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
