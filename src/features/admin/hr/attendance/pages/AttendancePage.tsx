'use client';

import { useState, useMemo } from 'react';
import { useAttendance } from '../hooks/use-attendance';
import type { AttendanceItem } from '../types';
import { PageSkeleton, EmptyState, StatCard, StatusBadge, Can } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarCheck, Clock, UserCheck, AlertTriangle, Search, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export function AttendancePage() {
  const { records, employees, isLoading, isError, refetch, updateAttendance } = useAttendance();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Edit attendance modal
  const [editingRecord, setEditingRecord] = useState<AttendanceItem | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceItem['status']>('present');
  const [editCheckIn, setEditCheckIn] = useState('09:00');
  const [editCheckOut, setEditCheckOut] = useState('18:00');

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesEmployee = employeeFilter === 'all' || r.employeeId === employeeFilter;
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [records, search, statusFilter, employeeFilter]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    return { present, late, absent, total: records.length };
  }, [records]);

  const handleOpenEdit = (rec: AttendanceItem) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditCheckIn(rec.checkIn);
    setEditCheckOut(rec.checkOut ?? '18:00');
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      await updateAttendance({
        id: editingRecord.id,
        status: editStatus,
        checkIn: editCheckIn,
        checkOut: editCheckOut,
      });
      toast.success('Attendance updated');
      setEditingRecord(null);
    } catch {
      toast.error('Failed to update attendance');
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load attendance logs"
          description="Could not communicate with the employee attendance log."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Tracking</h1>
        <p className="text-muted-foreground text-sm">
          Monitor field staff check-ins, office staff biometric logs, on-time arrivals, and leaves.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Logged"
          value={stats.total}
          description="Roster check records"
          icon={CalendarCheck}
        />
        <StatCard
          title="Present"
          value={stats.present}
          description="On-duty regular"
          trend={{ value: `${Math.round((stats.present / (stats.total || 1)) * 100)}% of roster`, positive: true }}
          icon={UserCheck}
        />
        <StatCard
          title="Late Arrival"
          value={stats.late}
          description="Reported after 09:30"
          trend={{ value: `${stats.late} delayed`, positive: false }}
          icon={Clock}
        />
        <StatCard
          title="Absent / On-Leave"
          value={stats.absent}
          description="Unexcused or notified"
          icon={AlertTriangle}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by staff name or date (YYYY-MM-DD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeFilter} onValueChange={(v) => setEmployeeFilter(v ?? 'all')}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-10 w-10" />}
          title="No attendance records found"
          description="No attendance data matches your selected filters."
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((r, idx) => (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{r.employeeName}</TableCell>
                  <TableCell className="font-mono text-xs">{r.date}</TableCell>
                  <TableCell className="font-mono text-xs">{r.checkIn}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {r.checkOut ?? '--'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={r.status === 'present' ? 'online' : r.status === 'late' ? 'pending' : 'expired'}
                      label={r.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Can menu="employee_attendance" action="update">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(r)}
                        title="Edit attendance"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Attendance</DialogTitle>
              <DialogDescription>
                Adjust status and times for {editingRecord.employeeName} on {editingRecord.date}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Attendance Status</Label>
                <Select value={editStatus} onValueChange={(val) => setEditStatus(val as AttendanceItem['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Check In Time</Label>
                <Input value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} placeholder="09:00" />
              </div>

              <div className="space-y-1">
                <Label>Check Out Time</Label>
                <Input value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} placeholder="18:00" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
