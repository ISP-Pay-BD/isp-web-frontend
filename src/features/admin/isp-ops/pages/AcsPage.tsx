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

const actionLabel: Record<AcsJobAction, string> = {
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
      header: 'CPE Serial / ID',
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
      header: 'Manufacturer',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{row.original.manufacturer ?? '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'model',
      header: 'Model / Firmware',
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
      header: 'Customer',
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.customerName ?? '—'}</span>,
    },
    {
      accessorKey: 'lastInformAt',
      header: 'Last Inform',
      cell: ({ row }) =>
        row.original.lastInformAt ? (
          <span className="font-mono text-xs font-semibold text-foreground">{fmtDateTime(row.original.lastInformAt)}</span>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            Never informed
          </Badge>
        ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const dev = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={queueJob.isPending} onClick={() => handleQueue(dev.id, 'reboot')} title="Queue a TR-069 reboot">
              <RotateCw className="h-3 w-3 text-amber-500" /> Reboot
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setJobsDevice(dev)}>
              <ListChecks className="h-3 w-3" /> Jobs{dev.queuedJobs > 0 ? ` (${dev.queuedJobs})` : ''}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dev)} title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(dev)} title="Remove">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load ACS devices" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary;
  const kpis = [
    { label: 'Managed CPEs', value: summary?.total ?? 0, hint: 'Registered TR-069 routers', icon: Cable, tone: 'text-primary', text: 'text-foreground' },
    { label: 'Informed (24h)', value: `${summary?.informed24h ?? 0} / ${summary?.total ?? 0}`, hint: 'Sent an inform in the last day', icon: ShieldCheck, tone: 'text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Never Informed', value: summary?.neverInformed ?? 0, hint: 'No CWMP inform recorded yet', icon: Radio, tone: 'text-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Queued Jobs', value: summary?.queuedJobs ?? 0, hint: 'Waiting for the ACS worker', icon: Clock, tone: 'text-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ACS / TR-069 Auto Configuration Server"
        subtitle="Customer CPE registry and queued TR-069 configuration jobs"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'ACS / TR-069' }]}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register CPE
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

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by serial, manufacturer, model, firmware or MAC..."
        emptyTitle={table.search ? 'No CPEs match your search' : 'No CPEs registered'}
        emptyDescription="Register a customer router to manage it over TR-069."
        server={table.server(data?.meta.total ?? 0)}
      />

      {/* Register / edit CPE */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit CPE' : 'Register Customer CPE Router'}</DialogTitle>
            <DialogDescription>Record a customer router so TR-069 jobs can be queued for it.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="serial">Serial Number *</Label>
              <Input id="serial" value={form.serial} onChange={(e) => set({ serial: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" value={form.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={form.model} onChange={(e) => set({ model: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firmware">Firmware</Label>
                <Input id="firmware" value={form.firmware} onChange={(e) => set({ firmware: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mac">MAC Address</Label>
                <Input id="mac" value={form.macAddress} onChange={(e) => set({ macAddress: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acs-customer">Customer</Label>
              <CustomerPicker id="acs-customer" value={form.customer} onChange={(c) => set({ customer: c })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acs-notes">Notes</Label>
              <Textarea id="acs-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveDevice.isPending}>
                {saveDevice.isPending ? 'Saving…' : editing ? 'Save' : 'Register Device'}
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
                  {[jobsDevice.manufacturer, jobsDevice.model].filter(Boolean).join(' ') || 'CPE'} · {jobsDevice.customerName ?? 'No customer'}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 rounded-lg border border-border/70 p-4">
                <Label>Queue a job</Label>
                <OptionSelect
                  value={jobAction}
                  onChange={(v) => setJobAction((v || 'push_config') as AcsJobAction)}
                  options={ACS_JOB_ACTIONS.map((a) => ({ value: a, label: actionLabel[a] }))}
                  placeholder="Action"
                />
                {jobAction === 'push_config' && (
                  <div className="space-y-2">
                    {params.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder="TR-069 parameter"
                          value={p.key}
                          onChange={(e) => setParams((ps) => ps.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))}
                          className="h-9 text-xs font-mono"
                        />
                        <Input
                          placeholder="Value"
                          value={p.value}
                          onChange={(e) => setParams((ps) => ps.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                          className="h-9 text-xs"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={params.length === 1} onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setParams((ps) => [...ps, { key: '', value: '' }])}>
                      <Plus className="h-3 w-3 mr-1" /> Parameter
                    </Button>
                  </div>
                )}
                <Button className="w-full" disabled={queueJob.isPending} onClick={() => handleQueue(jobsDevice.id, jobAction)}>
                  {queueJob.isPending ? 'Queuing…' : 'Queue job'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Job history</Label>
                {jobs.isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : jobs.isError ? (
                  <p className="text-xs text-destructive">{errorMessage(jobs.error)}</p>
                ) : (jobs.data?.items ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No jobs queued for this CPE.</p>
                ) : (
                  jobs.data?.items.map((j) => (
                    <div key={j.id} className="flex items-start justify-between gap-2 rounded-lg border border-border/60 p-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{actionLabel[j.action as AcsJobAction] ?? j.action}</p>
                        {Object.keys(j.parameters).length > 0 && (
                          <p className="font-mono text-[11px] text-muted-foreground break-all">
                            {Object.entries(j.parameters).map(([k, v]) => `${k}=${v}`).join(', ')}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">Queued {fmtDateTime(j.createdAt)}{j.processedAt ? ` · processed ${fmtDateTime(j.processedAt)}` : ''}</p>
                        {j.result && <p className="text-[11px] text-foreground/80">{j.result}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {j.status}
                        </Badge>
                        {j.status === 'queued' && (
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-destructive" disabled={cancelJob.isPending} onClick={() => cancelJob.mutate(j.id)}>
                            Cancel
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
        title="Remove CPE"
        description={`Remove ${deleteTarget?.serial ?? ''} from the registry? Its queued jobs are dropped.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteDevice.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
