'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect, useState } from 'react';
import { useAttendance, useAttendanceSummary, useUpdateAttendance } from '../hooks/use-attendance';
import type { AttendanceItem, AttendanceStatus } from '../types';
import { useHrMeta } from '../../shared/use-hr-meta';
import { useDebouncedValue } from '../../shared/use-debounced-value';
import { formatClock, fromLocalInput, initials, toLocalInput, titleCase } from '../../shared/format';
import { PageSkeleton, EmptyState, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarCheck, Search, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: string; badge: string; dot: string }> = {
  present: { icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  late: { icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  absent: { icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
};

export function AttendancePage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [editingRecord, setEditingRecord] = useState<AttendanceItem | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, employeeFilter, dateFrom, dateTo, pageSize]);

  const filters = { page, perPage: pageSize, search: debouncedSearch, employeeId: employeeFilter, status: statusFilter, dateFrom, dateTo };
  const list = useAttendance(filters);
  const summary = useAttendanceSummary(filters);
  const meta = useHrMeta();
  const updateAttendance = useUpdateAttendance();

  const records = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const employees = meta.data?.employees ?? [];
  const statuses = meta.data?.attendanceStatuses ?? [];
  const employeeItems = Object.fromEntries([['all', 'All Staff'], ...employees.map((e) => [e.id, e.name])]);
  const statusItems = Object.fromEntries([['all', 'All Status'], ...statuses.map((st) => [st, titleCase(st)])]);
  const stats = summary.data;

  const handleOpenEdit = (rec: AttendanceItem) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditCheckIn(toLocalInput(rec.checkIn));
    setEditCheckOut(toLocalInput(rec.checkOut));
    setEditNotes(rec.notes);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    updateAttendance.mutate(
      {
        id: editingRecord.id,
        status: editStatus,
        checkIn: fromLocalInput(editCheckIn),
        checkOut: fromLocalInput(editCheckOut),
        notes: editNotes,
      },
      {
        onSuccess: () => {
          toast.success('Attendance updated');
          setEditingRecord(null);
        },
      },
    );
  };

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load attendance logs" description={list.error?.message ?? 'Could not communicate with the employee attendance log.'} actionLabel="Retry" onAction={() => list.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CalendarCheck className="h-6 w-6" />
          </div>
          Attendance Tracking
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Monitor field staff check-ins, office staff biometric logs, on-time arrivals, and leaves.
        </p>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{stats?.total ?? '—'}</span>{' '}
          <span className="text-muted-foreground">logged</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.present ?? '—'}</span>{' '}
          <span className="text-muted-foreground">present</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.late ?? '—'}</span>{' '}
          <span className="text-muted-foreground">late</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.absent ?? '—'}</span>{' '}
          <span className="text-muted-foreground">absent / leave</span>
        </p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by staff name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-[140px] text-xs" aria-label="From date" />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-[140px] text-xs" aria-label="To date" />
                <Select items={employeeItems} value={employeeFilter} onValueChange={(v) => setEmployeeFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[170px] h-9 text-xs border-border/60"><SelectValue placeholder="All Staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select items={statusItems} value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[140px] h-9 text-xs border-border/60"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((st) => <SelectItem key={st} value={st}>{titleCase(st)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{total} result{total !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<CalendarCheck className="h-10 w-10" />} title="No attendance records found" description="No attendance data matches your selected filters." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Staff Member</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Date</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Check-In</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Check-Out</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, idx) => {
                    const stCfg = statusConfig[r.status] || statusConfig.absent;
                    return (
                      <tr key={r.id} className="group border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs">{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-[10px] border border-border/60 bg-muted/50 text-muted-foreground">
                              {initials(r.employeeName)}
                            </div>
                            <div>
                              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{r.employeeName || `#${r.employeeId}`}</span>
                              {r.employeeDesignation ? <div className="text-[10px] text-muted-foreground">{titleCase(r.employeeDesignation)}</div> : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.date}</TableCell>
                        <TableCell className="font-mono text-xs">{formatClock(r.checkIn) || '--'}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{formatClock(r.checkOut) || '--'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium gap-1 ${stCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${stCfg.dot}`} />
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div >
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(r)} title="Edit attendance">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <TablePagination
            currentPage={list.data?.meta.page ?? page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Card>
      </div>

      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Attendance</DialogTitle>
              <DialogDescription>Adjust status and times for {editingRecord.employeeName} on {editingRecord.date}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Attendance Status</Label>
                <Select items={Object.fromEntries(statuses.map((st) => [st, titleCase(st)]))} value={editStatus} onValueChange={(val) => val && setEditStatus(val as AttendanceStatus)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((st) => <SelectItem key={st} value={st}>{titleCase(st)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-in">Check In</Label>
                <Input id="att-in" type="datetime-local" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-out">Check Out</Label>
                <Input id="att-out" type="datetime-local" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-notes">Notes</Label>
                <Textarea id="att-notes" rows={2} maxLength={500} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateAttendance.isPending} className="bg-primary hover:bg-primary/90">{updateAttendance.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    
      </PageContent>
    </div>
  );
}
