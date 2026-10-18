'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useHotspotRouter } from '@/features/admin/hotspot/hooks/useHotspotRouter';
import {
  useDeleteHotspotUser,
  useGenerateVouchers,
  useHotspotProfiles,
  useHotspotVouchers,
  useUpdateHotspotUser,
  type GenerateVouchersInput,
} from '@/features/admin/hotspot/hooks/useHotspotData';
import { HotspotRouterSelect } from '@/features/admin/hotspot/components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '@/features/admin/hotspot/components/HotspotStates';
import { HotspotKpi, HotspotKpiRow } from '@/features/admin/hotspot/components/HotspotKpi';
import type { GenerateVouchersResult, HotspotVoucher, VoucherStatus } from '@/features/admin/hotspot/types';
import { downloadCsv } from '@/features/admin/hotspot/utils';
import { DataTable } from '@/features/shared/data-table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
  Plus,
  Download,
  Ticket,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Key,
  Ban,
  Power,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useTranslations } from '@/i18n/locale-context';

const DURATION_RE = /^(\d{1,4}[wdhm]){1,4}$/;
const ALL = '__all__';

function useVoucherStatusLabels(): Record<VoucherStatus, string> {
  const t = useTranslations();
  return useMemo(
    () => ({
      unused: t('admin.ops.vouchers.status.unused', 'Unused'),
      used: t('admin.ops.vouchers.status.used', 'Used'),
      disabled: t('admin.ops.vouchers.status.disabled', 'Disabled'),
    }),
    [t],
  );
}

export function HotspotVouchersPage() {
  const t = useTranslations();
  const hs = useHotspotRouter();
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.vouchers.title', 'Hotspot Prepaid Vouchers')}
        subtitle={t('admin.ops.vouchers.subtitle', 'Generate voucher codes on the selected router and track which are unused, used or disabled.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.hotspot', 'Hotspot'), href: '/admin/hotspot' },
          { label: t('admin.ops.vouchers.crumb', 'Vouchers') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setGenerateOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.ops.vouchers.generateBatch', 'Generate Batch')}
              </Button>
            ) : null}
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? (
          <VouchersBody
            key={hs.router.id}
            routerId={hs.router.id}
            routerName={hs.router.name}
            generateOpen={generateOpen}
            onGenerateOpenChange={setGenerateOpen}
          />
        ) : null}
      </HotspotRouterGate>
    </div>
  );
}

function VouchersBody({
  routerId,
  routerName,
  generateOpen,
  onGenerateOpenChange,
}: {
  routerId: string;
  routerName: string;
  generateOpen: boolean;
  onGenerateOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const statusLabel = useVoucherStatusLabels();
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [status, setStatus] = useState<VoucherStatus | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<HotspotVoucher | null>(null);

  const vouchers = useHotspotVouchers(routerId, { page, pageSize, search, status });
  const update = useUpdateHotspotUser(routerId);
  const mutateVoucher = update.mutate;
  const remove = useDeleteHotspotUser(routerId);
  const summary = vouchers.data?.summary;
  const statusOptions = (['unused', 'used', 'disabled'] as const).map((value) => ({ value, label: statusLabel[value] }));

  const columns = useMemo<LegacyColumnDef<HotspotVoucher, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t('admin.ops.vouchers.colCode', 'Voucher Code'),
        enableHiding: false,
        size: 190,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Key className="h-4 w-4" />
            </div>
            <span className="font-mono text-sm font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {row.original.code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'profile',
        header: t('admin.ops.vouchers.colProfile', 'Profile'),
        size: 170,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-sm font-normal">
            {row.original.profile}
          </Badge>
        ),
      },
      {
        accessorKey: 'batch',
        header: t('admin.ops.vouchers.colBatch', 'Batch'),
        size: 160,
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-mono text-muted-foreground">{row.original.batch || '—'}</span>
            {row.original.generatedOn ? <span className="block text-muted-foreground">{row.original.generatedOn}</span> : null}
          </div>
        ),
      },
      {
        id: 'time',
        header: t('admin.ops.vouchers.colUptime', 'Uptime / Limit'),
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {row.original.uptime || '0s'} / {row.original.limitUptime || t('admin.ops.vouchers.noLimit', 'no limit')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 120,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant="outline"
              tone={s === 'unused' ? 'success' : s === 'used' ? 'warning' : 'neutral'}
            >
              {statusLabel[s]}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const v = row.original;
          const disabled = v.status === 'disabled';
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('admin.ops.vouchers.actionsFor', 'Actions for voucher {code}', { code: v.code })}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('admin.ops.vouchers.actionsLabel', 'Voucher Actions')}</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      mutateVoucher(
                        { id: v.id, disabled: !disabled },
                        {
                          onSuccess: () =>
                            toast.success(
                              disabled
                                ? t('admin.ops.vouchers.toast.enabled', 'Voucher {code} enabled', { code: v.code })
                                : t('admin.ops.vouchers.toast.disabled', 'Voucher {code} disabled', { code: v.code }),
                            ),
                        },
                      )
                    }
                  >
                    {disabled ? <Power className="h-3.5 w-3.5 mr-2" /> : <Ban className="h-3.5 w-3.5 mr-2" />}
                    {disabled ? t('admin.ops.vouchers.enable', 'Enable Voucher') : t('admin.ops.vouchers.disable', 'Disable Voucher')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(v)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  {t('admin.ops.vouchers.delete', 'Delete Voucher')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [mutateVoucher, t, statusLabel],
  );

  if (vouchers.isError) {
    return (
      <HotspotQueryError
        error={vouchers.error}
        routerName={routerName}
        title={t('admin.ops.vouchers.loadFailed', 'Failed to load vouchers')}
        onRetry={() => void vouchers.refetch()}
      />
    );
  }

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label={t('admin.ops.vouchers.kpiTotal', 'Total Vouchers')}
          value={summary ? summary.total : '—'}
          hint={t('admin.ops.vouchers.kpiTotalHint', 'Generated codes on the router')}
          icon={<Ticket className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={statusLabel.unused}
          value={summary ? summary.unused : '—'}
          hint={t('admin.ops.vouchers.kpiUnusedHint', 'Ready to sell')}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label={statusLabel.used}
          value={summary ? summary.used : '—'}
          hint={t('admin.ops.vouchers.kpiUsedHint', 'Logged in at least once')}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <HotspotKpi
          label={statusLabel.disabled}
          value={summary ? summary.disabled : '—'}
          hint={t('admin.ops.vouchers.kpiDisabledHint', 'Blocked from logging in')}
          icon={<Ban className="h-4 w-4 text-muted-foreground" />}
        />
      </HotspotKpiRow>

      <DataTable urlState
        columns={columns}
        data={vouchers.data?.items ?? []}
        isLoading={vouchers.isLoading}
        emptyTitle={search || status ? t('admin.ops.vouchers.emptyFiltered', 'No vouchers match') : t('admin.ops.vouchers.emptyNone', 'No vouchers yet')}
        emptyDescription={t('admin.ops.vouchers.emptyHint', 'Generate a batch to create voucher codes on this router.')}
        searchPlaceholder={t('admin.ops.vouchers.searchPlaceholder', 'Search by code, profile or batch...')}
        getRowId={(r) => r.id}
        toolbarActions={
          <Select
            value={status || ALL}
            onValueChange={(v) => {
              setStatus(!v || v === ALL ? '' : (v as VoucherStatus));
              table.resetPage();
            }}
            items={[{ value: ALL, label: t('admin.support.filter.allStatuses', 'All statuses') }, ...statusOptions]}
          >
            <SelectTrigger className="h-9 min-w-36" aria-label={t('admin.ops.vouchers.filterStatus', 'Filter by status')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('admin.support.filter.allStatuses', 'All statuses')}</SelectItem>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        server={table.server(vouchers.data?.meta.total ?? 0)}
      />

      {generateOpen ? <GenerateDialog routerId={routerId} routerName={routerName} onClose={() => onGenerateOpenChange(false)} /> : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t('admin.ops.vouchers.deleteTitle', 'Delete this voucher?')}
        description={
          deleteTarget
            ? t('admin.ops.vouchers.deleteDesc', 'Voucher {code} is removed from the router and can no longer log in.', { code: deleteTarget.code })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () => toast.success(t('admin.ops.vouchers.toast.deleted', 'Voucher {code} deleted', { code: target.code })),
          });
        }}
      />
    </>
  );
}

interface GenerateForm {
  profile: string;
  qty: string;
  codeLength: string;
  prefix: string;
  timeLimit: string;
  dataLimitMb: string;
  batch: string;
}

const EMPTY_FORM: GenerateForm = { profile: '', qty: '', codeLength: '6', prefix: '', timeLimit: '', dataLimitMb: '', batch: '' };

function GenerateDialog({ routerId, routerName, onClose }: { routerId: string; routerName: string; onClose: () => void }) {
  const t = useTranslations();
  const profilesQuery = useHotspotProfiles(routerId);
  const generate = useGenerateVouchers(routerId);
  const [form, setForm] = useState<GenerateForm>(EMPTY_FORM);
  const [result, setResult] = useState<GenerateVouchersResult | null>(null);
  const set = (patch: Partial<GenerateForm>) => setForm((f) => ({ ...f, ...patch }));

  const profiles = profilesQuery.data?.profiles ?? [];
  const profile = form.profile || profiles[0]?.name || '';
  const qty = Number(form.qty);
  const len = Number(form.codeLength);
  const errors = {
    qty: !Number.isInteger(qty) || qty < 1 || qty > 500 ? t('admin.ops.vouchers.err.qty', 'Between 1 and 500') : '',
    codeLength: !Number.isInteger(len) || len < 3 || len > 12 ? t('admin.ops.vouchers.err.codeLength', 'Between 3 and 12') : '',
    prefix: form.prefix && !/^[A-Za-z0-9]{1,16}$/.test(form.prefix) ? t('admin.ops.vouchers.err.prefix', 'Letters and digits only') : '',
    timeLimit: form.timeLimit && !DURATION_RE.test(form.timeLimit) ? t('admin.ops.vouchers.err.timeLimit', 'Use a duration like 12h or 1d') : '',
    batch: form.batch.length > 40 ? t('admin.ops.vouchers.err.batch', 'At most 40 characters') : '',
  };
  const invalid = Object.values(errors).some(Boolean) || !profile;

  const submit = () => {
    const input: GenerateVouchersInput = {
      profile,
      qty,
      codeLength: len,
      prefix: form.prefix,
      timeLimit: form.timeLimit,
      dataLimitMb: form.dataLimitMb,
      batch: form.batch.trim(),
    };
    generate.mutate(input, {
      onSuccess: (res) => {
        setResult(res);
        toast.success(
          res.count === 1
            ? t('admin.ops.vouchers.toast.generatedOne', '1 voucher generated')
            : t('admin.ops.vouchers.toast.generatedMany', '{n} vouchers generated', { n: res.count }),
        );
      },
    });
  };

  const created = result?.vouchers.filter((v) => v.success) ?? [];
  const failed = result?.vouchers.filter((v) => !v.success) ?? [];

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                {t('admin.ops.vouchers.resultTitle', '{count} of {requested} vouchers generated', { count: result.count, requested: result.requested })}
              </DialogTitle>
              <DialogDescription>
                {t('admin.ops.vouchers.resultDesc', 'Each code is both the login and the password.')}{' '}
                {failed.length > 0 ? t('admin.ops.vouchers.resultRejected', '{n} were rejected by the router.', { n: failed.length }) : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto py-4">
              {created.map((v) => (
                <span
                  key={v.code}
                  className="rounded border border-border/70 bg-muted px-2 py-1 text-center font-mono text-sm font-bold tracking-wider"
                >
                  {v.code}
                </span>
              ))}
            </div>
            {failed.length > 0 ? <p className="text-destructive text-xs">{failed[0].error}</p> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={created.length === 0}
                onClick={() =>
                  downloadCsv(
                    `hotspot_vouchers_${routerName || routerId}_${form.batch.trim() || profile}.csv`,
                    ['Voucher Code', 'Profile', 'Batch'],
                    created.map((v) => [v.code, profile, form.batch.trim()]),
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {t('admin.ops.vouchers.downloadCsv', 'Download CSV')}
              </Button>
              <Button type="button" onClick={onClose}>
                {t('admin.ops.vouchers.done', 'Done')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!invalid) submit();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                {t('admin.ops.vouchers.formTitle', 'Generate Voucher Batch')}
              </DialogTitle>
              <DialogDescription>{t('admin.ops.vouchers.formDesc', 'Creates voucher codes on the router for the selected profile.')}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="vch-profile">{t('admin.ops.vouchers.fieldProfile', 'Profile *')}</Label>
                <Select value={profile || null} onValueChange={(v) => v && set({ profile: String(v) })}>
                  <SelectTrigger id="vch-profile" className="w-full" disabled={profilesQuery.isLoading}>
                    <SelectValue
                      placeholder={
                        profilesQuery.isLoading
                          ? t('admin.ops.vouchers.profilesLoading', 'Loading profiles…')
                          : profilesQuery.isError
                            ? t('admin.ops.vouchers.profilesFailed', 'Could not load profiles')
                            : t('admin.ops.vouchers.profilesNone', 'No profiles on router')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id || p.name} value={p.name}>
                        {p.name}
                        {p.validity ? ` · ${p.validity}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {profilesQuery.isError ? (
                  <button type="button" className="text-xs text-primary underline" onClick={() => void profilesQuery.refetch()}>
                    {t('admin.ops.vouchers.profilesRetry', 'Retry loading profiles')}
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vch-qty">{t('admin.ops.vouchers.fieldQty', 'Quantity *')}</Label>
                  <Input
                    id="vch-qty"
                    type="number"
                    min={1}
                    max={500}
                    value={form.qty}
                    onChange={(e) => set({ qty: e.target.value })}
                    aria-invalid={Boolean(form.qty) && Boolean(errors.qty)}
                    required
                  />
                  {form.qty && errors.qty ? <p className="text-destructive text-xs">{errors.qty}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vch-len">{t('admin.ops.vouchers.fieldLength', 'Code Length')}</Label>
                  <Input
                    id="vch-len"
                    type="number"
                    min={3}
                    max={12}
                    value={form.codeLength}
                    onChange={(e) => set({ codeLength: e.target.value })}
                    aria-invalid={Boolean(errors.codeLength)}
                  />
                  {errors.codeLength ? <p className="text-destructive text-xs">{errors.codeLength}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vch-prefix">{t('admin.ops.vouchers.fieldPrefix', 'Code Prefix')}</Label>
                  <Input
                    id="vch-prefix"
                    value={form.prefix}
                    onChange={(e) => set({ prefix: e.target.value.trim() })}
                    placeholder={t('admin.ops.vouchers.optional', 'Optional')}
                    className="font-mono"
                    aria-invalid={Boolean(errors.prefix)}
                  />
                  {errors.prefix ? <p className="text-destructive text-xs">{errors.prefix}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vch-batch">{t('admin.ops.vouchers.fieldBatch', 'Batch Name')}</Label>
                  <Input
                    id="vch-batch"
                    value={form.batch}
                    onChange={(e) => set({ batch: e.target.value })}
                    placeholder={t('admin.ops.vouchers.optional', 'Optional')}
                    aria-invalid={Boolean(errors.batch)}
                  />
                  {errors.batch ? <p className="text-destructive text-xs">{errors.batch}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vch-time">{t('admin.ops.vouchers.fieldTime', 'Time Limit')}</Label>
                  <Input
                    id="vch-time"
                    value={form.timeLimit}
                    onChange={(e) => set({ timeLimit: e.target.value.trim() })}
                    placeholder={t('admin.ops.vouchers.timePlaceholder', 'Optional, e.g. 1d')}
                    className="font-mono"
                    aria-invalid={Boolean(errors.timeLimit)}
                  />
                  {errors.timeLimit ? <p className="text-destructive text-xs">{errors.timeLimit}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vch-data">{t('admin.ops.vouchers.fieldData', 'Data Limit (MB)')}</Label>
                  <Input
                    id="vch-data"
                    type="number"
                    min={0}
                    value={form.dataLimitMb}
                    onChange={(e) => set({ dataLimitMb: e.target.value })}
                    placeholder={t('admin.ops.vouchers.dataPlaceholder', 'Unlimited if empty')}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={invalid || generate.isPending}>
                {generate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('admin.ops.vouchers.submit', 'Generate Vouchers')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
