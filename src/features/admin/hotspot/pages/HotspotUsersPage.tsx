'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useHotspotRouter } from '../hooks/useHotspotRouter';
import {
  useCreateHotspotUser,
  useDeleteHotspotUser,
  useHotspotUsers,
  useUpdateHotspotUser,
  type CreateHotspotUserInput,
} from '../hooks/useHotspotData';
import { HotspotRouterSelect } from '../components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '../components/HotspotStates';
import { HotspotKpi, HotspotKpiRow } from '../components/HotspotKpi';
import type { HotspotProfile, HotspotUser } from '../types';
import { formatBytes } from '../utils';
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
import { formatMac, isValidMac } from '@/lib/format/network';
import { useLocale } from '@/i18n/locale-context';
import {
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ArrowDownUp,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Laptop,
  Ban,
  Power,
  Loader2,
} from 'lucide-react';

/** RouterOS duration the backend accepts for limits/extensions: 30m, 12h, 1d, 1w2d… */
const DURATION_RE = /^(\d{1,4}[wdhm]){1,4}$/;
const ALL_PROFILES = '__all__';

export function HotspotUsersPage() {
  const { t } = useLocale();
  const hs = useHotspotRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.hotspot.users.title', 'Hotspot Users & Client Accounts')}
        subtitle={t(
          'admin.hotspot.users.subtitle',
          'Hotspot logins on the selected router: bound MAC, time limit, traffic and status.',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.hotspot', 'Hotspot'), href: '/admin/hotspot' },
          { label: t('admin.hotspot.users.crumb', 'Users') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.hotspot.users.add', 'Add Hotspot User')}
              </Button>
            ) : null}
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? (
          <UsersBody
            key={hs.router.id}
            routerId={hs.router.id}
            routerName={hs.router.name}
            createOpen={createOpen}
            onCreateOpenChange={setCreateOpen}
          />
        ) : null}
      </HotspotRouterGate>
    </div>
  );
}

function UsersBody({
  routerId,
  routerName,
  createOpen,
  onCreateOpenChange,
}: {
  routerId: string;
  routerName: string;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [profileFilter, setProfileFilter] = useState('');
  const [extendTarget, setExtendTarget] = useState<HotspotUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HotspotUser | null>(null);

  const users = useHotspotUsers(routerId, { page, pageSize, search, profile: profileFilter });
  const update = useUpdateHotspotUser(routerId);
  const mutateUser = update.mutate;
  const remove = useDeleteHotspotUser(routerId);

  const profiles = users.data?.profiles ?? [];
  const servers = users.data?.servers ?? [];
  const summary = users.data?.summary;

  const columns = useMemo<LegacyColumnDef<HotspotUser, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.hotspot.users.colAccount', 'User Account'),
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Laptop className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
              {row.original.comment ? (
                <span className="block truncate font-mono text-xs text-muted-foreground">{row.original.comment}</span>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'profile',
        header: t('admin.hotspot.col.profile', 'Profile'),
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-medium">
            {row.original.profile || 'default'}
          </Badge>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: t('admin.hotspot.users.colMac', 'Bound MAC'),
        size: 160,
        cell: ({ row }) =>
          row.original.macAddress ? (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {formatMac(row.original.macAddress)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('admin.hotspot.users.notBound', 'Not bound')}</span>
          ),
      },
      {
        id: 'time',
        header: t('admin.hotspot.users.colTime', 'Uptime / Limit'),
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {row.original.uptime || '0s'} / {row.original.limitUptime || t('admin.hotspot.users.noLimit', 'no limit')}
            </span>
          </div>
        ),
      },
      {
        id: 'traffic',
        header: t('admin.hotspot.col.traffic', 'Traffic (In / Out)'),
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <span className="text-emerald-500 font-medium">↓ {formatBytes(row.original.bytesIn)}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-sky-500 font-medium">↑ {formatBytes(row.original.bytesOut)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'disabled',
        header: t('admin.hotspot.col.status', 'Status'),
        size: 110,
        cell: ({ row }) => {
          const enabled = !row.original.disabled;
          return (
            <Badge
              variant="outline"
              tone={enabled ? 'success' : 'neutral'}
            >
              {enabled ? t('admin.hotspot.users.enabled', 'Enabled') : t('admin.hotspot.users.disabled', 'Disabled')}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('admin.customers.list.actionsFor', 'Actions for {name}', { name: u.name })}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('admin.hotspot.users.actions', 'User Actions')}</DropdownMenuLabel>
                  <DropdownMenuItem disabled={!u.limitUptime} onClick={() => setExtendTarget(u)}>
                    <Clock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    {u.limitUptime
                      ? t('admin.hotspot.users.extend', 'Extend Time Limit')
                      : t('admin.hotspot.users.noTimeLimit', 'No Time Limit')}
                  </DropdownMenuItem>
                  {u.macAddress ? (
                    <DropdownMenuItem
                      onClick={() =>
                        mutateUser(
                          { id: u.id, resetMac: true },
                          {
                            onSuccess: () =>
                              toast.success(t('admin.hotspot.users.macCleared', 'MAC binding cleared for {name}', { name: u.name })),
                          },
                        )
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-2" />
                      {t('admin.hotspot.users.resetMac', 'Reset MAC Binding')}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={() =>
                      mutateUser(
                        { id: u.id, disabled: !u.disabled },
                        {
                          onSuccess: () =>
                            toast.success(
                              u.disabled
                                ? t('admin.hotspot.users.userEnabled', '{name} enabled', { name: u.name })
                                : t('admin.hotspot.users.userDisabled', '{name} disabled', { name: u.name }),
                            ),
                        },
                      )
                    }
                  >
                    {u.disabled ? <Power className="h-3.5 w-3.5 mr-2" /> : <Ban className="h-3.5 w-3.5 mr-2" />}
                    {u.disabled ? t('admin.hotspot.users.enable', 'Enable User') : t('admin.hotspot.users.disable', 'Disable User')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(u)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  {t('admin.hotspot.users.delete', 'Delete User')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [mutateUser, t],
  );

  if (users.isError) {
    return (
      <HotspotQueryError
        error={users.error}
        routerName={routerName}
        title={t('admin.hotspot.users.loadFailed', 'Failed to load hotspot users')}
        onRetry={() => void users.refetch()}
      />
    );
  }

  const total = users.data?.meta.total ?? 0;

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label={
            search || profileFilter
              ? t('admin.hotspot.users.kpiMatching', 'Matching Users')
              : t('admin.hotspot.users.kpiTotal', 'Total Users')
          }
          value={users.isLoading ? '—' : total}
          hint={t('admin.hotspot.users.kpiTotalHint', 'Users & voucher accounts')}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.users.enabled', 'Enabled')}
          value={summary ? summary.enabled : '—'}
          hint={t('admin.hotspot.users.kpiEnabledHint', 'Allowed to log in')}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label={t('admin.hotspot.users.disabled', 'Disabled')}
          value={summary ? summary.disabled : '—'}
          hint={t('admin.hotspot.users.kpiDisabledHint', 'Blocked from logging in')}
          icon={<Ban className="h-4 w-4 text-muted-foreground" />}
        />
        <HotspotKpi
          label={t('admin.hotspot.users.kpiTraffic', 'Total Traffic')}
          value={summary ? formatBytes(summary.bytesIn + summary.bytesOut) : '—'}
          hint={t('admin.hotspot.users.kpiTrafficHint', 'Counted on the router')}
          icon={<ArrowDownUp className="h-4 w-4 text-primary" />}
        />
      </HotspotKpiRow>

      <DataTable urlState
        columns={columns}
        data={users.data?.items ?? []}
        isLoading={users.isLoading}
        emptyTitle={
          search || profileFilter
            ? t('admin.hotspot.users.emptyFiltered', 'No users match')
            : t('admin.hotspot.users.emptyTitle', 'No hotspot users yet')
        }
        emptyDescription={t('admin.hotspot.users.emptyDesc', 'Hotspot users on this router appear here.')}
        searchPlaceholder={t('admin.hotspot.users.searchPlaceholder', 'Search by username or comment...')}
        getRowId={(r) => r.id}
        toolbarActions={
          profiles.length > 0 ? (
            <Select
              value={profileFilter || ALL_PROFILES}
              onValueChange={(v) => {
                setProfileFilter(!v || v === ALL_PROFILES ? '' : String(v));
                table.resetPage();
              }}
            >
              <SelectTrigger className="h-9 min-w-40" aria-label={t('admin.hotspot.users.filterProfile', 'Filter by profile')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROFILES}>{t('admin.hotspot.users.allProfiles', 'All profiles')}</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id || p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
        server={table.server(total)}
      />

      <CreateUserDialog
        routerId={routerId}
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        profiles={profiles}
        servers={servers}
      />

      <ExtendDialog
        user={extendTarget}
        pending={update.isPending}
        onClose={() => setExtendTarget(null)}
        onSubmit={(extendUptime) => {
          const target = extendTarget;
          if (!target) return;
          update.mutate(
            { id: target.id, extendUptime },
            {
              onSuccess: (res) => {
                toast.success(
                  res?.limit_uptime
                    ? t('admin.hotspot.users.extendedTo', '{name} time limit is now {limit}', {
                        name: target.name,
                        limit: res.limit_uptime,
                      })
                    : t('admin.hotspot.users.extended', '{name} time limit extended', { name: target.name }),
                );
                setExtendTarget(null);
              },
            },
          );
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t('admin.hotspot.users.deleteTitle', 'Delete this hotspot user?')}
        description={
          deleteTarget
            ? t('admin.hotspot.users.deleteDesc', '{name} will be removed from the router and can no longer log in.', {
                name: deleteTarget.name,
              })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () => toast.success(t('admin.hotspot.users.deleted', '{name} deleted', { name: target.name })),
          });
        }}
      />
    </>
  );
}

function ExtendDialog({
  user,
  pending,
  onClose,
  onSubmit,
}: {
  user: HotspotUser | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (duration: string) => void;
}) {
  const { t } = useLocale();
  const [duration, setDuration] = useState('1d');
  const valid = DURATION_RE.test(duration.trim());

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSubmit(duration.trim());
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t('admin.hotspot.users.extend', 'Extend Time Limit')}
            </DialogTitle>
            <DialogDescription>
              {user
                ? t('admin.hotspot.users.extendDesc', '{name} can be online for {limit} in total. Add more time to that limit.', {
                    name: user.name,
                    limit: user.limitUptime,
                  })
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-4">
            <Label htmlFor="ext-duration">{t('admin.hotspot.users.addTime', 'Add time')}</Label>
            <Input
              id="ext-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t('admin.hotspot.users.addTimePlaceholder', 'e.g. 1h, 1d, 7d')}
              className="font-mono"
              aria-invalid={!valid}
              required
            />
            {!valid ? (
              <p className="text-destructive text-xs">
                {t('admin.hotspot.users.durationError', 'Use a duration like 30m, 12h, 1d or 1w.')}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('admin.hotspot.users.extendAction', 'Extend')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_USER: CreateHotspotUserInput = {
  name: '',
  password: '',
  profile: '',
  server: '',
  macAddress: '',
  timeLimit: '',
  dataLimitMb: '',
  comment: '',
};

function CreateUserDialog({
  routerId,
  open,
  onOpenChange,
  profiles,
  servers,
}: {
  routerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: HotspotProfile[];
  servers: string[];
}) {
  const { t } = useLocale();
  const create = useCreateHotspotUser(routerId);
  const [form, setForm] = useState<CreateHotspotUserInput>(EMPTY_USER);
  const set = (patch: Partial<CreateHotspotUserInput>) => setForm((f) => ({ ...f, ...patch }));
  const profile = form.profile || profiles[0]?.name || '';

  const macError = form.macAddress && !isValidMac(form.macAddress) ? t('admin.hotspot.users.macError', 'Use the form AA:BB:CC:DD:EE:FF') : '';
  const timeError = form.timeLimit && !DURATION_RE.test(form.timeLimit) ? t('admin.hotspot.users.timeError', 'Use a duration like 12h or 1d') : '';
  const nameError = /\s/.test(form.name) ? t('admin.hotspot.users.nameError', 'No spaces in usernames') : '';
  const invalid = Boolean(macError || timeError || nameError) || !form.name.trim() || !form.password || !profile;

  const close = (next: boolean) => {
    if (!next) setForm(EMPTY_USER);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            create.mutate(
              { ...form, name: form.name.trim(), profile, macAddress: form.macAddress ? formatMac(form.macAddress) : '' },
              {
                onSuccess: () => {
                  toast.success(t('admin.hotspot.users.created', 'Hotspot user "{name}" created', { name: form.name.trim() }));
                  close(false);
                },
              },
            );
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('admin.hotspot.users.add', 'Add Hotspot User')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.hotspot.users.createDesc', 'Creates a login on the router with the selected profile.')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-name">{t('admin.hotspot.users.username', 'Username *')}</Label>
                <Input id="usr-name" value={form.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={Boolean(nameError)} required />
                {nameError ? <p className="text-destructive text-xs">{nameError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-pass">{t('admin.hotspot.users.password', 'Password *')}</Label>
                <Input id="usr-pass" value={form.password} onChange={(e) => set({ password: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-profile">{t('admin.hotspot.users.profileRequired', 'Profile *')}</Label>
                <Select value={profile || null} onValueChange={(v) => v && set({ profile: String(v) })}>
                  <SelectTrigger id="usr-profile" className="w-full">
                    <SelectValue
                      placeholder={
                        profiles.length
                          ? t('admin.hotspot.users.selectProfile', 'Select profile')
                          : t('admin.hotspot.users.noProfiles', 'No profiles on router')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id || p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-server">{t('admin.hotspot.users.server', 'Hotspot Server')}</Label>
                <Select value={form.server || 'all'} onValueChange={(v) => set({ server: v && v !== 'all' ? String(v) : '' })}>
                  <SelectTrigger id="usr-server" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.hotspot.users.allServers', 'All servers')}</SelectItem>
                    {servers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-time">{t('admin.hotspot.users.timeLimit', 'Time Limit')}</Label>
                <Input
                  id="usr-time"
                  value={form.timeLimit}
                  onChange={(e) => set({ timeLimit: e.target.value.trim() })}
                  placeholder={t('admin.hotspot.users.timeLimitPlaceholder', 'From profile if empty')}
                  className="font-mono"
                  aria-invalid={Boolean(timeError)}
                />
                {timeError ? <p className="text-destructive text-xs">{timeError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-data">{t('admin.hotspot.users.dataLimit', 'Data Limit (MB)')}</Label>
                <Input
                  id="usr-data"
                  type="number"
                  min={0}
                  value={form.dataLimitMb}
                  onChange={(e) => set({ dataLimitMb: e.target.value })}
                  placeholder={t('admin.hotspot.users.dataLimitPlaceholder', 'Unlimited if empty')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-mac">{t('admin.hotspot.users.boundMac', 'Bound MAC Address')}</Label>
                <Input
                  id="usr-mac"
                  value={form.macAddress}
                  onChange={(e) => set({ macAddress: e.target.value.trim() })}
                  placeholder={t('admin.hotspot.users.optional', 'Optional')}
                  className="font-mono uppercase"
                  aria-invalid={Boolean(macError)}
                />
                {macError ? <p className="text-destructive text-xs">{macError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-comment">{t('admin.hotspot.users.comment', 'Comment')}</Label>
                <Input
                  id="usr-comment"
                  value={form.comment}
                  onChange={(e) => set({ comment: e.target.value })}
                  placeholder={t('admin.hotspot.users.optional', 'Optional')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={invalid || create.isPending}>
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('admin.hotspot.users.createAction', 'Create User')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
