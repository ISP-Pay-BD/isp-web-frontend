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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Cable, Plus, Radio, ShieldCheck, Cpu, RotateCw, ListChecks, Pencil, Trash2, Clock, X } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  ACS_JOB_ACTIONS,
  useAcsDevices,
  useAcsJobs,
  useCancelAcsJob,
  useDeleteAcsDevice,
  useQueueAcsJob,
  useSaveAcsDevice,
  type AcsDevice,
  type AcsJobAction,
} from '../hooks/use-acs';
import type { CustomerOption } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { CustomerPicker, OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const ACTION_FALLBACK: Record<AcsJobAction, string> = {
  push_config: 'Push configuration',
  reboot: 'Reboot',
  factory_reset: 'Factory reset',
  firmware_upgrade: 'Firmware upgrade',
};

interface DeviceForm {
  serial: string;
  manufacturer: string;
  model: string;
  firmware: string;
  macAddress: string;
  customer: CustomerOption | null;
  notes: string;
}

const emptyForm: DeviceForm = { serial: '', manufacturer: '', model: '', firmware: '', macAddress: '', customer: null, notes: '' };

export function AcsPage() {
  const t = useTranslations();
  const actionLabel = (action: string) =>
    action in ACTION_FALLBACK ? t(`admin.ops.acs.action.${action}`, ACTION_FALLBACK[action as AcsJobAction]) : action;
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useAcsDevices({ page: table.page, pageSize: table.pageSize, search: table.search });
  const saveDevice = useSaveAcsDevice();
  const deleteDevice = useDeleteAcsDevice();
  const queueJob = useQueueAcsJob();
  const cancelJob = useCancelAcsJob();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcsDevice | null>(null);
  const [form, setForm] = useState<DeviceForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AcsDevice | null>(null);
  const [jobsDevice, setJobsDevice] = useState<AcsDevice | null>(null);
  const [jobAction, setJobAction] = useState<AcsJobAction>('push_config');
  const [params, setParams] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const jobs = useAcsJobs(jobsDevice?.id ?? null);

  const set = (patch: Partial<DeviceForm>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (d: AcsDevice) => {
    setEditing(d);
    setForm({
      serial: d.serial,
      manufacturer: d.manufacturer ?? '',
      model: d.model ?? '',
      firmware: d.firmware ?? '',
      macAddress: d.macAddress ?? '',
      customer: d.userId ? { id: d.userId, name: d.customerName ?? `#${d.userId}`, mobile: null, pppoeId: null } : null,
      notes: d.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveDevice.mutate(
      {
        id: editing?.id,
        body: {
          serial: form.serial,
          manufacturer: form.manufacturer || null,
          model: form.model || null,
          firmware: form.firmware || null,
          mac_address: form.macAddress || null,
          user_id: form.customer?.id ?? null,
          notes: form.notes || null,
        },
      },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  const handleQueue = (deviceId: string, action: AcsJobAction) => {
    const parameters = action === 'push_config' ? Object.fromEntries(params.filter((p) => p.key.trim() && p.value.trim()).map((p) => [p.key.trim(), p.value.trim()])) : undefined;
    queueJob.mutate({ deviceId, action, parameters }, { onSuccess: () => action === 'push_config' && setParams([{ key: '', value: '' }]) });
  };

  const columns: LegacyColumnDef<AcsDevice, unknown>[] = [
    {
      accessorKey: 'serial',
      header: t('admin.ops.acs.colSerial', 'CPE Serial / ID'),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Cable className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-foreground">{row.original.serial}</p>
            <p className="text-xs text-muted-foreground font-mono">{row.original.macAddress ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'manufacturer',
      header: t('admin.ops.acs.colManufacturer', 'Manufacturer'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{row.original.manufacturer ?? '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'model',
      header: t('admin.ops.acs.colModel', 'Model / Firmware'),
      cell: ({ row }) => (
        <div>
          <Badge variant="outline" className="font-mono text-xs border-border/70">
            {row.original.model ?? '—'}
          </Badge>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{row.original.firmware ?? '—'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: t('admin.ops.acs.colCustomer', 'Customer'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.customerName ?? '—'}</span>,
    },
    {
      accessorKey: 'lastInformAt',
      header: t('admin.ops.acs.colLastInform', 'Last Inform'),
      cell: ({ row }) =>
        row.original.lastInformAt ? (
          <span className="font-mono text-xs font-semibold text-foreground">{fmtDateTime(row.original.lastInformAt)}</span>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            {t('admin.ops.acs.neverInformedBadge', 'Never informed')}
          </Badge>
        ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const dev = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={queueJob.isPending} onClick={() => handleQueue(dev.id, 'reboot')} title={t('admin.ops.acs.rebootTitle', 'Queue a TR-069 reboot')}>
              <RotateCw className="h-3 w-3 text-amber-500" /> {t('admin.ops.acs.reboot', 'Reboot')}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setJobsDevice(dev)}>
              <ListChecks className="h-3 w-3" /> {t('admin.ops.acs.jobs', 'Jobs')}
              {dev.queuedJobs > 0 ? ` (${formatCount(dev.queuedJobs)})` : ''}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dev)} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(dev)} title={t('admin.ops.acs.remove', 'Remove')} aria-label={t('admin.ops.acs.remove', 'Remove')}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.acs.loadFailed', 'Failed to load ACS devices')}
        description={errorMessage(error)}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const summary = data?.summary;
  const kpis = [
    { label: t('admin.ops.acs.kpiManaged', 'Managed CPEs'), value: formatCount(summary?.total ?? 0), hint: t('admin.ops.acs.kpiManagedHint', 'Registered TR-069 routers'), icon: Cable, tone: 'text-primary', text: 'text-foreground' },
    { label: t('admin.ops.acs.kpiInformed', 'Informed (24h)'), value: `${formatCount(summary?.informed24h ?? 0)} / ${formatCount(summary?.total ?? 0)}`, hint: t('admin.ops.acs.kpiInformedHint', 'Sent an inform in the last day'), icon: ShieldCheck, tone: 'text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('admin.ops.acs.kpiNever', 'Never Informed'), value: formatCount(summary?.neverInformed ?? 0), hint: t('admin.ops.acs.kpiNeverHint', 'No CWMP inform recorded yet'), icon: Radio, tone: 'text-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: t('admin.ops.acs.kpiQueued', 'Queued Jobs'), value: formatCount(summary?.queuedJobs ?? 0), hint: t('admin.ops.acs.kpiQueuedHint', 'Waiting for the ACS worker'), icon: Clock, tone: 'text-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.acs.title', 'ACS / TR-069 Auto Configuration Server')}
        subtitle={t('admin.ops.acs.subtitle', 'Customer CPE registry and queued TR-069 configuration jobs')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.network', 'Network') },
          { label: t('nav.acs', 'ACS / TR-069') },
        ]}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t('admin.ops.acs.register', 'Register CPE')}
          </Button>
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

      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.acs.searchPlaceholder', 'Search by serial, manufacturer, model, firmware or MAC...')}
        emptyTitle={table.search ? t('admin.ops.acs.emptyFiltered', 'No CPEs match your search') : t('admin.ops.acs.emptyNone', 'No CPEs registered')}
        emptyDescription={t('admin.ops.acs.emptyHint', 'Register a customer router to manage it over TR-069.')}
        server={table.server(data?.meta.total ?? 0)}
      />

      {/* Register / edit CPE */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? t('admin.ops.acs.editTitle', 'Edit CPE') : t('admin.ops.acs.registerTitle', 'Register Customer CPE Router')}</DialogTitle>
            <DialogDescription>{t('admin.ops.acs.registerDesc', 'Record a customer router so TR-069 jobs can be queued for it.')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="serial">{t('admin.ops.acs.fieldSerial', 'Serial Number *')}</Label>
              <Input id="serial" value={form.serial} onChange={(e) => set({ serial: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">{t('admin.ops.acs.colManufacturer', 'Manufacturer')}</Label>
                <Input id="manufacturer" value={form.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">{t('admin.ops.acs.fieldModel', 'Model')}</Label>
                <Input id="model" value={form.model} onChange={(e) => set({ model: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firmware">{t('admin.ops.acs.fieldFirmware', 'Firmware')}</Label>
                <Input id="firmware" value={form.firmware} onChange={(e) => set({ firmware: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mac">{t('admin.ops.acs.fieldMac', 'MAC Address')}</Label>
                <Input id="mac" value={form.macAddress} onChange={(e) => set({ macAddress: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acs-customer">{t('admin.ops.acs.colCustomer', 'Customer')}</Label>
              <CustomerPicker id="acs-customer" value={form.customer} onChange={(c) => set({ customer: c })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acs-notes">{t('admin.ops.acs.fieldNotes', 'Notes')}</Label>
              <Textarea id="acs-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={saveDevice.isPending}>
                {saveDevice.isPending
                  ? t('admin.ops.acs.saving', 'Saving…')
                  : editing
                    ? t('common.save', 'Save')
                    : t('admin.ops.acs.registerDevice', 'Register Device')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Jobs drawer */}
      <Sheet open={!!jobsDevice} onOpenChange={(open) => !open && setJobsDevice(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-5">
          {jobsDevice && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{jobsDevice.serial}</SheetTitle>
                <SheetDescription>
                  {[jobsDevice.manufacturer, jobsDevice.model].filter(Boolean).join(' ') || 'CPE'} · {jobsDevice.customerName ?? t('admin.ops.acs.noCustomer', 'No customer')}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 rounded-lg border border-border/70 p-4">
                <Label>{t('admin.ops.acs.queueJob', 'Queue a job')}</Label>
                <OptionSelect
                  value={jobAction}
                  onChange={(v) => setJobAction((v || 'push_config') as AcsJobAction)}
                  options={ACS_JOB_ACTIONS.map((a) => ({ value: a, label: actionLabel(a) }))}
                  placeholder={t('admin.ops.acs.actionPlaceholder', 'Action')}
                />
                {jobAction === 'push_config' && (
                  <div className="space-y-2">
                    {params.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder={t('admin.ops.acs.paramPlaceholder', 'TR-069 parameter')}
                          aria-label={t('admin.ops.acs.paramPlaceholder', 'TR-069 parameter')}
                          value={p.key}
                          onChange={(e) => setParams((ps) => ps.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))}
                          className="h-9 text-xs font-mono"
                        />
                        <Input
                          placeholder={t('admin.ops.acs.valuePlaceholder', 'Value')}
                          aria-label={t('admin.ops.acs.valuePlaceholder', 'Value')}
                          value={p.value}
                          onChange={(e) => setParams((ps) => ps.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                          className="h-9 text-xs"
                        />
                        <Button type="button" variant="ghost" size="icon" aria-label={t('admin.ops.acs.removeParam', 'Remove parameter')} className="h-9 w-9" disabled={params.length === 1} onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setParams((ps) => [...ps, { key: '', value: '' }])}>
                      <Plus className="h-3 w-3 mr-1" /> {t('admin.ops.acs.addParam', 'Parameter')}
                    </Button>
                  </div>
                )}
                <Button className="w-full" disabled={queueJob.isPending} onClick={() => handleQueue(jobsDevice.id, jobAction)}>
                  {queueJob.isPending ? t('admin.ops.acs.queuing', 'Queuing…') : t('admin.ops.acs.queueJobButton', 'Queue job')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.ops.acs.jobHistory', 'Job history')}</Label>
                {jobs.isLoading ? (
                  <p className="text-xs text-muted-foreground">{t('admin.ops.acs.loading', 'Loading…')}</p>
                ) : jobs.isError ? (
                  <p className="text-xs text-destructive">{errorMessage(jobs.error)}</p>
                ) : (jobs.data?.items ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t('admin.ops.acs.noJobs', 'No jobs queued for this CPE.')}</p>
                ) : (
                  jobs.data?.items.map((j) => (
                    <div key={j.id} className="flex items-start justify-between gap-2 rounded-lg border border-border/60 p-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{actionLabel(j.action)}</p>
                        {Object.keys(j.parameters).length > 0 && (
                          <p className="font-mono text-xs text-muted-foreground break-all">
                            {Object.entries(j.parameters).map(([k, v]) => `${k}=${v}`).join(', ')}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('admin.ops.acs.queuedAt', 'Queued {date}', { date: fmtDateTime(j.createdAt) })}
                          {j.processedAt ? ` · ${t('admin.ops.acs.processedAt', 'processed {date}', { date: fmtDateTime(j.processedAt) })}` : ''}
                        </p>
                        {j.result && <p className="text-xs text-foreground/80">{j.result}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant="outline" className="capitalize text-xs">
                          {t(`status.${j.status}`, j.status)}
                        </Badge>
                        {j.status === 'queued' && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" disabled={cancelJob.isPending} onClick={() => cancelJob.mutate(j.id)}>
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.ops.acs.removeTitle', 'Remove CPE')}
        description={t('admin.ops.acs.removeDesc', 'Remove {serial} from the registry? Its queued jobs are dropped.', { serial: deleteTarget?.serial ?? '' })}
        confirmLabel={t('admin.ops.acs.remove', 'Remove')}
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteDevice.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
