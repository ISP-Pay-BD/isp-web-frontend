'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Navigation,
  Compass,
  DollarSign,
  Copy,
  Edit2,
  Wrench,
  Plus,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge, TablePagination } from '@/components/shared';
import type { MapboxMarker } from '@/components/shared/MapboxMap';
import { saveBlob } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useEmployeeActivity } from '../hooks/use-employee-activity';
import { useEmployeeMutations } from '../hooks/use-employees';
import { useInstallationMutations, useInstallations } from '../hooks/use-installations';
import { EmployeeModal } from '../components/EmployeeModal';
import { AssignInstallationDialog } from '../components/AssignInstallationDialog';
import { useHrMeta } from '../../shared/use-hr-meta';
import { datePart, formatClock, formatDuration, initials, titleCase } from '../../shared/format';
import type { EmployeeFormValues } from '../schemas';
import type { InstallationStatus } from '../types';

// mapbox-gl is heavy — load the map only when the GPS tab is opened.
const MapboxMap = dynamic(() => import('@/components/shared/MapboxMap').then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[380px] w-full rounded-lg" />,
});

type Tab = 'attendance' | 'locations' | 'advances' | 'installations';

const statusTone: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  late: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  assigned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  deducted: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};
const toneFor = (status: string) => statusTone[status] ?? 'bg-rose-500/10 text-rose-500 border-rose-500/20';

const OPEN_INSTALL: InstallationStatus[] = ['pending', 'assigned', 'in_progress'];

export function EmployeeDetailsPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [trackDate, setTrackDate] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [installPage, setInstallPage] = useState(1);
  const [installPageSize, setInstallPageSize] = useState(10);

  const activity = useEmployeeActivity(employeeId, trackDate);
  const meta = useHrMeta();
  const { update } = useEmployeeMutations();
  const installations = useInstallations({ employeeId, status: 'all', page: installPage, perPage: installPageSize });
  const { cancel } = useInstallationMutations();

  const data = activity.data;
  const pings = useMemo(() => [...(data?.locations ?? [])].reverse(), [data?.locations]);

  const markers = useMemo<MapboxMarker[]>(
    () =>
      pings.map((p, idx) => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        color: idx === 0 ? '#10b981' : idx === pings.length - 1 ? '#ef4444' : '#2E8BFF',
        label: `${idx + 1}. ${formatClock(p.createdAt)}${p.address ? ` — ${p.address}` : ''}`,
      })),
    [pings],
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const exportTrack = () => {
    const header = 'stop,recorded_at,latitude,longitude,address';
    const lines = pings.map((p, i) =>
      [i + 1, p.createdAt, p.latitude, p.longitude, `"${p.address.replace(/"/g, '""')}"`].join(','),
    );
    saveBlob(
      new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }),
      `gps-track-${employeeId}${trackDate ? `-${trackDate}` : ''}.csv`,
    );
  };

  const handleSave = (values: EmployeeFormValues) => update.mutateAsync({ id: employeeId, values });

  if (activity.isLoading) return <PageSkeleton variant="detail" rows={8} />;
  if (activity.isError || !data) {
    const notFound = activity.error?.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Employee record not found' : 'Failed to load employee'}
        description={notFound ? 'Could not find a staff member with the requested ID.' : activity.error?.message}
        actionLabel={notFound ? 'Back to Staff List' : 'Retry'}
        onAction={() => (notFound ? router.push('/admin/hr/employees') : activity.refetch())}
      />
    );
  }

  const employee = data.employee;
  const installItems = installations.data?.items ?? [];
  const installTotal = installations.data?.meta.total ?? 0;

  const tabButton = (tab: Tab, icon: ReactNode, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={cn(
        'flex items-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition duration-150 px-2',
        activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {icon} {label}
      <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-muted">
        {count}
      </Badge>
    </button>
  );

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
                  {initials(employee.name)}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background',
                    employee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400',
                  )}
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                  <Badge variant="outline" className="font-mono text-xs bg-muted/60 text-muted-foreground">
                    #{employee.id}
                  </Badge>
                  <StatusBadge status={employee.status} />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium flex-wrap">
                  {employee.designationLabel ? (
                    <>
                      <span className="text-primary font-semibold">{employee.designationLabel}</span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3" /> {employee.mobile || '—'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {employee.areaLabel || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs border-border/80"
                disabled={!meta.data}
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Salary</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {employee.salary !== null ? (
              <CurrencyDisplay amount={employee.salary} className="text-2xl font-bold tracking-tight text-foreground" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-muted-foreground">—</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Records</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {data.attendanceCount}
            </span>
            <span className="text-xs text-muted-foreground">sessions</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GPS Location Pings</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
              {data.locationCount}
            </span>
            <span className="text-xs text-muted-foreground">{trackDate ? `on ${trackDate}` : 'recorded'}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GPS Tracking</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">
              {data.locationRequired ? 'Required' : 'Off'}
            </span>
            {data.locationRequired && data.locationInterval > 0 ? (
              <span className="text-xs text-muted-foreground">{data.locationInterval}m interval</span>
            ) : null}
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
                <span className="text-muted-foreground">Employee ID</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                  <span>{employee.id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(employee.id, 'Employee ID')}
                    className="text-muted-foreground hover:text-primary"
                    title="Copy ID"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {[
                ['Designation', employee.designationLabel || '—'],
                ['Official Mobile', employee.mobile || '—'],
                ['Email Address', employee.email || '—'],
                ['National ID (NID)', employee.nidNumber ? `${employee.nidNumber}${employee.nidVerified ? ' ✓' : ''}` : '—'],
                ['Assigned Areas', employee.areaLabel || '—'],
                ['Address', employee.address || '—'],
                ['Date Joined', datePart(employee.joinedAt) || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 py-1 border-b border-border/40">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="text-right font-medium text-foreground break-words">{value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Last Location Update</span>
                <span className="font-mono text-muted-foreground">
                  {data.lastLocationUpdate ? `${datePart(data.lastLocationUpdate)} ${formatClock(data.lastLocationUpdate)}` : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Activity Tabs */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
            <div className="border-b border-border/60 bg-muted/20 px-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {tabButton('attendance', <Calendar className="h-3.5 w-3.5" />, 'Attendance', data.attendanceCount)}
                {tabButton('locations', <Navigation className="h-3.5 w-3.5" />, 'GPS Location Track', data.locationCount)}
                {tabButton('advances', <DollarSign className="h-3.5 w-3.5" />, 'Salary Advances', data.advanceCount)}
                {tabButton('installations', <Wrench className="h-3.5 w-3.5" />, 'Installations', installTotal)}
              </div>
            </div>

            <CardContent className="p-0">
              {activeTab === 'attendance' && (
                <div className="overflow-x-auto">
                  {data.attendance.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">No attendance recorded for this staff member yet.</div>
                  ) : (
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
                        {data.attendance.map((rec) => (
                          <TableRow key={rec.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs font-medium text-foreground">{rec.date}</TableCell>
                            <TableCell className="font-mono text-xs text-foreground">{formatClock(rec.checkIn) || '—'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{formatClock(rec.checkOut) || '—'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {formatDuration(rec.checkIn, rec.checkOut) || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className={cn('capitalize text-[10px] font-medium', toneFor(rec.status))}>
                                {rec.status || '—'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-xs font-bold text-foreground">
                          {trackDate ? `Track date: ${trackDate}` : 'Most recent pings'}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Showing {pings.length} recorded stop{pings.length === 1 ? '' : 's'} in chronological order.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={trackDate}
                        onChange={(e) => {
                          setTrackDate(e.target.value);
                          setSelectedLocationId(null);
                        }}
                        className="h-7 w-[150px] text-xs"
                        aria-label="Track date"
                      />
                      {trackDate ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setTrackDate('')}>
                          Clear
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={exportTrack}
                        disabled={pings.length === 0}
                        className="text-xs h-7 gap-1 border-border/80"
                      >
                        <Download className="h-3 w-3" /> Export CSV
                      </Button>
                    </div>
                  </div>

                  {pings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      {activity.isFetching ? 'Loading track…' : 'No GPS pings recorded for this period.'}
                    </div>
                  ) : (
                    <>
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
                                selected ? 'scale-125 ring-4 ring-primary/40' : 'group-hover:scale-110',
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

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chronological Stops</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pings.map((p, i) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedLocationId(p.id)}
                              className={cn(
                                'p-2.5 rounded-lg border text-xs cursor-pointer transition duration-150',
                                selectedLocationId === p.id
                                  ? 'bg-primary/10 border-primary/40 text-foreground'
                                  : 'bg-card hover:bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground',
                              )}
                            >
                              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                                <span className="font-bold text-foreground">Stop #{i + 1}</span>
                                <span className="text-primary font-semibold">
                                  {trackDate ? formatClock(p.createdAt) : `${datePart(p.createdAt)} ${formatClock(p.createdAt)}`}
                                </span>
                              </div>
                              <p className="text-foreground text-[11px] truncate">
                                {p.address || `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'advances' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Reason</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Deduct Month</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60">
                      {data.advances.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                            No advance salary requests recorded for this staff member.
                          </td>
                        </tr>
                      ) : (
                        data.advances.map((adv) => (
                          <TableRow key={adv.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs text-foreground">{datePart(adv.createdAt) || '—'}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              <CurrencyDisplay amount={adv.amount} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{adv.reason || '—'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{adv.deductMonth || '—'}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className={cn('capitalize text-[10px] font-medium', toneFor(adv.status))}>
                                {adv.status || '—'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === 'installations' && (
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Field installation work orders assigned to {employee.name}.</p>
                    <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAssignOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> Assign Installation
                    </Button>
                  </div>
                  {installations.isLoading ? (
                    <Skeleton className="h-40 w-full rounded-lg" />
                  ) : installations.isError ? (
                    <EmptyState
                      title="Failed to load installations"
                      description={installations.error.message}
                      actionLabel="Retry"
                      onAction={() => installations.refetch()}
                    />
                  ) : installItems.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground">No installations assigned yet.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border/60">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/60 bg-muted/40 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Job</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Scheduled</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border/60">
                          {installItems.map((job) => (
                            <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="text-xs">
                                <div className="font-semibold text-foreground">{job.title}</div>
                                <div className="text-muted-foreground">
                                  {[job.customerName, job.address].filter(Boolean).join(' · ') || '—'}
                                </div>
                                {job.completedAt ? (
                                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                    Completed {datePart(job.completedAt)} {formatClock(job.completedAt)}
                                    {job.completedLatitude !== null && job.completedLongitude !== null
                                      ? ` · ${job.completedLatitude.toFixed(5)}, ${job.completedLongitude.toFixed(5)}`
                                      : ''}
                                  </div>
                                ) : null}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {job.scheduledAt ? `${datePart(job.scheduledAt)} ${formatClock(job.scheduledAt)}` : '—'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn('text-[10px] font-medium', toneFor(job.status))}>
                                  {titleCase(job.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {OPEN_INSTALL.includes(job.status) ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                    disabled={cancel.isPending}
                                    onClick={() =>
                                      cancel.mutate(job.id, { onSuccess: () => toast.success('Installation cancelled') })
                                    }
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <TablePagination
                    currentPage={installPage}
                    pageSize={installPageSize}
                    totalItems={installTotal}
                    onPageChange={setInstallPage}
                    onPageSizeChange={setInstallPageSize}
                    pageSizeOptions={[10, 20, 50]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editOpen && meta.data ? (
        <EmployeeModal open={editOpen} onOpenChange={setEditOpen} employee={employee} meta={meta.data} onSave={handleSave} />
      ) : null}
      {assignOpen ? (
        <AssignInstallationDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          employeeId={employee.id}
          employeeName={employee.name}
        />
      ) : null}
    </div>
  );
}
