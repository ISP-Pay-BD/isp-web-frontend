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
import { EXPIRED_MODES, type HotspotExpiredMode, type HotspotProfile } from '../types';
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
import { useLocale } from '@/i18n/locale-context';
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

type Translate = ReturnType<typeof useLocale>['t'];

const csvModeLabel = (mode: string) => EXPIRED_MODES.find((m) => m.value === mode)?.label ?? mode;

const expiredModes = (t: Translate): { value: HotspotExpiredMode; label: string }[] => [
  { value: '0', label: t('admin.hotspot.packages.modeNone', 'None (no expiry)') },
  { value: 'rem', label: t('admin.hotspot.packages.modeRemove', 'Remove user') },
  { value: 'ntf', label: t('admin.hotspot.packages.modeNotice', 'Notice') },
  { value: 'remc', label: t('admin.hotspot.packages.modeRemoveRecord', 'Remove & record sale') },
  { value: 'ntfc', label: t('admin.hotspot.packages.modeNoticeRecord', 'Notice & record sale') },
];

const modeLabel = (t: Translate, mode: string) => expiredModes(t).find((m) => m.value === mode)?.label ?? mode;

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
  const { t } = useLocale();
  const hs = useHotspotRouter();
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.hotspot.packages.title', 'Hotspot Packages & Bandwidth Profiles')}
        subtitle={t(
          'admin.hotspot.packages.subtitle',
          'Hotspot user profiles on the selected router: speed, validity, expiry mode and voucher prices.',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.hotspot', 'Hotspot'), href: '/admin/hotspot' },
          { label: t('admin.hotspot.packages.crumb', 'Packages') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setDialog({ mode: 'create', initial: blankProfile() })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.hotspot.packages.create', 'Create Package Profile')}
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
  const { t } = useLocale();
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
        csvModeLabel(p.expiredMode),
        p.lockUser ? 'Yes' : 'No',
      ]),
    );
  };

  const columns = useMemo<LegacyColumnDef<HotspotProfile, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.hotspot.packages.colProfile', 'Package Profile'),
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
                  {p.lockUser ? <Lock className="ml-1.5 inline h-3 w-3 text-muted-foreground" aria-label={t('admin.hotspot.packages.macLock', 'MAC lock')} /> : null}
                </span>
                <span className="text-xs text-muted-foreground block font-mono">
                  {t('admin.hotspot.packages.pool', 'Pool: {pool}', { pool: p.addressPool })}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rateLimit',
        header: t('admin.hotspot.packages.colSpeed', 'Bandwidth Speed'),
        size: 160,
        cell: ({ row }) =>
          row.original.rateLimit ? (
            <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 bg-background text-primary border-primary/30">
              <Gauge className="mr-1 h-3 w-3" />
              {row.original.rateLimit}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{t('admin.hotspot.packages.unlimited', 'Unlimited')}</span>
          ),
      },
      {
        accessorKey: 'validity',
        header: t('admin.hotspot.packages.validity', 'Validity'),
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
        header: t('admin.hotspot.packages.colPricing', 'Cost / Retail Sell'),
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
        header: t('admin.hotspot.packages.sharedUsers', 'Shared Users'),
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.sharedUsers}</span>,
      },
      {
        accessorKey: 'expiredMode',
        header: t('admin.hotspot.packages.onExpiry', 'On Expiry'),
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-xs font-normal">
            {modeLabel(t, row.original.expiredMode)}
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
                aria-label={t('admin.customers.list.actionsFor', 'Actions for {name}', { name: p.name })}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('admin.hotspot.packages.actions', 'Profile Actions')}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onDialogChange({ mode: 'edit', initial: toInput(p) })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.hotspot.packages.edit', 'Edit Package')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDialogChange({ mode: 'create', initial: { ...toInput(p), id: undefined, name: `${p.name}-copy` } })}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    {t('admin.hotspot.packages.duplicate', 'Duplicate Profile')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {!p.isDefault ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(p)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      {t('admin.hotspot.packages.delete', 'Delete Profile')}
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onDialogChange, t],
  );

  if (query.isError) {
    return (
      <HotspotQueryError
        error={query.error}
        routerName={routerName}
        title={t('admin.hotspot.packages.loadFailed', 'Failed to load hotspot packages')}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label={t('admin.hotspot.packages.kpiTotal', 'Total Profiles')}
          value={query.isLoading ? '—' : profiles.length}
          hint={t('admin.hotspot.packages.kpiTotalHint', 'User profiles on the router')}
          icon={<Package className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.packages.kpiPriced', 'Priced Packages')}
          value={query.isLoading ? '—' : priced.length}
          hint={t('admin.hotspot.packages.kpiPricedHint', 'Have a retail selling price')}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label={t('admin.hotspot.packages.kpiAvg', 'Avg Retail Price')}
          value={query.isLoading ? '—' : formatBdtWithSymbol(avgPrice)}
          hint={t('admin.hotspot.packages.kpiAvgHint', 'Across priced packages')}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.packages.kpiLocked', 'MAC-Locked')}
          value={query.isLoading ? '—' : lockedCount}
          hint={t('admin.hotspot.packages.kpiLockedHint', 'Lock users to their first device')}
          icon={<Lock className="h-4 w-4 text-sky-500" />}
        />
      </HotspotKpiRow>

      <DataTable urlState
        columns={columns}
        data={profiles}
        isLoading={query.isLoading}
        emptyTitle={t('admin.hotspot.packages.emptyTitle', 'No hotspot profiles')}
        emptyDescription={t('admin.hotspot.packages.emptyDesc', 'Create a package profile to start selling hotspot access.')}
        searchKey="name"
        searchFilterFn={profileSearchFilter}
        searchPlaceholder={t('admin.hotspot.packages.searchPlaceholder', 'Search by package name, rate limit or pool...')}
        getRowId={(r) => r.id || r.name}
        toolbarActions={
          profiles.length > 0 ? (
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {t('admin.hotspot.packages.exportCsv', 'Export CSV')}
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
        title={t('admin.hotspot.packages.deleteTitle', 'Delete this hotspot profile?')}
        description={
          deleteTarget
            ? t(
                'admin.hotspot.packages.deleteDesc',
                '{name} and its expiry scheduler are removed from the router. Users on it fall back to the default profile.',
                { name: deleteTarget.name },
              )
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () => toast.success(t('admin.hotspot.packages.deleted', 'Profile "{name}" deleted', { name: target.name })),
          });
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
  const { t } = useLocale();
  const save = useSaveHotspotProfile(routerId);
  const modes = expiredModes(t);
  const [form, setForm] = useState<HotspotProfileInput>(state.initial);
  const set = (patch: Partial<HotspotProfileInput>) => setForm((f) => ({ ...f, ...patch }));
  const editing = state.mode === 'edit';

  const errors = {
    name: !form.name.trim() || /[",]/.test(form.name) ? t('admin.hotspot.packages.nameError', 'Name is required (no quotes or commas)') : '',
    rateLimit: form.rateLimit && !RATE_RE.test(form.rateLimit) ? t('admin.hotspot.packages.rateError', 'Use the RouterOS form, e.g. 10M/10M') : '',
    validity: form.validity && !VALIDITY_RE.test(form.validity) ? t('admin.hotspot.packages.validityError', 'Use a duration like 12h, 1d or 30d') : '',
    sharedUsers: !/^[1-9]\d*$/.test(form.sharedUsers) ? t('admin.hotspot.packages.sharedError', 'At least 1') : '',
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
                  toast.success(
                    editing
                      ? t('admin.hotspot.packages.updated', 'Hotspot profile "{name}" updated', { name: form.name.trim() })
                      : t('admin.hotspot.packages.created', 'Hotspot profile "{name}" created', { name: form.name.trim() }),
                  );
                  onClose();
                },
              },
            );
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {editing
                ? t('admin.hotspot.packages.editTitle', 'Edit Hotspot Package Profile')
                : t('admin.hotspot.packages.createTitle', 'Create Hotspot Package Profile')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'admin.hotspot.packages.dialogDesc',
                'Saved on the router as a hotspot user profile with its pricing and expiry settings.',
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">{t('admin.hotspot.packages.name', 'Profile Name *')}</Label>
              <Input
                id="pkg-name"
                placeholder={t('admin.hotspot.packages.namePlaceholder', 'e.g. 1-Day')}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                aria-invalid={Boolean(errors.name) && form.name !== ''}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.hotspot.packages.nameHint', 'Spaces become dashes on the router.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-rate">{t('admin.hotspot.packages.rate', 'Rate Limit (Rx/Tx)')}</Label>
                <Input
                  id="pkg-rate"
                  placeholder={t('admin.hotspot.packages.ratePlaceholder', 'e.g. 10M/10M')}
                  value={form.rateLimit}
                  onChange={(e) => set({ rateLimit: e.target.value.trim() })}
                  className="font-mono"
                  aria-invalid={Boolean(errors.rateLimit)}
                />
                {errors.rateLimit ? <p className="text-destructive text-xs">{errors.rateLimit}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-validity">{t('admin.hotspot.packages.validity', 'Validity')}</Label>
                <Input
                  id="pkg-validity"
                  placeholder={t('admin.hotspot.packages.validityPlaceholder', 'e.g. 1d or 30d')}
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
                <Label htmlFor="pkg-base">{t('admin.hotspot.packages.baseCost', 'Base Cost (BDT)')}</Label>
                <Input id="pkg-base" type="number" min={0} value={form.priceBdt} onChange={(e) => set({ priceBdt: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-sell">{t('admin.hotspot.packages.sellPrice', 'Retail Sell Price (BDT)')}</Label>
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
                <Label htmlFor="pkg-pool">{t('admin.hotspot.packages.addressPool', 'Address Pool')}</Label>
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
                <Label htmlFor="pkg-queue">{t('admin.hotspot.packages.parentQueue', 'Parent Queue')}</Label>
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
                <Label htmlFor="pkg-mode">{t('admin.hotspot.packages.onExpiry', 'On Expiry')}</Label>
                <Select
                  value={form.expiredMode}
                  onValueChange={(v) => v && set({ expiredMode: v as HotspotProfileInput['expiredMode'] })}
                  items={modes}
                >
                  <SelectTrigger id="pkg-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-shared">{t('admin.hotspot.packages.sharedUsers', 'Shared Users')}</Label>
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
                <span className="block text-sm font-medium">{t('admin.hotspot.packages.lockTitle', 'Lock to first MAC')}</span>
                <span className="block text-xs text-muted-foreground">
                  {t('admin.hotspot.packages.lockDesc', 'Bind each user to the device it first logs in from.')}
                </span>
              </span>
              <Switch checked={form.lockUser} onCheckedChange={(checked) => set({ lockUser: Boolean(checked) })} />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={invalid || save.isPending}>
              {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? t('admin.hotspot.packages.saveChanges', 'Save Changes') : t('admin.hotspot.packages.createProfile', 'Create Profile')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
