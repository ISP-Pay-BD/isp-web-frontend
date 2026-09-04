'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '../hooks/use-attendance';
import type { AttendanceItem } from '../types';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { CalendarCheck, UserCheck, Search, Edit3, X, Timer, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const avatarColors = [
  'bg-blue-500/15 text-blue-600 border-blue-500/25',
  'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  'bg-amber-500/15 text-amber-600 border-amber-500/25',
  'bg-purple-500/15 text-purple-600 border-purple-500/25',
  'bg-rose-500/15 text-rose-600 border-rose-500/25',
];

const statusConfig: Record<string, { icon: string; badge: string; dot: string }> = {
  present: { icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  late: { icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  absent: { icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
};

export function AttendancePage() {
  const { records, employees, isLoading, isError, refetch, updateAttendance } = useAttendance();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [editingRecord, setEditingRecord] = useState<AttendanceItem | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceItem['status']>('present');
  const [editCheckIn, setEditCheckIn] = useState('09:00');
  const [editCheckOut, setEditCheckOut] = useState('18:00');

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.date.includes(search);
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
      await updateAttendance({ id: editingRecord.id, status: editStatus, checkIn: editCheckIn, checkOut: editCheckOut });
      toast.success('Attendance updated');
      setEditingRecord(null);
    } catch { toast.error('Failed to update attendance'); }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load attendance logs" description="Could not communicate with the employee attendance log." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  const kpiStats = [
    { label: 'Total Logged', value: stats.total, description: 'Roster check records', icon: CalendarCheck, color: 'blue' },
    { label: 'Present', value: stats.present, description: 'On-duty regular', trend: `${Math.round((stats.present / (stats.total || 1)) * 100)}% of roster`, icon: UserCheck, color: 'emerald' },
    { label: 'Late Arrival', value: stats.late, description: 'Reported after 09:30', trend: `${stats.late} delayed`, icon: Timer, color: 'amber' },
    { label: 'Absent / On-Leave', value: stats.absent, description: 'Unexcused or notified', icon: UserX, color: 'rose' },
  ];

  const statColors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

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

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiStats.map((stat, idx) => (
          <div key={stat.label}>
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden group">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-200 ${statColors[stat.color]}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  {'trend' in stat && stat.trend && (
                    <div className={cn('text-[10px] font-semibold mt-0.5', stat.color === 'amber' ? 'text-amber-500' : 'text-emerald-500')}>
                      {stat.trend}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by staff name or date (YYYY-MM-DD)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={employeeFilter} onValueChange={(v) => setEmployeeFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[170px] h-9 text-xs border-border/60"><SelectValue placeholder="All Staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[140px] h-9 text-xs border-border/60"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{filteredRecords.length} result{filteredRecords.length !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<CalendarCheck className="h-10 w-10" />} title="No attendance records found" description="No attendance data matches your selected filters." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Staff Member</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Check-In</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Check-Out</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((r, idx) => {
                    const colorIdx = idx % avatarColors.length;
                    const stCfg = statusConfig[r.status] || statusConfig.absent;
                    return (
                      <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="group border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('relative flex h-9 w-9 items-center justify-center rounded-xl font-bold text-[10px] border group-hover:scale-110 transition-transform duration-200', avatarColors[colorIdx])}>
                              {r.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{r.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.date}</TableCell>
                        <TableCell className="font-mono text-xs">{r.checkIn}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{r.checkOut ?? '--'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium gap-1 ${stCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${stCfg.dot}`} />
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <motion.div whileHover={{ y: -1 }}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(r)} title="Edit attendance">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
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
                <Select value={editStatus} onValueChange={(val) => setEditStatus(val as AttendanceItem['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    
      </PageContent>
    </div>
  );
}
