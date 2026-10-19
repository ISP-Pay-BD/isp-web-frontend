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
import { Shield, Plus, Zap, Lock, ShieldCheck, Clock, Ban, Pencil, Trash2 } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  VPN_TYPES,
  useDeleteVpnAccount,
  useProvisionVpnAccount,
  useSaveVpnAccount,
  useVpnAccounts,
  type VpnAccount,
  type VpnType,
} from '../hooks/use-vpn';
import { useNetOpsOptions, type CustomerOption } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { CustomerPicker, OptionSelect } from '../components/NetOpsControls';

const typeLabel: Record<VpnType, string> = {
  l2tp: 'L2TP',
  pptp: 'PPTP',
  sstp: 'SSTP',
  ovpn: 'OpenVPN',
  wireguard: 'WireGuard',
  ipsec: 'IPsec',
};
const PPP_TYPES: VpnType[] = ['l2tp', 'pptp', 'sstp', 'ovpn'];

const statusClass: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  pending_provision: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  disabled: 'bg-muted text-muted-foreground',
};

function statusText(t: ReturnType<typeof useTranslations>, status: string): string {
  if (status === 'active') return t('admin.ops.vpn.statusProvisioned', 'Provisioned');
  if (status === 'pending_provision') return t('admin.ops.vpn.statusPending', 'Pending provision');
  if (status === 'disabled') return t('admin.ops.vpn.statusDisabled', 'Disabled');
  return status;
}

interface VpnForm {
  vpnType: VpnType;
  username: string;
  password: string;
  routerId: string;
  customer: CustomerOption | null;
  assignedIp: string;
  profile: string;
  notes: string;
}

const emptyForm: VpnForm = { vpnType: 'l2tp', username: '', password: '', routerId: '', customer: null, assignedIp: '', profile: '', notes: '' };

export function VpnPage() {
  const t = useTranslations();
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useVpnAccounts({ page: table.page, pageSize: table.pageSize, search: table.search });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VpnAccount | null>(null);
  const [form, setForm] = useState<VpnForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<VpnAccount | null>(null);
  const options = useNetOpsOptions(modalOpen);
  const save = useSaveVpnAccount();
  const remove = useDeleteVpnAccount();
  const provision = useProvisionVpnAccount();

  const set = (patch: Partial<VpnForm>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: VpnAccount) => {
    setEditing(a);
    setForm({
      vpnType: a.vpnType,
      username: a.username,
      password: '',
      routerId: a.routerId ?? '',
      customer: a.userId ? { id: a.userId, name: a.customerName ?? `#${a.userId}`, mobile: null, pppoeId: null } : null,
      assignedIp: a.assignedIp ?? '',
      profile: a.profile ?? '',
      notes: a.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        id: editing?.id,
        body: {
          vpn_type: form.vpnType,
          username: form.username,
          password: form.password || undefined,
          router_id: form.routerId || null,
          user_id: form.customer?.id ?? null,
          assigned_ip: form.assignedIp || null,
          profile: form.profile || null,
          notes: form.notes || null,
        },
      },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  const toggleDisabled = (a: VpnAccount) =>
    save.mutate({ id: a.id, body: { status: a.status === 'disabled' ? 'pending_provision' : 'disabled' } });

  const columns: LegacyColumnDef<VpnAccount, unknown>[] = [
    {
      accessorKey: 'username',
      header: t('admin.ops.vpn.colAccount', 'Account'),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground font-mono">{row.original.username}</p>
            <p className="text-xs text-muted-foreground">{row.original.customerName ?? t('admin.ops.vpn.noCustomer', 'No customer')}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'vpnType',
      header: t('admin.ops.vpn.colProtocol', 'Protocol'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs font-mono border-border/70">
            {typeLabel[row.original.vpnType] ?? row.original.vpnType}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'routerName',
      header: t('admin.ops.vpn.colRouter', 'Router'),
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.routerName ?? '—'}</span>,
    },
    {
      accessorKey: 'assignedIp',
      header: t('admin.ops.vpn.colAssignedIp', 'Assigned IP'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground bg-muted/40 px-2 py-1 rounded border border-border/40">{row.original.assignedIp ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('admin.ops.vpn.colStatus', 'Status'),
      cell: ({ row }) => (
        <div>
          <Badge variant="outline" className={`text-xs ${statusClass[row.original.status] ?? ''}`}>
            {statusText(t, row.original.status)}
          </Badge>
          {row.original.lastError && row.original.status !== 'active' && <p className="text-xs text-destructive mt-0.5 max-w-[200px] truncate" title={row.original.lastError}>{row.original.lastError}</p>}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {a.canProvision && a.status === 'pending_provision' && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={provision.isPending || !a.routerId} onClick={() => provision.mutate(a.id)} title={a.routerId ? t('admin.ops.vpn.provisionHint', 'Create the secret on the router') : t('admin.ops.vpn.assignRouterFirst', 'Assign a router first')}>
                <Zap className="h-3 w-3 text-amber-500" /> {t('admin.ops.vpn.provision', 'Provision')}
              </Button>
            )}
            {a.status !== 'active' && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={save.isPending} onClick={() => toggleDisabled(a)}>
                {a.status === 'disabled' ? t('admin.ops.vpn.enable', 'Enable') : t('admin.ops.vpn.disable', 'Disable')}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(a)} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.vpn.loadFailed', 'Failed to load VPN accounts')} description={errorMessage(error)} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const summary = data?.summary;
  const kpis = [
    { id: 'total', label: t('admin.ops.vpn.kpiTotal', 'VPN Accounts'), value: summary?.total ?? 0, hint: t('admin.ops.vpn.kpiTotalHint', 'Configured customer accounts'), icon: Shield, tone: 'text-primary', text: 'text-foreground' },
    { id: 'active', label: t('admin.ops.vpn.statusProvisioned', 'Provisioned'), value: summary?.active ?? 0, hint: t('admin.ops.vpn.kpiActiveHint', 'Accepted by the router'), icon: ShieldCheck, tone: 'text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'pending', label: t('admin.ops.vpn.kpiPending', 'Pending Provision'), value: summary?.pending ?? 0, hint: t('admin.ops.vpn.kpiPendingHint', 'Saved, not yet on a router'), icon: Clock, tone: 'text-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { id: 'disabled', label: t('admin.ops.vpn.statusDisabled', 'Disabled'), value: summary?.disabled ?? 0, hint: t('admin.ops.vpn.kpiDisabledHint', 'Turned off by staff'), icon: Ban, tone: 'text-muted-foreground', text: 'text-foreground' },
  ];
  const isPpp = PPP_TYPES.includes(form.vpnType);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.vpn.kpiTotal', 'VPN Accounts')}
        subtitle={t('admin.ops.vpn.subtitle', 'Customer VPN accounts — L2TP/PPTP/SSTP/OpenVPN can be provisioned on your MikroTik routers')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.network', 'Network') },
          { label: 'VPN' },
        ]}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t('admin.ops.vpn.create', 'Create VPN Account')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.id} className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
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
        searchPlaceholder={t('admin.ops.vpn.searchPlaceholder', 'Search by username, IP or profile...')}
        emptyTitle={table.search ? t('admin.ops.vpn.emptySearch', 'No accounts match your search') : t('admin.ops.vpn.emptyNone', 'No VPN accounts yet')}
        server={table.server(data?.meta.total ?? 0)}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? t('admin.ops.vpn.editTitle', 'Edit VPN Account') : t('admin.ops.vpn.create', 'Create VPN Account')}</DialogTitle>
            <DialogDescription>
              {isPpp
                ? t('admin.ops.vpn.descPpp', 'Saved as pending; use Provision to create the secret on the selected router.')
                : t('admin.ops.vpn.descOther', 'Stored configuration only — this protocol has no automatic router provisioning yet.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vpn-type">{t('admin.ops.vpn.colProtocol', 'Protocol')}</Label>
                <OptionSelect
                  id="vpn-type"
                  value={form.vpnType}
                  onChange={(v) => set({ vpnType: (v || 'l2tp') as VpnType })}
                  options={VPN_TYPES.map((type) => ({ value: type, label: typeLabel[type] }))}
                  placeholder={t('admin.ops.vpn.colProtocol', 'Protocol')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vpn-user">{t('admin.ops.vpn.fieldUsername', 'Username')} *</Label>
                <Input id="vpn-user" value={form.username} onChange={(e) => set({ username: e.target.value })} required className="font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vpn-pass">{t('admin.ops.vpn.fieldPassword', 'Password')}{isPpp && !editing ? ' *' : ''}</Label>
              <Input
                id="vpn-pass"
                type="password"
                value={form.password}
                onChange={(e) => set({ password: e.target.value })}
                required={isPpp && !editing}
                placeholder={editing?.hasPassword ? t('admin.ops.vpn.passwordKeep', 'Leave blank to keep the current password') : ''}
                autoComplete="new-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vpn-router">{t('admin.ops.vpn.colRouter', 'Router')}</Label>
                <OptionSelect id="vpn-router" value={form.routerId} onChange={(v) => set({ routerId: v })} options={options.data?.routers ?? []} placeholder={t('admin.ops.vpn.selectRouter', 'Select router')} noneLabel={t('admin.ops.vpn.noRouter', 'No router')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vpn-ip">{t('admin.ops.vpn.colAssignedIp', 'Assigned IP')}</Label>
                <Input id="vpn-ip" value={form.assignedIp} onChange={(e) => set({ assignedIp: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vpn-profile">{t('admin.ops.vpn.fieldProfile', 'PPP Profile')}</Label>
              <Input id="vpn-profile" value={form.profile} onChange={(e) => set({ profile: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vpn-customer">{t('admin.ops.vpn.fieldCustomer', 'Customer')}</Label>
              <CustomerPicker id="vpn-customer" value={form.customer} onChange={(c) => set({ customer: c })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vpn-notes">{t('admin.ops.vpn.fieldNotes', 'Notes')}</Label>
              <Textarea id="vpn-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? t('admin.ops.vpn.saving', 'Saving…') : editing ? t('common.save', 'Save') : t('admin.ops.vpn.createAccount', 'Create Account')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.ops.vpn.deleteTitle', 'Delete VPN account')}
        description={t('admin.ops.vpn.deleteDesc', 'Delete {name}? This removes the record only — a provisioned secret stays on the router until removed there.', { name: deleteTarget?.username ?? '' })}
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
