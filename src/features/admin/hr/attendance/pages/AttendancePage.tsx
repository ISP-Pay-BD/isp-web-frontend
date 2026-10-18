'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useAttendance, useAttendanceSummary, useUpdateAttendance } from '../hooks/use-attendance';
import type { AttendanceItem, AttendanceStatus } from '../types';
import { useHrMeta } from '../../shared/use-hr-meta';
import { formatClock, fromLocalInput, initials, toLocalInput, titleCase } from '../../shared/format';
import { hrStatusLabel } from '../../shared/labels';
import { useTranslations } from '@/i18n/locale-context';
import { PageSkeleton, EmptyState, StatusBadge } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CalendarCheck, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export function AttendancePage() {
  const t = useTranslations();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingRecord, setEditingRecord] = useState<AttendanceItem | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filters = { page: table.page, perPage: table.pageSize, search: table.search, employeeId: employeeFilter, status: statusFilter, dateFrom, dateTo };
  const list = useAttendance(filters);
  const summary = useAttendanceSummary(filters);
  const meta = useHrMeta();
  const updateAttendance = useUpdateAttendance();

  const records = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const employees = meta.data?.employees ?? [];
  const statuses = meta.data?.attendanceStatuses ?? [];
  const employeeItems = Object.fromEntries([['all', t('admin.hr.attendance.allStaff', 'All Staff')], ...employees.map((e) => [e.id, e.name])]);
  const statusItems = Object.fromEntries([['all', t('admin.hr.attendance.allStatus', 'All Status')], ...statuses.map((st) => [st, hrStatusLabel(t, st)])]);
  const stats = summary.data;

  const handleOpenEdit = useCallback((rec: AttendanceItem) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditCheckIn(toLocalInput(rec.checkIn));
    setEditCheckOut(toLocalInput(rec.checkOut));
    setEditNotes(rec.notes);
  }, []);

  const columns = useMemo<LegacyColumnDef<AttendanceItem, unknown>[]>(
    () => [
      {
        accessorKey: 'employeeName',
        header: t('admin.hr.attendance.colStaff', 'Staff Member'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-semibold text-xs border border-border/60 bg-muted/50 text-muted-foreground">
                {initials(r.employeeName)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm">{r.employeeName || `#${r.employeeId}`}</span>
                {r.employeeDesignation ? <div className="text-xs text-muted-foreground">{titleCase(r.employeeDesignation)}</div> : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'date',
        header: t('admin.hr.attendance.colDate', 'Date'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.date}</span>,
      },
      {
        accessorKey: 'checkIn',
        header: t('admin.hr.attendance.colCheckIn', 'Check-In'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs">{formatClock(row.original.checkIn) || '--'}</span>,
      },
      {
        accessorKey: 'checkOut',
        header: t('admin.hr.attendance.colCheckOut', 'Check-Out'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{formatClock(row.original.checkOut) || '--'}</span>,
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} label={hrStatusLabel(t, row.original.status)} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(row.original)} title={t('admin.hr.attendance.edit', 'Edit attendance')} aria-label={t('admin.hr.attendance.editFor', 'Edit attendance for {name}', { name: row.original.employeeName || row.original.employeeId })}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenEdit, t],
  );

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
          toast.success(t('admin.hr.attendance.updated', 'Attendance updated'));
          setEditingRecord(null);
        },
      },
    );
  };

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.hr.attendance.loadFailed', 'Failed to load attendance logs')} description={list.error?.message ?? t('admin.hr.attendance.loadFailedHint', 'Could not communicate with the employee attendance log.')} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
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
          {t('admin.hr.attendance.title', 'Attendance Tracking')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          {t('admin.hr.attendance.subtitle', 'Monitor field staff check-ins, office staff biometric logs, on-time arrivals, and leaves.')}
        </p>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{stats?.total ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.attendance.kpiLogged', 'logged')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.present ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.attendance.kpiPresent', 'present')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.late ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.attendance.kpiLate', 'late')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats?.absent ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.attendance.kpiAbsent', 'absent / leave')}</span>
        </p>
      </div>

      <DataTable
        urlState
        columns={columns}
        data={records}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.hr.attendance.searchPlaceholder', 'Search by staff name or mobile...')}
        emptyTitle={t('admin.hr.attendance.emptyTitle', 'No attendance records found')}
        emptyDescription={t('admin.hr.attendance.emptyHint', 'No attendance data matches your selected filters.')}
        server={table.server(total)}
        toolbarActions={
          <>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); table.resetPage(); }} className="h-9 w-[140px] text-xs" aria-label={t('admin.hr.attendance.fromDate', 'From date')} />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); table.resetPage(); }} className="h-9 w-[140px] text-xs" aria-label={t('admin.hr.attendance.toDate', 'To date')} />
            <Select items={employeeItems} value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v ?? 'all'); table.resetPage(); }}>
              <SelectTrigger className="w-[190px] h-9 text-xs border-border/60" aria-label={t('admin.hr.attendance.filterStaff', 'Filter by staff')}><SelectValue placeholder={t('admin.hr.attendance.allStaff', 'All Staff')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.hr.attendance.allStaff', 'All Staff')}</SelectItem>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select items={statusItems} value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? 'all'); table.resetPage(); }}>
              <SelectTrigger className="w-[160px] h-9 text-xs border-border/60" aria-label={t('admin.hr.attendance.filterStatus', 'Filter by status')}><SelectValue placeholder={t('admin.hr.attendance.allStatus', 'All Status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.hr.attendance.allStatus', 'All Status')}</SelectItem>
                {statuses.map((st) => <SelectItem key={st} value={st}>{hrStatusLabel(t, st)}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('admin.hr.attendance.updateTitle', 'Update Attendance')}</DialogTitle>
              <DialogDescription>{t('admin.hr.attendance.updateDesc', 'Adjust status and times for {name} on {date}.', { name: editingRecord.employeeName, date: editingRecord.date })}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="attendance-status">{t('admin.hr.attendance.statusLabel', 'Attendance Status')}</Label>
                <Select items={Object.fromEntries(statuses.map((st) => [st, hrStatusLabel(t, st)]))} value={editStatus} onValueChange={(val) => val && setEditStatus(val as AttendanceStatus)}>
                  <SelectTrigger id="attendance-status" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((st) => <SelectItem key={st} value={st}>{hrStatusLabel(t, st)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-in">{t('admin.hr.attendance.checkIn', 'Check In')}</Label>
                <Input id="att-in" type="datetime-local" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-out">{t('admin.hr.attendance.checkOut', 'Check Out')}</Label>
                <Input id="att-out" type="datetime-local" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-notes">{t('admin.hr.attendance.notes', 'Notes')}</Label>
                <Textarea id="att-notes" rows={2} maxLength={500} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRecord(null)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSaveEdit} disabled={updateAttendance.isPending} className="bg-primary hover:bg-primary/90">{updateAttendance.isPending ? t('admin.hr.attendance.saving', 'Saving...') : t('admin.hr.attendance.saveChanges', 'Save Changes')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    
      </PageContent>
    </div>
  );
}
