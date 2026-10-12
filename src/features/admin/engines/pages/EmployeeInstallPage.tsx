'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, MapPin, Play } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getCurrentPosition } from '@/features/employee/shared/lib/geolocation';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import type { EmployeeInstallation, InstallationStatus } from '@/features/employee/shared/types';
import { useInstallationActions, useMyInstallations } from '@/features/employee/installations/hooks/use-my-installations';

const STATUS_LABEL: Record<InstallationStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const FILTER_ITEMS = { open: 'Open jobs', completed: 'Completed', cancelled: 'Cancelled', all: 'All jobs' };

/** Employee portal — installation work orders assigned to me: start, complete with GPS. */
export function EmployeeInstallPage() {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [completing, setCompleting] = useState<EmployeeInstallation | null>(null);
  const [notes, setNotes] = useState('');
  const [locatingId, setLocatingId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useMyInstallations(page, pageSize, status);
  const { start, complete } = useInstallationActions();

  const startJob = async (job: EmployeeInstallation) => {
    setLocatingId(job.id);
    // GPS is optional when starting; a fix is recorded on the track when available.
    const coords = await getCurrentPosition().catch(() => undefined);
    setLocatingId(null);
    start.mutate(
      { id: job.id, coords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined },
      { onSuccess: () => toast.success(`Started “${job.title}”`) },
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
            toast.success(`Installation completed (±${pos.accuracy}m GPS)`);
            setCompleting(null);
            setNotes('');
          },
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not determine your location.');
    } finally {
      setLocatingId(null);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load installations" description={error?.message} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const jobs = data.items;
  const total = data.meta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Installations"
        subtitle="Assigned install jobs — start on site and complete with your GPS location"
        breadcrumb={[
          { label: 'Profile', url: '/employee/profile' },
          { label: 'Installations' },
        ]}
        actions={
          <Select
            items={FILTER_ITEMS}
            value={status}
            onValueChange={(v) => {
              setStatus(v ? String(v) : 'open');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          title={status === 'open' ? 'No open installations' : 'No installations found'}
          description="Installation jobs your admin assigns to you will appear here."
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const busy = locatingId === j.id || (start.isPending && start.variables?.id === j.id);
                return (
                  <tr key={j.id} className="border-t border-border/40 align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {[j.customerName, j.customerMobile].filter(Boolean).join(' · ')}
                      </div>
                      <div className="text-xs text-muted-foreground">{j.address || '—'}</div>
                      {j.scheduledAt ? (
                        <div className="text-xs text-muted-foreground">Scheduled {formatDayTime(j.scheduledAt)}</div>
                      ) : null}
                      {j.notes ? <div className="text-xs text-foreground/80">{j.notes}</div> : null}
                      {j.completedAt ? (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          Completed {formatDayTime(j.completedAt)}
                          {j.completionNotes ? ` — ${j.completionNotes}` : ''}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{STATUS_LABEL[j.status]}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {j.latitude !== null && j.longitude !== null ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            render={
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${j.latitude},${j.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <MapPin className="mr-1 h-3.5 w-3.5" /> Map
                          </Button>
                        ) : null}
                        {j.status === 'assigned' ? (
                          <Button size="sm" variant="secondary" disabled={busy} onClick={() => startJob(j)}>
                            <Play className="mr-1 h-3.5 w-3.5" /> {busy ? 'Starting…' : 'Start'}
                          </Button>
                        ) : null}
                        {j.status === 'assigned' || j.status === 'in_progress' ? (
                          <Button size="sm" onClick={() => setCompleting(j)}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
            <DialogTitle>Complete installation</DialogTitle>
            <DialogDescription>
              Your current GPS location is recorded as the completion point for “{completing?.title}”.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="completion-notes">Completion notes</Label>
            <Textarea
              id="completion-notes"
              rows={3}
              maxLength={1000}
              placeholder="ONU serial, signal level, anything HR should know…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleting(null)}>
              Cancel
            </Button>
            <Button onClick={completeJob} disabled={!!locatingId || complete.isPending}>
              {locatingId ? 'Getting location…' : complete.isPending ? 'Saving…' : 'Capture GPS & complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
