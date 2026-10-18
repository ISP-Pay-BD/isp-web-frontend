'use client';

import { useState } from 'react';
import { LogIn, LogOut, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TablePagination } from '@/components/shared/TablePagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useTranslations } from '@/i18n/locale-context';
import type { Coordinates } from '@/lib/api/services/employee.service';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { geoErrorMessage, getCurrentPosition } from '@/features/employee/shared/lib/geolocation';
import { formatDay, formatDayTime, formatTime } from '@/features/employee/shared/lib/datetime';
import { statusLabel } from '@/features/employee/shared/lib/labels';
import { useEmployeeAttendance, usePunch } from '../hooks/use-employee-attendance';

function minutesBetween(from: string, to: string): number | null {
  const a = Date.parse(from.replace(' ', 'T'));
  const b = Date.parse(to.replace(' ', 'T'));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return Math.round((b - a) / 60000);
}

export function EmployeeAttendancePage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [locating, setLocating] = useState(false);
  const { data, isLoading, isError, error, refetch } = useEmployeeAttendance(page, pageSize);
  const summary = useEmployeeSummary();
  const { checkIn, checkOut } = usePunch();

  const today = summary.data;
  const canCheckOut = !!today?.checkedInToday && !today.checkedOutToday;
  const action = canCheckOut ? checkOut : checkIn;
  const label = canCheckOut
    ? t('employee.attendance.clockOut', 'Clock out')
    : today?.checkedOutToday
      ? t('employee.attendance.clockInAgain', 'Clock in again')
      : t('employee.attendance.clockIn', 'Clock in');
  const busy = locating || action.isPending;

  const submit = (coords?: Coordinates) =>
    action.mutate(coords, {
      onSuccess: () =>
        toast.success(canCheckOut ? t('employee.attendance.clockedOut', 'Clocked out') : t('employee.attendance.clockedIn', 'Clocked in')),
    });

  const punch = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      submit({ latitude: pos.latitude, longitude: pos.longitude });
    } catch (err) {
      toast.error(geoErrorMessage(err, t), {
        action: { label: t('employee.attendance.withoutGps', '{action} without GPS', { action: label }), onClick: () => submit() },
      });
    } finally {
      setLocating(false);
    }
  };

  const worked = (from: string, to: string) => {
    const mins = minutesBetween(from, to);
    return mins === null
      ? null
      : t('employee.attendance.worked', 'Worked {h}h {m}m', { h: Math.floor(mins / 60), m: mins % 60 });
  };

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('employee.attendance.loadFailed', 'Failed to load attendance')}
        description={error?.message}
        actionLabel={t('employee.common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const rows = data.items;
  const total = data.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employee.attendance.title', 'GPS attendance')}
        subtitle={t('employee.attendance.subtitle', 'Clock in/out with your device location')}
        breadcrumb={[{ label: t('employee.common.breadcrumb', 'Employee') }, { label: t('employee.attendance.breadcrumb', 'Attendance') }]}
        actions={
          <Button className="h-11 w-full sm:w-auto" onClick={punch} disabled={busy || summary.isLoading}>
            {canCheckOut ? <LogOut aria-hidden /> : <LogIn aria-hidden />}
            {locating
              ? t('employee.attendance.locating', 'Getting location…')
              : action.isPending
                ? t('employee.common.saving', 'Saving…')
                : label}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('employee.attendance.today', 'Today')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {summary.isError ? (
              <p className="text-destructive text-xs">{summary.error.message}</p>
            ) : !today ? (
              <p className="text-muted-foreground text-xs">{t('employee.common.loading', 'Loading…')}</p>
            ) : today.checkedInToday ? (
              <>
                <p>
                  {t('employee.attendance.in', 'In')}{' '}
                  <span className="font-mono font-semibold">{formatTime(today.todayCheckIn) || '—'}</span>
                  {today.checkedOutToday ? (
                    <>
                      {' '}· {t('employee.attendance.out', 'Out')}{' '}
                      <span className="font-mono font-semibold">{formatTime(today.todayCheckOut) || '—'}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {today.checkedOutToday
                    ? t('employee.attendance.shiftClosed', 'Shift closed')
                    : t('employee.attendance.onShift', 'On shift — remember to clock out')}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">{t('employee.attendance.notClockedIn', 'You have not clocked in today.')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Navigation className="h-3.5 w-3.5" aria-hidden /> {t('employee.attendance.lastLocation', 'Last recorded location')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {today?.lastLocation ? (
              <>
                <div className="font-medium text-foreground">{today.lastLocation.address || t('employee.attendance.gpsFix', 'GPS fix')}</div>
                <div className="font-mono">
                  {today.lastLocation.latitude.toFixed(5)}, {today.lastLocation.longitude.toFixed(5)}
                </div>
                <div>{formatDayTime(today.lastLocation.createdAt)}</div>
              </>
            ) : (
              <div>{t('employee.attendance.noLocation', 'No location recorded yet.')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {total === 0 ? (
        <EmptyState
          title={t('employee.attendance.empty', 'No punches yet')}
          description={t('employee.attendance.emptyHint', 'Clock in with GPS when you start your field shift.')}
          actionLabel={busy ? undefined : label}
          onAction={busy ? undefined : punch}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground tabular-nums">
            {total === 1
              ? t('employee.attendance.dayOne', '{n} attendance day', { n: total })
              : t('employee.attendance.dayMany', '{n} attendance days', { n: total })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => {
              const duration = r.checkIn && r.checkOut ? worked(r.checkIn, r.checkOut) : null;
              const status = r.status || 'present';
              return (
                <Card key={r.id} className="border-border/60 shadow-sm ring-1 ring-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="font-mono text-sm">{formatDay(r.date) || r.date}</span>
                      <StatusBadge status={status} label={statusLabel(t, status)} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {t('employee.attendance.in', 'In')}{' '}
                      <span className="font-mono text-foreground">{formatTime(r.checkIn) || '—'}</span> · {t('employee.attendance.out', 'Out')}{' '}
                      <span className="font-mono text-foreground">{formatTime(r.checkOut) || '—'}</span>
                    </div>
                    {duration ? <div>{duration}</div> : null}
                    {r.notes ? <div className="text-foreground">{r.notes}</div> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <TablePagination
            currentPage={data.meta.page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
