'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, CheckCircle2, MapPin, Phone, Play, StickyNote } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { formatBdPhone } from '@/lib/format';
import { useUrlParam } from '@/hooks/use-url-state';
import { useTranslations } from '@/i18n/locale-context';
import { geoErrorMessage, getCurrentPosition } from '@/features/employee/shared/lib/geolocation';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import { INSTALLATION_TONE, statusLabel } from '@/features/employee/shared/lib/labels';
import type { EmployeeInstallation } from '@/features/employee/shared/types';
import { useInstallationActions, useMyInstallations } from '../hooks/use-my-installations';

const FILTERS = ['open', 'completed', 'cancelled', 'all'] as const;
type Filter = (typeof FILTERS)[number];

/** Employee portal — installation work orders assigned to me: start, complete with GPS. */
export function EmployeeInstallationsPage() {
  const t = useTranslations();
  const [filterParam, setFilterParam] = useUrlParam('status');
  const status: Filter = (FILTERS as readonly string[]).includes(filterParam) ? (filterParam as Filter) : 'open';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [completing, setCompleting] = useState<EmployeeInstallation | null>(null);
  const [notes, setNotes] = useState('');
  const [locatingId, setLocatingId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useMyInstallations(page, pageSize, status);
  const { start, complete } = useInstallationActions();

  const filterItems: Record<Filter, string> = {
    open: t('employee.installations.filter.open', 'Open jobs'),
    completed: t('employee.installations.filter.completed', 'Completed'),
    cancelled: t('employee.installations.filter.cancelled', 'Cancelled'),
    all: t('employee.installations.filter.all', 'All jobs'),
  };

  const startJob = async (job: EmployeeInstallation) => {
    setLocatingId(job.id);
    // GPS is optional when starting; a fix is recorded on the track when available.
    const coords = await getCurrentPosition().catch(() => undefined);
    setLocatingId(null);
    start.mutate(
      { id: job.id, coords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined },
      { onSuccess: () => toast.success(t('employee.installations.started', 'Started “{title}”', { title: job.title })) },
    );
  };

  const completeJob = async () => {
    if (!completing) return;
    const job = completing;
    setLocatingId(job.id);
    try {
      const pos = await getCurrentPosition();
      complete.mutate(
        { id: job.id, coords: { latitude: pos.latitude, longitude: pos.longitude }, notes },
        {
          onSuccess: () => {
            toast.success(
              t('employee.installations.completedToast', 'Installation completed (±{accuracy}m GPS)', { accuracy: pos.accuracy }),
            );
            setCompleting(null);
            setNotes('');
          },
        },
      );
    } catch (err) {
      toast.error(geoErrorMessage(err, t));
    } finally {
      setLocatingId(null);
    }
  };

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('employee.installations.loadFailed', 'Failed to load installations')}
        description={error?.message}
        actionLabel={t('employee.common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const jobs = data.items;
  const total = data.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employee.installations.title', 'My Installations')}
        subtitle={t('employee.installations.subtitle', 'Assigned install jobs — start on site and complete with your GPS location')}
        breadcrumb={[
          { label: t('employee.common.breadcrumb', 'Employee') },
          { label: t('employee.installations.breadcrumb', 'Installations') },
        ]}
        actions={
          <Select
            items={filterItems}
            value={status}
            onValueChange={(v) => {
              setFilterParam(v && v !== 'open' ? String(v) : '');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full text-sm data-[size=default]:h-11 sm:w-[170px]" aria-label={t('employee.installations.filterLabel', 'Filter installations')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((value) => (
                <SelectItem key={value} value={value} className="min-h-11">
                  {filterItems[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          title={
            status === 'open'
              ? t('employee.installations.emptyOpen', 'No open installations')
              : t('employee.installations.empty', 'No installations found')
          }
          description={t('employee.installations.emptyHint', 'Installation jobs your admin assigns to you will appear here.')}
          actionLabel={t('employee.common.refresh', 'Refresh')}
          onAction={() => refetch()}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground tabular-nums">
            {t('employee.installations.count', '{n} installations', { n: total })}
          </p>
          <div className="space-y-3">
            {jobs.map((j) => {
              const busy = locatingId === j.id || (start.isPending && start.variables?.id === j.id);
              const hasMap = j.latitude !== null && j.longitude !== null;
              const canAct = j.status === 'assigned' || j.status === 'in_progress';
              return (
                <Card key={j.id} className="border-border/60">
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold break-words">{j.title}</CardTitle>
                      {j.customerName ? <p className="text-muted-foreground mt-1 text-sm break-words">{j.customerName}</p> : null}
                    </div>
                    <StatusBadge
                      status={j.status}
                      label={statusLabel(t, j.status)}
                      tone={INSTALLATION_TONE[j.status]}
                      className="shrink-0"
                    />
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <div className="min-w-0">
                        <p className="break-words">{j.address || '—'}</p>
                        {hasMap ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${j.latitude},${j.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                          >
                            {t('employee.installations.openMap', 'Open map')}
                          </a>
                        ) : null}
                      </div>
                    </div>
                    {j.customerMobile ? (
                      <a
                        href={`tel:${j.customerMobile.replace(/\s+/g, '')}`}
                        className="text-primary flex min-h-11 items-center gap-2 tabular-nums underline-offset-4 hover:underline"
                      >
                        <Phone className="h-4 w-4 shrink-0" aria-hidden />
                        {formatBdPhone(j.customerMobile)}
                      </a>
                    ) : null}
                    {j.scheduledAt ? (
                      <div className="flex items-start gap-2">
                        <CalendarClock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{t('employee.installations.scheduled', 'Scheduled {when}', { when: formatDayTime(j.scheduledAt) })}</span>
                      </div>
                    ) : null}
                    {j.notes ? (
                      <div className="flex items-start gap-2">
                        <StickyNote className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span className="break-words">{j.notes}</span>
                      </div>
                    ) : null}
                    {j.completedAt ? (
                      <p className="text-muted-foreground break-words">
                        {t('employee.installations.completedAt', 'Completed {when}', { when: formatDayTime(j.completedAt) })}
                        {j.completionNotes ? ` — ${j.completionNotes}` : ''}
                      </p>
                    ) : null}
                  </CardContent>
                  {canAct ? (
                    <CardFooter className="flex-col items-stretch gap-2">
                      {j.status === 'assigned' ? (
                        <Button className="h-11 w-full" disabled={busy} onClick={() => startJob(j)}>
                          <Play aria-hidden />
                          {busy ? t('employee.installations.starting', 'Starting…') : t('employee.installations.start', 'Start')}
                        </Button>
                      ) : null}
                      <Button
                        variant={j.status === 'assigned' ? 'outline' : 'default'}
                        className="h-11 w-full"
                        onClick={() => setCompleting(j)}
                      >
                        <CheckCircle2 aria-hidden />
                        {t('employee.installations.complete', 'Complete')}
                      </Button>
                    </CardFooter>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {total > 0 ? (
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
      ) : null}

      <Dialog open={!!completing} onOpenChange={(open) => !open && setCompleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employee.installations.dialogTitle', 'Complete installation')}</DialogTitle>
            <DialogDescription>
              {t('employee.installations.dialogDescription', 'Your current GPS location is recorded as the completion point for “{title}”.', {
                title: completing?.title ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="completion-notes">{t('employee.installations.notesLabel', 'Completion notes')}</Label>
            <Textarea
              id="completion-notes"
              rows={3}
              maxLength={1000}
              placeholder={t('employee.installations.notesPlaceholder', 'ONU serial, signal level, anything HR should know…')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-11 sm:h-8" onClick={() => setCompleting(null)}>
              {t('employee.common.cancel', 'Cancel')}
            </Button>
            <Button className="h-11 sm:h-8" onClick={completeJob} disabled={!!locatingId || complete.isPending}>
              {locatingId
                ? t('employee.installations.locating', 'Getting location…')
                : complete.isPending
                  ? t('employee.common.saving', 'Saving…')
                  : t('employee.installations.captureComplete', 'Capture GPS & complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
