'use client';

import { useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CalendarClock, CheckCircle2, Pencil, Plus, Router, ServerCrash, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  NOC_STATUSES,
  useDeleteNocIncident,
  useNocIncidents,
  useNocSummary,
  useSaveNocIncident,
  type NocIncident,
  type NocKind,
  type NocSeverity,
} from '../hooks/use-noc';
import { useNetOpsOptions, type PickOption } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect, fmtDateTime } from '../components/NetOpsControls';
import { useTranslations } from '@/i18n/locale-context';

import { formatCount } from '@/lib/format';
const severityClass: Record<NocSeverity, string> = {
  minor: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  major: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
};
const stateClass: Record<string, string> = {
  online: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  offline: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  unknown: 'bg-muted text-muted-foreground',
};

function useNocLabels() {
  const t = useTranslations();
  return {
    kind: (v: NocKind) =>
      v === 'maintenance' ? t('admin.ops.noc.kind.maintenance', 'Maintenance') : t('admin.ops.noc.kind.incident', 'Incident'),
    severity: (v: NocSeverity) => {
      if (v === 'critical') return t('admin.ops.noc.severity.critical', 'Critical');
      if (v === 'major') return t('admin.ops.noc.severity.major', 'Major');
      return t('admin.ops.noc.severity.minor', 'Minor');
    },
    status: (v: string) => {
      switch (v) {
        case 'investigating':
          return t('admin.ops.noc.status.investigating', 'Investigating');
        case 'identified':
          return t('admin.ops.noc.status.identified', 'Identified');
        case 'monitoring':
          return t('admin.ops.noc.status.monitoring', 'Monitoring');
        case 'resolved':
          return t('admin.ops.noc.status.resolved', 'Resolved');
        case 'scheduled':
          return t('admin.ops.noc.status.scheduled', 'Scheduled');
        case 'in_progress':
          return t('admin.ops.noc.status.inProgress', 'In progress');
        case 'completed':
          return t('admin.ops.noc.status.completed', 'Completed');
        case 'cancelled':
          return t('admin.ops.noc.status.cancelled', 'Cancelled');
        default:
          return v.replace(/_/g, ' ');
      }
    },
    routerState: (v: string) => {
      if (v === 'online') return t('status.online', 'Online');
      if (v === 'offline') return t('status.offline', 'Offline');
      return t('admin.ops.noc.state.unknown', 'Unknown');
    },
  };
}
/** "2026-10-11 09:30:00" ⇄ datetime-local "2026-10-11T09:30". */
const toLocalInput = (v: string | null) => (v ? v.slice(0, 16).replace(' ', 'T') : '');

interface IncidentForm {
  kind: NocKind;
  title: string;
  description: string;
  severity: NocSeverity;
  status: string;
  routerIds: string[];
  areaIds: string[];
  startsAt: string;
  endsAt: string;
}

function ToggleChips({ options, value, onChange }: { options: PickOption[]; value: string[]; onChange: (v: string[]) => void }) {
  const t = useTranslations();
  if (options.length === 0) return <p className="text-xs text-muted-foreground">{t('admin.ops.noc.noneAvailable', 'None available.')}</p>;
  return (
    <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs',
              on ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 hover:bg-accent',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function NocPage() {
  const t = useTranslations();
  const labels = useNocLabels();
  const table = useServerTable();
  const [statusFilter, setStatusFilter] = useState('open');
  const { data, isLoading, isError, error, refetch } = useNocIncidents({ page: table.page, pageSize: table.pageSize, search: table.search, status: statusFilter });
  const summary = useNocSummary();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NocIncident | null>(null);
  const [form, setForm] = useState<IncidentForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NocIncident | null>(null);
  const options = useNetOpsOptions(modalOpen);
  const save = useSaveNocIncident();
  const remove = useDeleteNocIncident();

  const set = (patch: Partial<IncidentForm>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const openCreate = (kind: NocKind) => {
    setEditing(null);
    setForm({ kind, title: '', description: '', severity: 'minor', status: NOC_STATUSES[kind][0], routerIds: [], areaIds: [], startsAt: '', endsAt: '' });
    setModalOpen(true);
  };

  const openEdit = (i: NocIncident) => {
    setEditing(i);
    setForm({
      kind: i.kind,
      title: i.title,
      description: i.description ?? '',
      severity: i.severity,
      status: i.status,
      routerIds: i.routerIds,
      areaIds: i.areaIds,
      startsAt: toLocalInput(i.startsAt),
      endsAt: toLocalInput(i.endsAt),
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    save.mutate(
      {
        id: editing?.id,
        body: {
          kind: form.kind,
          title: form.title,
          description: form.description || null,
          severity: form.severity,
          status: form.status,
          router_ids: form.routerIds.map(Number),
          area_ids: form.areaIds.map(Number),
          ...(form.startsAt ? { starts_at: form.startsAt.replace('T', ' ') } : {}),
          ends_at: form.endsAt ? form.endsAt.replace('T', ' ') : null,
        },
      },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  const closeOut = (i: NocIncident) => save.mutate({ id: i.id, body: { status: i.kind === 'maintenance' ? 'completed' : 'resolved' } });

  const columns: LegacyColumnDef<NocIncident, unknown>[] = [
    {
      accessorKey: 'title',
      header: t('admin.ops.noc.colIncident', 'Incident / Window'),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            {row.original.kind === 'maintenance' ? <CalendarClock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{row.original.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{labels.kind(row.original.kind)}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'severity',
      header: t('admin.ops.noc.colSeverity', 'Severity'),
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('capitalize text-xs', severityClass[row.original.severity])}>
          {labels.severity(row.original.severity)}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: t('admin.customers.list.statusLabel', 'Status'),
      cell: ({ row }) => (
        <Badge variant="outline" tone={row.original.isOpen ? undefined : 'success'} className="capitalize text-xs">
          {labels.status(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'scope',
      header: t('admin.ops.noc.colAffected', 'Affected'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{[...row.original.routers, ...row.original.areas].join(', ') || '—'}</span>
      ),
    },
    {
      accessorKey: 'startsAt',
      header: t('admin.ops.noc.colWindow', 'Start → End'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {fmtDateTime(row.original.startsAt)} → {fmtDateTime(row.original.endsAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.original.isOpen && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={save.isPending} onClick={() => closeOut(row.original)}>
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {row.original.kind === 'maintenance' ? t('admin.ops.noc.complete', 'Complete') : t('admin.ops.noc.resolve', 'Resolve')}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row.original)} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.noc.loadFailed', 'Failed to load NOC incidents')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const s = summary.data;
  const kpis = [
    { label: t('admin.ops.noc.kpiOnline', 'Routers Online'), value: s ? `${s.routers.online} / ${s.routers.total}` : '—', hint: s ? t('admin.ops.noc.neverPolledCount', '{n} never polled', { n: s.routers.unknown }) : t('common.loading', 'Loading…'), icon: Router, tone: 'text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('admin.ops.noc.kpiUnreachable', 'Unreachable'), value: s?.routers.offline ?? '—', hint: t('admin.ops.noc.kpiUnreachableHint', 'Offline at the last poll'), icon: ServerCrash, tone: 'text-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: t('admin.ops.noc.kpiSessions', 'Active Sessions'), value: s ? formatCount(s.routers.activeSessions) : '—', hint: t('admin.ops.noc.kpiSessionsHint', 'From the last router poll'), icon: Users, tone: 'text-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    {
      label: t('admin.ops.noc.kpiOpen', 'Open Incidents'),
      value: s?.incidents.open ?? '—',
      hint: s
        ? t('admin.ops.noc.kpiOpenHint', '{critical} critical · {live} maintenance live · {upcoming} upcoming', {
            critical: s.incidents.bySeverity.critical,
            live: s.maintenance.inProgress,
            upcoming: s.maintenance.upcoming,
          })
        : t('common.loading', 'Loading…'), icon: AlertTriangle, tone: 'text-amber-500', text: 'text-foreground' },
  ];
  const statusOptions = form ? NOC_STATUSES[form.kind].map((v) => ({ value: v, label: labels.status(v) })) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.noc.title', 'NOC — Incidents & Maintenance')}
        subtitle={t('admin.ops.noc.subtitle', 'Track network incidents and maintenance windows against live router health')}
        breadcrumb={[{ label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' }, { label: t('common.crumb.network', 'Network') }, { label: 'NOC' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openCreate('maintenance')}>
              <CalendarClock className="h-4 w-4 mr-1.5" />
              {t('admin.ops.noc.scheduleMaintenance', 'Schedule Maintenance')}
            </Button>
            <Button size="sm" onClick={() => openCreate('incident')}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.ops.noc.reportIncident', 'Report Incident')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.tone}`} />
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-bold tabular-nums ${k.text}`}>{k.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{k.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {summary.isError ? (
        <EmptyState
          title={t('admin.ops.noc.healthUnavailable', 'Router health unavailable')}
          description={errorMessage(summary.error)}
          actionLabel={t('admin.customers.list.retry', 'Retry')}
          onAction={() => summary.refetch()}
        />
      ) : s && s.routers.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {s.routers.items.map((r) => (
            <div key={r.id} className="rounded-lg border border-border/60 bg-card/60 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground truncate">{r.name}</span>
                <Badge variant="outline" className={cn('capitalize text-xs', stateClass[r.state])}>
                  {labels.routerState(r.state)}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                {r.activeSessions === null
                  ? t('admin.ops.noc.neverPolled', 'Never polled')
                  : t('admin.ops.noc.sessions', '{active} / {total} sessions', { active: r.activeSessions, total: r.totalSessions ?? 0 })}
                {!r.enabled && ` · ${t('admin.ops.noc.disabled', 'disabled')}`}
              </p>
              {r.lastPolledAt && <p className="text-xs text-muted-foreground font-mono">{t('admin.ops.noc.polled', 'Polled {time}', { time: fmtDateTime(r.lastPolledAt) })}</p>}
            </div>
          ))}
        </div>
      ) : null}

      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.noc.searchPlaceholder', 'Search incidents...')}
        emptyTitle={statusFilter === 'open' ? t('admin.ops.noc.emptyOpen', 'No open incidents or maintenance') : t('admin.ops.noc.emptyNone', 'Nothing recorded')}
        toolbarActions={
          <OptionSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              table.setPage(1);
            }}
            options={[
              { value: 'open', label: t('status.open', 'Open') },
              { value: 'closed', label: t('status.closed', 'Closed') },
            ]}
            placeholder={t('admin.customers.list.pillAll', 'All')}
            noneLabel={t('admin.customers.list.pillAll', 'All')}
            className="h-8 w-[120px] text-xs"
          />
        }
        server={table.server(data?.meta.total ?? 0)}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t('common.edit', 'Edit')
                : form?.kind === 'maintenance'
                  ? t('admin.ops.noc.scheduleWindow', 'Schedule Maintenance Window')
                  : t('admin.ops.noc.reportIncident', 'Report Incident')}
            </DialogTitle>
            <DialogDescription>{t('admin.ops.noc.formDesc', 'Affected routers and areas come from your network inventory.')}</DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="noc-title">{t('admin.ops.noc.fieldTitle', 'Title *')}</Label>
                <Input id="noc-title" value={form.title} onChange={(e) => set({ title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="noc-severity">{t('admin.ops.noc.colSeverity', 'Severity')}</Label>
                  <OptionSelect
                    id="noc-severity"
                    value={form.severity}
                    onChange={(v) => set({ severity: (v || 'minor') as NocSeverity })}
                    options={(['minor', 'major', 'critical'] as const).map((v) => ({ value: v, label: labels.severity(v) }))}
                    placeholder={t('admin.ops.noc.colSeverity', 'Severity')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="noc-status">{t('admin.customers.list.statusLabel', 'Status')}</Label>
                  <OptionSelect id="noc-status" value={form.status} onChange={(v) => set({ status: v })} options={statusOptions} placeholder={t('admin.customers.list.statusLabel', 'Status')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="noc-start">
                    {t('admin.ops.noc.fieldStarts', 'Starts')}
                    {form.kind === 'maintenance' ? ' *' : ''}
                  </Label>
                  <Input id="noc-start" type="datetime-local" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} required={form.kind === 'maintenance'} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="noc-end">{t('admin.ops.noc.fieldEnds', 'Ends')}</Label>
                  <Input id="noc-end" type="datetime-local" value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.ops.noc.affectedRouters', 'Affected routers')}</Label>
                <ToggleChips options={options.data?.routers ?? []} value={form.routerIds} onChange={(v) => set({ routerIds: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.ops.noc.affectedAreas', 'Affected areas')}</Label>
                <ToggleChips options={options.data?.areas ?? []} value={form.areaIds} onChange={(v) => set({ areaIds: v })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="noc-desc">{t('admin.ops.noc.fieldDescription', 'Description')}</Label>
                <Textarea id="noc-desc" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? t('admin.ops.noc.saving', 'Saving…') : t('common.save', 'Save')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.ops.noc.deleteTitle', 'Delete record')}
        description={t('admin.ops.noc.deleteDesc', 'Delete "{title}"?', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
