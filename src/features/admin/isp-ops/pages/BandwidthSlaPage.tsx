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
import { Gauge, Plus, Activity, CheckCircle2, Info, Pencil, Trash2 } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDeleteSla, useSaveSla, useSlas, type BandwidthSla, type SlaScope } from '../hooks/use-sla';
import { useNetOpsOptions, type CustomerOption } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { CustomerPicker, OptionSelect } from '../components/NetOpsControls';

interface SlaForm {
  name: string;
  scope: SlaScope;
  packageId: string;
  customer: CustomerOption | null;
  committedMbps: string;
  uptimeTargetPct: string;
  status: 'active' | 'inactive';
  notes: string;
}

const emptyForm: SlaForm = { name: '', scope: 'package', packageId: '', customer: null, committedMbps: '', uptimeTargetPct: '', status: 'active', notes: '' };

/** SLA definitions (committed Mbps + uptime target) per package or customer. */
export function BandwidthSlaPage() {
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useSlas({ page: table.page, pageSize: table.pageSize, search: table.search });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BandwidthSla | null>(null);
  const [form, setForm] = useState<SlaForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<BandwidthSla | null>(null);
  const options = useNetOpsOptions(modalOpen);
  const save = useSaveSla();
  const remove = useDeleteSla();

  const set = (patch: Partial<SlaForm>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: BandwidthSla) => {
    setEditing(s);
    setForm({
      name: s.name,
      scope: s.scope,
      packageId: s.packageId ?? '',
      customer: s.userId ? { id: s.userId, name: s.customerName ?? `#${s.userId}`, mobile: null, pppoeId: null } : null,
      committedMbps: String(s.committedMbps),
      uptimeTargetPct: String(s.uptimeTargetPct),
      status: s.status,
      notes: s.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        id: editing?.id,
        body: {
          name: form.name,
          scope: form.scope,
          package_id: form.scope === 'package' ? form.packageId || null : null,
          user_id: form.scope === 'customer' ? (form.customer?.id ?? null) : null,
          committed_mbps: form.committedMbps,
          uptime_target_pct: form.uptimeTargetPct,
          status: form.status,
          notes: form.notes || null,
        },
      },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  const columns: LegacyColumnDef<BandwidthSla, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'SLA',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.scope === 'package' ? `Package: ${row.original.packageName ?? '—'}` : `Customer: ${row.original.customerName ?? '—'}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'committedMbps',
      header: 'CIR Committed',
      cell: ({ row }) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground">{row.original.committedMbps.toLocaleString()} Mbps</span>
          {row.original.packageBandwidth && <div className="text-xs text-muted-foreground font-mono">Plan: {row.original.packageBandwidth}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'uptimeTargetPct',
      header: 'Uptime Target',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-foreground">{row.original.uptimeTargetPct}%</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.original.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs' : 'bg-muted text-muted-foreground text-xs'}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row.original)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load Bandwidth SLA" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary;
  const packageOptions = (options.data?.packages ?? []).map((p) => ({ value: p.value, label: p.bandwidth ? `${p.label} (${p.bandwidth})` : p.label }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth SLA"
        subtitle="Committed bandwidth and uptime targets per package or customer"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'Bandwidth SLA' }]}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New SLA
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>SLA Definitions</span>
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground tabular-nums">{summary?.total ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{summary?.active ?? 0} active</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Committed (active)</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{(summary?.committedMbpsActive ?? 0).toLocaleString()} Mbps</div>
          <p className="text-xs text-muted-foreground mt-0.5">Sum of committed rates</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Measurement</span>
            {summary?.measurementAvailable ? <CheckCircle2 className="h-4 w-4 text-blue-500" /> : <Info className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary?.measurementAvailable
              ? 'Measured delivery is available.'
              : 'Delivered throughput and uptime are not recorded yet, so only targets are shown.'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder="Search SLAs..."
        emptyTitle={table.search ? 'No SLAs match your search' : 'No SLA definitions yet'}
        server={table.server(data?.meta.total ?? 0)}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit SLA' : 'New Bandwidth SLA'}</DialogTitle>
            <DialogDescription>Define the committed rate and uptime target for a package or a single customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sla-name">Name *</Label>
              <Input id="sla-name" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sla-scope">Applies to</Label>
                <OptionSelect
                  id="sla-scope"
                  value={form.scope}
                  onChange={(v) => set({ scope: (v || 'package') as SlaScope })}
                  options={[
                    { value: 'package', label: 'Package' },
                    { value: 'customer', label: 'Customer' },
                  ]}
                  placeholder="Scope"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sla-status">Status</Label>
                <OptionSelect
                  id="sla-status"
                  value={form.status}
                  onChange={(v) => set({ status: v === 'inactive' ? 'inactive' : 'active' })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  placeholder="Status"
                />
              </div>
            </div>
            {form.scope === 'package' ? (
              <div className="space-y-1.5">
                <Label htmlFor="sla-package">Package *</Label>
                <OptionSelect id="sla-package" value={form.packageId} onChange={(v) => set({ packageId: v })} options={packageOptions} placeholder="Select package" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="sla-customer">Customer *</Label>
                <CustomerPicker id="sla-customer" value={form.customer} onChange={(c) => set({ customer: c })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sla-mbps">Committed (Mbps) *</Label>
                <Input id="sla-mbps" type="number" min={0.01} step="0.01" value={form.committedMbps} onChange={(e) => set({ committedMbps: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sla-uptime">Uptime target (%) *</Label>
                <Input id="sla-uptime" type="number" min={0.01} max={100} step="0.01" value={form.uptimeTargetPct} onChange={(e) => set({ uptimeTargetPct: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sla-notes">Notes</Label>
              <Textarea id="sla-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? 'Saving…' : 'Save SLA'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete SLA"
        description={`Delete "${deleteTarget?.name ?? ''}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
