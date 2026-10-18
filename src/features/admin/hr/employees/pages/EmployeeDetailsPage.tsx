'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
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
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import type { MapboxMarker } from '@/components/shared/MapboxMap';
import { saveBlob } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEmployeeActivity } from '../hooks/use-employee-activity';
import { useEmployeeMutations } from '../hooks/use-employees';
import { useInstallationMutations, useInstallations } from '../hooks/use-installations';
import { EmployeeModal } from '../components/EmployeeModal';
import { AssignInstallationDialog } from '../components/AssignInstallationDialog';
import { useHrMeta } from '../../shared/use-hr-meta';
import { datePart, formatClock, formatDuration, initials } from '../../shared/format';
import { hrStatusLabel } from '../../shared/labels';
import { useTranslations } from '@/i18n/locale-context';
import type { EmployeeFormValues } from '../schemas';
import type { AdvanceLog, AttendanceLog, InstallationItem, InstallationStatus } from '../types';

// mapbox-gl is heavy — load the map only when the GPS tab is opened.
const MapboxMap = dynamic(() => import('@/components/shared/MapboxMap').then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[380px] w-full rounded-lg" />,
});

type Tab = 'attendance' | 'locations' | 'advances' | 'installations';

const OPEN_INSTALL: InstallationStatus[] = ['pending', 'assigned', 'in_progress'];

export function EmployeeDetailsPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const t = useTranslations();
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
    toast.success(t('admin.customers.list.copied', '{label} copied to clipboard', { label }));
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

  const { mutate: cancelInstall, isPending: cancelling } = cancel;

  const attendanceColumns = useMemo<LegacyColumnDef<AttendanceLog, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: t('admin.hr.details.colDate', 'Date'),
        cell: ({ row }) => <span className="font-mono text-xs font-medium text-foreground">{row.original.date}</span>,
      },
      {
        accessorKey: 'checkIn',
        header: t('admin.hr.details.colCheckIn', 'Check In'),
        cell: ({ row }) => <span className="font-mono text-xs text-foreground">{formatClock(row.original.checkIn) || '—'}</span>,
      },
      {
        accessorKey: 'checkOut',
        header: t('admin.hr.details.colCheckOut', 'Check Out'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{formatClock(row.original.checkOut) || '—'}</span>,
      },
      {
        id: 'duration',
        header: t('admin.hr.details.colDuration', 'Duration'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{formatDuration(row.original.checkIn, row.original.checkOut) || '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} label={hrStatusLabel(t, row.original.status)} /> : <span className="text-xs text-muted-foreground">—</span>),
      },
    ],
    [t],
  );

  const advanceColumns = useMemo<LegacyColumnDef<AdvanceLog, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('admin.hr.details.colDate', 'Date'),
        cell: ({ row }) => <span className="font-mono text-xs text-foreground">{datePart(row.original.createdAt) || '—'}</span>,
      },
      {
        accessorKey: 'amount',
        header: t('admin.hr.details.colAmount', 'Amount'),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-foreground">
            <CurrencyDisplay amount={row.original.amount} />
          </span>
        ),
      },
      {
        accessorKey: 'reason',
        header: t('admin.hr.details.colReason', 'Reason'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.reason || '—'}</span>,
      },
      {
        accessorKey: 'deductMonth',
        header: t('admin.hr.details.colDeductMonth', 'Deduct Month'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.deductMonth || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} label={hrStatusLabel(t, row.original.status)} /> : <span className="text-xs text-muted-foreground">—</span>),
      },
    ],
    [t],
  );

  const installationColumns = useMemo<LegacyColumnDef<InstallationItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('admin.hr.details.colJob', 'Job'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="text-xs">
              <div className="font-semibold text-foreground">{job.title}</div>
              <div className="text-muted-foreground">
                {[job.customerName, job.address].filter(Boolean).join(' · ') || '—'}
              </div>
              {job.completedAt ? (
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t('admin.hr.details.completedAt', 'Completed {at}', { at: `${datePart(job.completedAt)} ${formatClock(job.completedAt)}` })}
                  {job.completedLatitude !== null && job.completedLongitude !== null
                    ? ` · ${job.completedLatitude.toFixed(5)}, ${job.completedLongitude.toFixed(5)}`
                    : ''}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'scheduledAt',
        header: t('admin.hr.details.colScheduled', 'Scheduled'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.scheduledAt ? `${datePart(row.original.scheduledAt)} ${formatClock(row.original.scheduledAt)}` : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        enableSorting: false,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            label={hrStatusLabel(t, row.original.status)}
            tone={row.original.status === 'assigned' ? 'info' : undefined}
          />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.hr.details.colAction', 'Action')}</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="flex justify-end">
              {OPEN_INSTALL.includes(job.status) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-destructive hover:bg-destructive/10"
                  disabled={cancelling}
                  onClick={() => cancelInstall(job.id, { onSuccess: () => toast.success(t('admin.hr.details.installCancelled', 'Installation cancelled')) })}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          );
        },
      },
    ],
    [cancelInstall, cancelling, t],
  );

  if (activity.isLoading) return <PageSkeleton variant="detail" rows={8} />;
  if (activity.isError || !data) {
    const notFound = activity.error?.status === 404;
    return (
      <EmptyState
        title={notFound ? t('admin.hr.details.notFound', 'Employee record not found') : t('admin.hr.details.loadFailed', 'Failed to load employee')}
        description={notFound ? t('admin.hr.details.notFoundHint', 'Could not find a staff member with the requested ID.') : activity.error?.message}
        actionLabel={notFound ? t('admin.hr.details.backToList', 'Back to Staff List') : t('common.retry', 'Retry')}
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
      <Badge variant="secondary" className="text-xs font-mono px-1.5 py-0 bg-muted">
        {count}
      </Badge>
    </button>
  );

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
          {t('common.crumb.dashboard', 'Dashboard')}
        </Link>
        <span>/</span>
        <Link href="/admin/hr/employees" className="hover:text-foreground transition-colors">
          {t('admin.hr.employees.title', 'Staff & Employees')}
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
                <Edit2 className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs border-border/80" render={<Link href="/admin/hr/employees" />}>
                  <ArrowLeft className="h-3.5 w-3.5" /> {t('admin.hr.details.backToStaff', 'Back to Staff')}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot KPI Facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.hr.details.kpiSalary', 'Monthly Salary')}</span>
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.hr.details.kpiAttendance', 'Attendance Records')}</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {data.attendanceCount}
            </span>
            <span className="text-xs text-muted-foreground">{t('admin.hr.details.sessions', 'sessions')}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.hr.details.kpiPings', 'GPS Location Pings')}</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
              {data.locationCount}
            </span>
            <span className="text-xs text-muted-foreground">{trackDate ? t('admin.hr.details.onDate', 'on {date}', { date: trackDate }) : t('admin.hr.details.recorded', 'recorded')}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.hr.details.kpiTracking', 'GPS Tracking')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">
              {data.locationRequired ? t('admin.hr.details.trackRequired', 'Required') : t('admin.hr.details.trackOff', 'Off')}
            </span>
            {data.locationRequired && data.locationInterval > 0 ? (
              <span className="text-xs text-muted-foreground">{t('admin.hr.details.interval', '{n}m interval', { n: data.locationInterval })}</span>
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
                <User className="h-4 w-4 text-primary" /> {t('admin.hr.details.profile', 'Profile Credentials')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t('admin.hr.details.employeeId', 'Employee ID')}</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                  <span>{employee.id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(employee.id, t('admin.hr.details.employeeId', 'Employee ID'))}
                    className="text-muted-foreground hover:text-primary"
                    title={t('admin.hr.details.copyId', 'Copy ID')}
                    aria-label={t('admin.hr.details.copyId', 'Copy ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {[
                [t('admin.hr.details.designation', 'Designation'), employee.designationLabel || '—'],
                [t('admin.hr.details.officialMobile', 'Official Mobile'), employee.mobile || '—'],
                [t('admin.hr.details.email', 'Email Address'), employee.email || '—'],
                [t('admin.hr.employeeForm.nid', 'National ID (NID)'), employee.nidNumber ? `${employee.nidNumber}${employee.nidVerified ? ' ✓' : ''}` : '—'],
                [t('admin.hr.details.areas', 'Assigned Areas'), employee.areaLabel || '—'],
                [t('admin.hr.details.address', 'Address'), employee.address || '—'],
                [t('admin.hr.details.joined', 'Date Joined'), datePart(employee.joinedAt) || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 py-1 border-b border-border/40">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="text-right font-medium text-foreground break-words">{value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">{t('admin.hr.details.lastLocation', 'Last Location Update')}</span>
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
                {tabButton('attendance', <Calendar className="h-3.5 w-3.5" />, t('admin.hr.details.tabAttendance', 'Attendance'), data.attendanceCount)}
                {tabButton('locations', <Navigation className="h-3.5 w-3.5" />, t('admin.hr.details.tabTrack', 'GPS Location Track'), data.locationCount)}
                {tabButton('advances', <DollarSign className="h-3.5 w-3.5" />, t('admin.hr.details.tabAdvances', 'Salary Advances'), data.advanceCount)}
                {tabButton('installations', <Wrench className="h-3.5 w-3.5" />, t('admin.hr.details.tabInstalls', 'Installations'), installTotal)}
              </div>
            </div>

            <CardContent className="p-0">
              {activeTab === 'attendance' && (
                <div className="p-4">
                  {data.attendance.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">{t('admin.hr.details.noAttendance', 'No attendance recorded for this staff member yet.')}</div>
                  ) : (
                    <DataTable
                      columns={attendanceColumns}
                      data={data.attendance}
                      getRowId={(row) => row.id}
                      enableColumnVisibility={false}
                      enableLayoutToggle={false}
                    />
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
                          {trackDate ? t('admin.hr.details.trackDate', 'Track date: {date}', { date: trackDate }) : t('admin.hr.details.recentPings', 'Most recent pings')}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {pings.length === 1
                            ? t('admin.hr.details.stopsOne', 'Showing {n} recorded stop in chronological order.', { n: pings.length })
                            : t('admin.hr.details.stopsMany', 'Showing {n} recorded stops in chronological order.', { n: pings.length })}
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
                        aria-label={t('admin.hr.details.trackDateLabel', 'Track date')}
                      />
                      {trackDate ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setTrackDate('')}>
                          {t('admin.hr.details.clear', 'Clear')}
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={exportTrack}
                        disabled={pings.length === 0}
                        className="text-xs h-7 gap-1 border-border/80"
                      >
                        <Download className="h-3 w-3" /> {t('admin.hr.details.exportCsv', 'Export CSV')}
                      </Button>
                    </div>
                  </div>

                  {pings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      {activity.isFetching ? t('admin.hr.details.loadingTrack', 'Loading track…') : t('admin.hr.details.noPings', 'No GPS pings recorded for this period.')}
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
                              <span className="mt-1.5 max-w-[200px] truncate rounded-md bg-popover px-2 py-1 text-xs font-bold text-popover-foreground shadow-md ring-1 ring-border">
                                {marker.label}
                              </span>
                            ) : null}
                          </div>
                        )}
                      />

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.hr.details.stops', 'Chronological Stops')}</span>
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
                              <div className="flex items-center justify-between font-mono text-xs mb-1">
                                <span className="font-bold text-foreground">{t('admin.hr.details.stop', 'Stop #{n}', { n: i + 1 })}</span>
                                <span className="text-primary font-semibold">
                                  {trackDate ? formatClock(p.createdAt) : `${datePart(p.createdAt)} ${formatClock(p.createdAt)}`}
                                </span>
                              </div>
                              <p className="text-foreground text-xs truncate">
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
                <div className="p-4">
                  {data.advances.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      {t('admin.hr.details.noAdvances', 'No advance salary requests recorded for this staff member.')}
                    </div>
                  ) : (
                    <DataTable
                      columns={advanceColumns}
                      data={data.advances}
                      getRowId={(row) => row.id}
                      enableColumnVisibility={false}
                      enableLayoutToggle={false}
                    />
                  )}
                </div>
              )}

              {activeTab === 'installations' && (
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{t('admin.hr.details.installsHint', 'Field installation work orders assigned to {name}.', { name: employee.name })}</p>
                    <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAssignOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> {t('admin.hr.assignInstall.title', 'Assign Installation')}
                    </Button>
                  </div>
                  {installations.isLoading ? (
                    <Skeleton className="h-40 w-full rounded-lg" />
                  ) : installations.isError ? (
                    <EmptyState variant="error"
                      title={t('admin.hr.details.installsFailed', 'Failed to load installations')}
                      description={installations.error.message}
                      actionLabel={t('common.retry', 'Retry')}
                      onAction={() => installations.refetch()}
                    />
                  ) : installItems.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground">{t('admin.hr.details.noInstalls', 'No installations assigned yet.')}</div>
                  ) : (
                    <DataTable
                      columns={installationColumns}
                      data={installItems}
                      getRowId={(row) => row.id}
                      enableColumnVisibility={false}
                      enableLayoutToggle={false}
                      pageSizeOptions={[10, 20, 50]}
                      server={{
                        page: installPage,
                        pageSize: installPageSize,
                        total: installTotal,
                        onPageChange: setInstallPage,
                        onPageSizeChange: (size) => {
                          setInstallPageSize(size);
                          setInstallPage(1);
                        },
                      }}
                    />
                  )}
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
