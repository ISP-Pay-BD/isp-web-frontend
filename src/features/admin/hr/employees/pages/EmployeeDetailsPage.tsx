'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Clock,
  Navigation,
  Compass,
  FileText,
  DollarSign,
  Copy,
  Edit2,
  AlertCircle,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEmployees } from '../hooks/use-employees';
import { attendanceRecords, advanceSalaryRequests } from '@/data/admin/hr.data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { EmployeeItem } from '../types';

export function EmployeeDetailsPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { employees, isLoading, isError, refetch } = useEmployees();
  const [activeTab, setActiveTab] = useState<'attendance' | 'locations' | 'advances'>('attendance');
  const [selectedDay, setSelectedDay] = useState('2026-09-09');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId) || null,
    [employees, employeeId]
  );

  const attendance = useMemo(
    () => attendanceRecords.filter((a) => a.employeeId === employeeId || a.employeeName === employee?.name),
    [employeeId, employee?.name]
  );

  const advances = useMemo(
    () => advanceSalaryRequests.filter((adv) => adv.employeeId === employeeId || adv.employeeName === employee?.name),
    [employeeId, employee?.name]
  );

  // Mock location telemetry points
  const locationPings = useMemo(
    () => [
      { id: 'loc_1', time: '09:15 AM', lat: 23.8759, lng: 90.3795, address: 'Uttara Sector 3 (Check-in HQ)' },
      { id: 'loc_2', time: '10:30 AM', lat: 23.8682, lng: 90.3921, address: 'Uttara Sector 7 (Fiber Box Maintenance)' },
      { id: 'loc_3', time: '11:45 AM', lat: 23.8614, lng: 90.3989, address: 'Sector 11 (Client Drop Cable Fix)' },
      { id: 'loc_4', time: '01:30 PM', lat: 23.8710, lng: 90.4012, address: 'Sector 13 (ONU Power Calibration)' },
      { id: 'loc_5', time: '03:45 PM', lat: 23.8765, lng: 90.3850, address: 'Sector 4 (POP Node Inspection)' },
      { id: 'loc_6', time: '05:30 PM', lat: 23.8759, lng: 90.3795, address: 'Uttara HQ (Shift Closing)' },
    ],
    []
  );

  const markers = useMemo(
    () =>
      locationPings.map((p, idx) => ({
        id: p.id,
        latitude: p.lat,
        longitude: p.lng,
        color: idx === 0 ? '#10b981' : idx === locationPings.length - 1 ? '#ef4444' : '#2E8BFF',
        label: `${idx + 1}. ${p.time} — ${p.address}`,
      })),
    [locationPings]
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) return <PageSkeleton variant="detail" rows={8} />;
  if (isError || !employee) {
    return (
      <EmptyState
        title="Employee record not found"
        description="Could not find staff member with the requested ID."
        actionLabel="Back to Staff List"
        onAction={() => router.push('/admin/hr/employees')}
      />
    );
  }

  const isTechnician = employee.role.toLowerCase().includes('technician') || employee.role.toLowerCase().includes('engineer');

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/hr/employees" className="hover:text-foreground transition-colors">
          Staff & Employees
        </Link>
        <span>/</span>
        <span className="text-foreground">{employee.name}</span>
      </div>

      {/* Hero Header */}
      <Card className="border-border/60 bg-card/90 shadow-sm ring-1 ring-border/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-sm">
                  {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background',
                    employee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                  )}
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                  <Badge variant="outline" className="font-mono text-xs bg-muted/60 text-muted-foreground">
                    {employee.id}
                  </Badge>
                  <StatusBadge status={employee.status} />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium flex-wrap">
                  <span className="text-primary font-semibold">{employee.role}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3" /> {employee.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {employee.area ?? 'Central Zone'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/hr/employees">
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs border-border/80">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot KPI Facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Salary
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={employee.salaryBdt} className="text-2xl font-bold tracking-tight text-foreground" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Attendance Records
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {attendance.length || 5}
            </span>
            <span className="text-xs text-muted-foreground">sessions</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GPS Location Pings
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
              {locationPings.length}
            </span>
            <span className="text-xs text-muted-foreground">stops today</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GPS Tracking Status
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">
              {isTechnician ? 'Active' : 'Standby'}
            </span>
            <span className="text-xs text-muted-foreground">15m interval</span>
          </div>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Profile Details Meta */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="py-3.5 px-4 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Profile Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Employee Code</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                  <span>{employee.id.toUpperCase()}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(employee.id.toUpperCase(), 'Employee Code')}
                    className="text-muted-foreground hover:text-primary"
                    title="Copy code"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Designation</span>
                <span className="font-semibold text-foreground">{employee.role}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Official Mobile</span>
                <span className="font-mono text-foreground">{employee.phone}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Email Address</span>
                <span className="font-mono text-muted-foreground">{employee.email ?? `${employee.id}@isppaybd.com`}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">National ID (NID)</span>
                <span className="font-mono text-muted-foreground">{employee.nid ?? '199226954812004'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Assigned Area</span>
                <span className="font-medium text-foreground">{employee.area ?? 'Central Zone'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Date Joined</span>
                <span className="font-mono text-muted-foreground">{employee.joinedAt}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Live Telemetry</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Activity Tabs (Attendance, Locations Map, Advances) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
            <div className="border-b border-border/60 bg-muted/20 px-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className={cn(
                    'flex items-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all duration-150 px-2',
                    activeTab === 'attendance'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" /> Attendance
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-muted">
                    {attendance.length || 5}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('locations')}
                  className={cn(
                    'flex items-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all duration-150 px-2',
                    activeTab === 'locations'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Navigation className="h-3.5 w-3.5" /> GPS Location Track
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-muted">
                    {locationPings.length}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('advances')}
                  className={cn(
                    'flex items-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all duration-150 px-2',
                    activeTab === 'advances'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <DollarSign className="h-3.5 w-3.5" /> Salary Advances
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-muted">
                    {advances.length}
                  </Badge>
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Tab 1: Attendance Table */}
              {activeTab === 'attendance' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Check In</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Check Out</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Duration</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60">
                      {(attendance.length > 0 ? attendance : [
                        { id: '1', date: '2026-09-09', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'present' as const },
                        { id: '2', date: '2026-09-08', checkIn: '08:58 AM', checkOut: '06:30 PM', status: 'present' as const },
                        { id: '3', date: '2026-09-07', checkIn: '09:20 AM', checkOut: '06:05 PM', status: 'late' as const },
                        { id: '4', date: '2026-09-06', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present' as const },
                        { id: '5', date: '2026-09-05', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'present' as const },
                      ]).map((rec) => (
                        <TableRow key={rec.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-xs font-medium text-foreground">{rec.date}</TableCell>
                          <TableCell className="font-mono text-xs text-foreground">{rec.checkIn || '09:00 AM'}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{rec.checkOut || '06:00 PM'}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">9h 15m</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'capitalize text-[10px] font-medium',
                                rec.status === 'present'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : rec.status === 'late'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              )}
                            >
                              {rec.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Tab 2: GPS Locations Map */}
              {activeTab === 'locations' && (
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-xs font-bold text-foreground">Track Date: Today (2026-09-09)</span>
                        <p className="text-[11px] text-muted-foreground">Showing 6 recorded technician field stops in chronological order.</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Opening external Mapbox navigation')}
                      className="text-xs h-7 border-border/80"
                    >
                      Export GPS Track
                    </Button>
                  </div>

                  <MapboxMap
                    markers={markers}
                    selectedId={selectedLocationId}
                    onSelect={setSelectedLocationId}
                    height={380}
                    className="rounded-lg overflow-hidden border border-border/60 shadow-sm"
                    renderMarker={(marker, selected) => (
                      <div className="relative flex flex-col items-center cursor-pointer group">
                        <span
                          className={cn(
                            'h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform duration-200',
                            selected ? 'scale-125 ring-4 ring-primary/40' : 'group-hover:scale-110'
                          )}
                          style={{ backgroundColor: marker.color }}
                        />
                        {selected ? (
                          <span className="mt-1.5 max-w-[200px] truncate rounded-md bg-popover px-2 py-1 text-[10px] font-bold text-popover-foreground shadow-md ring-1 ring-border">
                            {marker.label}
                          </span>
                        ) : null}
                      </div>
                    )}
                  />

                  {/* Waypoints timeline */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Chronological Stops
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {locationPings.map((p, i) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedLocationId(p.id)}
                          className={cn(
                            'p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-150',
                            selectedLocationId === p.id
                              ? 'bg-primary/10 border-primary/40 text-foreground'
                              : 'bg-card hover:bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                            <span className="font-bold text-foreground">Stop #{i + 1}</span>
                            <span className="text-primary font-semibold">{p.time}</span>
                          </div>
                          <p className="text-foreground text-[11px] truncate">{p.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Advance Salary Requests */}
              {activeTab === 'advances' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Reason</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60">
                      {advances.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-muted-foreground text-xs">
                            No advance salary requests recorded for this staff member.
                          </td>
                        </tr>
                      ) : (
                        advances.map((adv) => (
                          <TableRow key={adv.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs text-foreground">{adv.requestedAt}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              <CurrencyDisplay amount={adv.amountBdt} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{adv.reason}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'capitalize text-[10px] font-medium',
                                  adv.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : adv.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                )}
                              >
                                {adv.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
