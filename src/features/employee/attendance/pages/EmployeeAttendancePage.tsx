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
import type { Coordinates } from '@/lib/api/services/employee.service';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { getCurrentPosition } from '@/features/employee/shared/lib/geolocation';
import { formatDay, formatDayTime, formatTime } from '@/features/employee/shared/lib/datetime';
import { useEmployeeAttendance, usePunch } from '../hooks/use-employee-attendance';

function duration(from: string, to: string): string {
  const a = Date.parse(from.replace(' ', 'T'));
  const b = Date.parse(to.replace(' ', 'T'));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return '';
  const mins = Math.round((b - a) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function EmployeeAttendancePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [locating, setLocating] = useState(false);
  const { data, isLoading, isError, error, refetch } = useEmployeeAttendance(page, pageSize);
  const summary = useEmployeeSummary();
  const { checkIn, checkOut } = usePunch();

  const today = summary.data;
  const canCheckOut = !!today?.checkedInToday && !today.checkedOutToday;
  const action = canCheckOut ? checkOut : checkIn;
  const label = canCheckOut ? 'Clock out' : today?.checkedOutToday ? 'Clock in again' : 'Clock in';
  const busy = locating || action.isPending;

  const submit = (coords?: Coordinates) =>
    action.mutate(coords, {
      onSuccess: () => toast.success(canCheckOut ? 'Clocked out' : 'Clocked in'),
    });

  const punch = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      submit({ latitude: pos.latitude, longitude: pos.longitude });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not determine your location.', {
        action: { label: `${label} without GPS`, onClick: () => submit() },
      });
    } finally {
      setLocating(false);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load attendance" description={error?.message} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.items;
  const total = data.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS attendance"
        subtitle="Clock in/out with your device location"
        breadcrumb={[{ label: 'Employee' }, { label: 'Attendance' }]}
        actions={
          <Button size="sm" onClick={punch} disabled={busy || summary.isLoading}>
            {canCheckOut ? <LogOut className="mr-1.5 h-3.5 w-3.5" /> : <LogIn className="mr-1.5 h-3.5 w-3.5" />}
            {locating ? 'Getting location…' : action.isPending ? 'Saving…' : label}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {summary.isError ? (
              <p className="text-destructive text-xs">{summary.error.message}</p>
            ) : !today ? (
              <p className="text-muted-foreground text-xs">Loading…</p>
            ) : today.checkedInToday ? (
              <>
                <p>
                  In <span className="font-mono font-semibold">{formatTime(today.todayCheckIn) || '—'}</span>
                  {today.checkedOutToday ? (
                    <>
                      {' '}· Out <span className="font-mono font-semibold">{formatTime(today.todayCheckOut) || '—'}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {today.checkedOutToday ? 'Shift closed' : 'On shift — remember to clock out'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">You have not clocked in today.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Navigation className="h-3.5 w-3.5" /> Last recorded location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {today?.lastLocation ? (
              <>
                <div className="font-medium text-foreground">{today.lastLocation.address || 'GPS fix'}</div>
                <div className="font-mono">
                  {today.lastLocation.latitude.toFixed(5)}, {today.lastLocation.longitude.toFixed(5)}
                </div>
                <div>{formatDayTime(today.lastLocation.createdAt)}</div>
              </>
            ) : (
              <div>No location recorded yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No punches yet"
          description="Clock in with GPS when you start your field shift."
          actionLabel={busy ? undefined : label}
          onAction={busy ? undefined : punch}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground tabular-nums">{total} attendance day{total === 1 ? '' : 's'}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <Card key={r.id} className="border-border/60 shadow-sm ring-1 ring-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="font-mono text-sm">{formatDay(r.date) || r.date}</span>
                    <StatusBadge status={r.status || 'present'} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    In <span className="font-mono text-foreground">{formatTime(r.checkIn) || '—'}</span> · Out{' '}
                    <span className="font-mono text-foreground">{formatTime(r.checkOut) || '—'}</span>
                  </div>
                  {r.checkIn && r.checkOut ? <div>Worked {duration(r.checkIn, r.checkOut)}</div> : null}
                  {r.notes ? <div className="text-foreground">{r.notes}</div> : null}
                </CardContent>
              </Card>
            ))}
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
