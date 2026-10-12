'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotRouter } from '../hooks/useHotspotRouter';
import {
  useDeleteHotspotProfile,
  useHotspotProfiles,
  useSaveHotspotProfile,
  type HotspotProfileInput,
} from '../hooks/useHotspotData';
import { HotspotRouterSelect } from '../components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '../components/HotspotStates';
import { HotspotKpi, HotspotKpiRow } from '../components/HotspotKpi';
import { EXPIRED_MODES, type HotspotProfile } from '../types';
import { downloadCsv } from '../utils';
import { DataTable } from '@/features/shared/data-table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Plus,
  Download,
  Package,
  CheckCircle2,
  Gauge,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Clock,
  Wifi,
  Lock,
  Loader2,
} from 'lucide-react';

const VALIDITY_RE = /^(\d{1,4}[wdhm]){1,4}$/;
const RATE_RE = /^[0-9A-Za-z/ .:-]{1,64}$/;

const profileSearchFilter = (row: LegacyRow<HotspotProfile>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return p.name.toLowerCase().includes(q) || p.rateLimit.toLowerCase().includes(q) || p.addressPool.toLowerCase().includes(q);
};

const modeLabel = (mode: string) => EXPIRED_MODES.find((m) => m.value === mode)?.label ?? mode;

type DialogState = { mode: 'create' | 'edit'; initial: HotspotProfileInput } | null;

const blankProfile = (): HotspotProfileInput => ({
  name: '',
  rateLimit: '',
  validity: '',
  priceBdt: '',
  sellingPriceBdt: '',
  sharedUsers: '1',
  addressPool: 'none',
  parentQueue: 'none',
  expiredMode: '0',
  lockUser: false,
});

const toInput = (p: HotspotProfile): HotspotProfileInput => ({
  id: p.id,
  name: p.name,
  rateLimit: p.rateLimit,
  validity: p.validity,
  priceBdt: p.priceBdt ? String(p.priceBdt) : '',
  sellingPriceBdt: p.sellingPriceBdt ? String(p.sellingPriceBdt) : '',
  sharedUsers: String(p.sharedUsers || 1),
  addressPool: p.addressPool || 'none',
  parentQueue: p.parentQueue || 'none',
  expiredMode: p.expiredMode,
  lockUser: p.lockUser,
});

export function HotspotPackagesPage() {
  const hs = useHotspotRouter();
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Packages & Bandwidth Profiles"
        subtitle="Hotspot user profiles on the selected router: speed, validity, expiry mode and voucher prices."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Packages' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setDialog({ mode: 'create', initial: blankProfile() })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Create Package Profile
              </Button>
            ) : null}
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? (
          <ProfilesBody
            key={hs.router.id}
            routerId={hs.router.id}
            routerName={hs.router.name}
            dialog={dialog}
            onDialogChange={setDialog}
          />
        ) : null}
      </HotspotRouterGate>
    </div>
  );
}

function ProfilesBody({
  routerId,
  routerName,
  dialog,
  onDialogChange,
}: {
  routerId: string;
  routerName: string;
  dialog: DialogState;
  onDialogChange: (next: DialogState) => void;
}) {
  const query = useHotspotProfiles(routerId);
  const remove = useDeleteHotspotProfile(routerId);
  const [deleteTarget, setDeleteTarget] = useState<HotspotProfile | null>(null);

  const profiles = useMemo(() => query.data?.profiles ?? [], [query.data]);
  const priced = profiles.filter((p) => p.sellingPriceBdt > 0);
  const avgPrice = priced.length > 0 ? Math.round(priced.reduce((s, p) => s + p.sellingPriceBdt, 0) / priced.length) : 0;
  const lockedCount = profiles.filter((p) => p.lockUser).length;

  const handleExportCsv = () => {
    downloadCsv(
      `hotspot_profiles_${routerName || routerId}.csv`,
      ['Profile', 'Rate Limit', 'Validity', 'Price (BDT)', 'Selling Price (BDT)', 'Shared Users', 'Address Pool', 'Expiry Mode', 'MAC Lock'],
      profiles.map((p) => [
        p.name,
        p.rateLimit,
        p.validity,
        p.priceBdt,
        p.sellingPriceBdt,
        p.sharedUsers,
        p.addressPool,
        modeLabel(p.expiredMode),
        p.lockUser ? 'Yes' : 'No',
      ]),
    );
  };

  const columns = useMemo<LegacyColumnDef<HotspotProfile, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Package Profile',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Wifi className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">
                  {p.name}
                  {p.lockUser ? <Lock className="ml-1.5 inline h-3 w-3 text-muted-foreground" aria-label="MAC lock" /> : null}
                </span>
                <span className="text-xs text-muted-foreground block font-mono">Pool: {p.addressPool}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rateLimit',
        header: 'Bandwidth Speed',
        size: 160,
        cell: ({ row }) =>
          row.original.rateLimit ? (
            <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 bg-background text-primary border-primary/30">
              <Gauge className="mr-1 h-3 w-3" />
              {row.original.rateLimit}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Unlimited</span>
          ),
      },
      {
        accessorKey: 'validity',
        header: 'Validity',
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{row.original.validity || '—'}</span>
          </div>
        ),
      },
      {
        id: 'pricing',
        accessorFn: (row) => row.sellingPriceBdt,
        header: 'Cost / Retail Sell',
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="text-muted-foreground">{formatBdtWithSymbol(row.original.priceBdt)}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-bold text-foreground tabular-nums text-sm">{formatBdtWithSymbol(row.original.sellingPriceBdt)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'sharedUsers',
        header: 'Shared Users',
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.sharedUsers}</span>,
      },
      {
        accessorKey: 'expiredMode',
        header: 'On Expiry',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-xs font-normal">
            {modeLabel(row.original.expiredMode)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Actions for ${p.name}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Profile Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onDialogChange({ mode: 'edit', initial: toInput(p) })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Package
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDialogChange({ mode: 'create', initial: { ...toInput(p), id: undefined, name: `${p.name}-copy` } })}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Duplicate Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {!p.isDefault ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(p)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete Profile
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onDialogChange],
  );

  if (query.isError) {
    return (
      <HotspotQueryError
        error={query.error}
        routerName={routerName}
        title="Failed to load hotspot packages"
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label="Total Profiles"
          value={query.isLoading ? '—' : profiles.length}
          hint="User profiles on the router"
          icon={<Package className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label="Priced Packages"
          value={query.isLoading ? '—' : priced.length}
          hint="Have a retail selling price"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label="Avg Retail Price"
          value={query.isLoading ? '—' : formatBdtWithSymbol(avgPrice)}
          hint="Across priced packages"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label="MAC-Locked"
          value={query.isLoading ? '—' : lockedCount}
          hint="Lock users to their first device"
          icon={<Lock className="h-4 w-4 text-sky-500" />}
        />
      </HotspotKpiRow>

      <DataTable
        columns={columns}
        data={profiles}
        isLoading={query.isLoading}
        emptyTitle="No hotspot profiles"
        emptyDescription="Create a package profile to start selling hotspot access."
        searchKey="name"
        searchFilterFn={profileSearchFilter}
        searchPlaceholder="Search by package name, rate limit or pool..."
        getRowId={(r) => r.id || r.name}
        toolbarActions={
          profiles.length > 0 ? (
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          ) : null
        }
      />

      {dialog ? (
        <ProfileDialog
          key={`${dialog.mode}-${dialog.initial.id ?? dialog.initial.name}`}
          routerId={routerId}
          state={dialog}
          pools={query.data?.pools ?? []}
          queues={query.data?.queues ?? []}
          onClose={() => onDialogChange(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this hotspot profile?"
        description={
          deleteTarget ? `${deleteTarget.name} and its expiry scheduler are removed from the router. Users on it fall back to the default profile.` : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, { onSuccess: () => toast.success(`Profile "${target.name}" deleted`) });
        }}
      />
    </>
  );
}

function ProfileDialog({
  routerId,
  state,
  pools,
  queues,
  onClose,
}: {
  routerId: string;
  state: NonNullable<DialogState>;
  pools: string[];
  queues: string[];
  onClose: () => void;
}) {
  const save = useSaveHotspotProfile(routerId);
  const [form, setForm] = useState<HotspotProfileInput>(state.initial);
  const set = (patch: Partial<HotspotProfileInput>) => setForm((f) => ({ ...f, ...patch }));
  const editing = state.mode === 'edit';

  const errors = {
    name: !form.name.trim() || /[",]/.test(form.name) ? 'Name is required (no quotes or commas)' : '',
    rateLimit: form.rateLimit && !RATE_RE.test(form.rateLimit) ? 'Use the RouterOS form, e.g. 10M/10M' : '',
    validity: form.validity && !VALIDITY_RE.test(form.validity) ? 'Use a duration like 12h, 1d or 30d' : '',
    sharedUsers: !/^[1-9]\d*$/.test(form.sharedUsers) ? 'At least 1' : '',
  };
  const invalid = Object.values(errors).some(Boolean);
  // Keep a value that is no longer on the router selectable instead of silently dropping it.
  const poolOptions = Array.from(new Set(['none', ...pools, form.addressPool]));
  const queueOptions = Array.from(new Set(['none', ...queues, form.parentQueue]));

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            save.mutate(
              { ...form, name: form.name.trim() },
              {
                onSuccess: () => {
                  toast.success(`Hotspot profile "${form.name.trim()}" ${editing ? 'updated' : 'created'}`);
                  onClose();
                },
              },
            );
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {editing ? 'Edit Hotspot Package Profile' : 'Create Hotspot Package Profile'}
            </DialogTitle>
            <DialogDescription>Saved on the router as a hotspot user profile with its pricing and expiry settings.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">Profile Name *</Label>
              <Input
                id="pkg-name"
                placeholder="e.g. 1-Day"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                aria-invalid={Boolean(errors.name) && form.name !== ''}
                required
              />
              <p className="text-xs text-muted-foreground">Spaces become dashes on the router.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-rate">Rate Limit (Rx/Tx)</Label>
                <Input
                  id="pkg-rate"
                  placeholder="e.g. 10M/10M"
                  value={form.rateLimit}
                  onChange={(e) => set({ rateLimit: e.target.value.trim() })}
                  className="font-mono"
                  aria-invalid={Boolean(errors.rateLimit)}
                />
                {errors.rateLimit ? <p className="text-destructive text-xs">{errors.rateLimit}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-validity">Validity</Label>
                <Input
                  id="pkg-validity"
                  placeholder="e.g. 1d or 30d"
                  value={form.validity}
                  onChange={(e) => set({ validity: e.target.value.trim() })}
                  className="font-mono"
                  aria-invalid={Boolean(errors.validity)}
                />
                {errors.validity ? <p className="text-destructive text-xs">{errors.validity}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-base">Base Cost (BDT)</Label>
                <Input id="pkg-base" type="number" min={0} value={form.priceBdt} onChange={(e) => set({ priceBdt: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-sell">Retail Sell Price (BDT)</Label>
                <Input
                  id="pkg-sell"
                  type="number"
                  min={0}
                  value={form.sellingPriceBdt}
                  onChange={(e) => set({ sellingPriceBdt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-pool">Address Pool</Label>
                <Select value={form.addressPool} onValueChange={(v) => v && set({ addressPool: String(v) })}>
                  <SelectTrigger id="pkg-pool" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {poolOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-queue">Parent Queue</Label>
                <Select value={form.parentQueue} onValueChange={(v) => v && set({ parentQueue: String(v) })}>
                  <SelectTrigger id="pkg-queue" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {queueOptions.map((q) => (
                      <SelectItem key={q} value={q}>
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-mode">On Expiry</Label>
                <Select
                  value={form.expiredMode}
                  onValueChange={(v) => v && set({ expiredMode: v as HotspotProfileInput['expiredMode'] })}
                  items={EXPIRED_MODES}
                >
                  <SelectTrigger id="pkg-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRED_MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-shared">Shared Users</Label>
                <Input
                  id="pkg-shared"
                  type="number"
                  min={1}
                  value={form.sharedUsers}
                  onChange={(e) => set({ sharedUsers: e.target.value })}
                  aria-invalid={Boolean(errors.sharedUsers)}
                />
              </div>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
              <span>
                <span className="block text-sm font-medium">Lock to first MAC</span>
                <span className="block text-xs text-muted-foreground">Bind each user to the device it first logs in from.</span>
              </span>
              <Switch checked={form.lockUser} onCheckedChange={(checked) => set({ lockUser: Boolean(checked) })} />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={invalid || save.isPending}>
              {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? 'Save Changes' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
