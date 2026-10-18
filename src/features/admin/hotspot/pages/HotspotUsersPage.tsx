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
  const hs = useHotspotRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Users & Client Accounts"
        subtitle="Hotspot logins on the selected router: bound MAC, time limit, traffic and status."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Users' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Add Hotspot User
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
        header: 'User Account',
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
        header: 'Profile',
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-medium">
            {row.original.profile || 'default'}
          </Badge>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: 'Bound MAC',
        size: 160,
        cell: ({ row }) =>
          row.original.macAddress ? (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {formatMac(row.original.macAddress)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Not bound</span>
          ),
      },
      {
        id: 'time',
        header: 'Uptime / Limit',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {row.original.uptime || '0s'} / {row.original.limitUptime || 'no limit'}
            </span>
          </div>
        ),
      },
      {
        id: 'traffic',
        header: 'Traffic (In / Out)',
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
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const enabled = !row.original.disabled;
          return (
            <Badge
              variant="outline"
              className={enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
            >
              {enabled ? 'Enabled' : 'Disabled'}
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
                aria-label={`Actions for ${u.name}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                  <DropdownMenuItem disabled={!u.limitUptime} onClick={() => setExtendTarget(u)}>
                    <Clock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    {u.limitUptime ? 'Extend Time Limit' : 'No Time Limit'}
                  </DropdownMenuItem>
                  {u.macAddress ? (
                    <DropdownMenuItem
                      onClick={() =>
                        mutateUser(
                          { id: u.id, resetMac: true },
                          { onSuccess: () => toast.success(`MAC binding cleared for ${u.name}`) },
                        )
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-2" />
                      Reset MAC Binding
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={() =>
                      mutateUser(
                        { id: u.id, disabled: !u.disabled },
                        { onSuccess: () => toast.success(`${u.name} ${u.disabled ? 'enabled' : 'disabled'}`) },
                      )
                    }
                  >
                    {u.disabled ? <Power className="h-3.5 w-3.5 mr-2" /> : <Ban className="h-3.5 w-3.5 mr-2" />}
                    {u.disabled ? 'Enable User' : 'Disable User'}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(u)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [mutateUser],
  );

  if (users.isError) {
    return (
      <HotspotQueryError
        error={users.error}
        routerName={routerName}
        title="Failed to load hotspot users"
        onRetry={() => void users.refetch()}
      />
    );
  }

  const total = users.data?.meta.total ?? 0;

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label={search || profileFilter ? 'Matching Users' : 'Total Users'}
          value={users.isLoading ? '—' : total}
          hint="Users & voucher accounts"
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label="Enabled"
          value={summary ? summary.enabled : '—'}
          hint="Allowed to log in"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label="Disabled"
          value={summary ? summary.disabled : '—'}
          hint="Blocked from logging in"
          icon={<Ban className="h-4 w-4 text-muted-foreground" />}
        />
        <HotspotKpi
          label="Total Traffic"
          value={summary ? formatBytes(summary.bytesIn + summary.bytesOut) : '—'}
          hint="Counted on the router"
          icon={<ArrowDownUp className="h-4 w-4 text-primary" />}
        />
      </HotspotKpiRow>

      <DataTable
        columns={columns}
        data={users.data?.items ?? []}
        isLoading={users.isLoading}
        emptyTitle={search || profileFilter ? 'No users match' : 'No hotspot users yet'}
        emptyDescription="Hotspot users on this router appear here."
        searchPlaceholder="Search by username or comment..."
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
              <SelectTrigger className="h-9 min-w-40" aria-label="Filter by profile">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROFILES}>All profiles</SelectItem>
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
                toast.success(`${target.name} time limit is now ${res?.limit_uptime ?? 'extended'}`);
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
        title="Delete this hotspot user?"
        description={deleteTarget ? `${deleteTarget.name} will be removed from the router and can no longer log in.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, { onSuccess: () => toast.success(`${target.name} deleted`) });
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
              Extend Time Limit
            </DialogTitle>
            <DialogDescription>
              {user ? `${user.name} can be online for ${user.limitUptime} in total. Add more time to that limit.` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-4">
            <Label htmlFor="ext-duration">Add time</Label>
            <Input
              id="ext-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 1h, 1d, 7d"
              className="font-mono"
              aria-invalid={!valid}
              required
            />
            {!valid ? <p className="text-destructive text-xs">Use a duration like 30m, 12h, 1d or 1w.</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Extend
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
  const create = useCreateHotspotUser(routerId);
  const [form, setForm] = useState<CreateHotspotUserInput>(EMPTY_USER);
  const set = (patch: Partial<CreateHotspotUserInput>) => setForm((f) => ({ ...f, ...patch }));
  const profile = form.profile || profiles[0]?.name || '';

  const macError = form.macAddress && !isValidMac(form.macAddress) ? 'Use the form AA:BB:CC:DD:EE:FF' : '';
  const timeError = form.timeLimit && !DURATION_RE.test(form.timeLimit) ? 'Use a duration like 12h or 1d' : '';
  const nameError = /\s/.test(form.name) ? 'No spaces in usernames' : '';
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
                  toast.success(`Hotspot user "${form.name.trim()}" created`);
                  close(false);
                },
              },
            );
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Add Hotspot User
            </DialogTitle>
            <DialogDescription>Creates a login on the router with the selected profile.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-name">Username *</Label>
                <Input id="usr-name" value={form.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={Boolean(nameError)} required />
                {nameError ? <p className="text-destructive text-xs">{nameError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-pass">Password *</Label>
                <Input id="usr-pass" value={form.password} onChange={(e) => set({ password: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-profile">Profile *</Label>
                <Select value={profile || null} onValueChange={(v) => v && set({ profile: String(v) })}>
                  <SelectTrigger id="usr-profile" className="w-full">
                    <SelectValue placeholder={profiles.length ? 'Select profile' : 'No profiles on router'} />
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
                <Label htmlFor="usr-server">Hotspot Server</Label>
                <Select value={form.server || 'all'} onValueChange={(v) => set({ server: v && v !== 'all' ? String(v) : '' })}>
                  <SelectTrigger id="usr-server" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All servers</SelectItem>
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
                <Label htmlFor="usr-time">Time Limit</Label>
                <Input
                  id="usr-time"
                  value={form.timeLimit}
                  onChange={(e) => set({ timeLimit: e.target.value.trim() })}
                  placeholder="From profile if empty"
                  className="font-mono"
                  aria-invalid={Boolean(timeError)}
                />
                {timeError ? <p className="text-destructive text-xs">{timeError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-data">Data Limit (MB)</Label>
                <Input
                  id="usr-data"
                  type="number"
                  min={0}
                  value={form.dataLimitMb}
                  onChange={(e) => set({ dataLimitMb: e.target.value })}
                  placeholder="Unlimited if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-mac">Bound MAC Address</Label>
                <Input
                  id="usr-mac"
                  value={form.macAddress}
                  onChange={(e) => set({ macAddress: e.target.value.trim() })}
                  placeholder="Optional"
                  className="font-mono uppercase"
                  aria-invalid={Boolean(macError)}
                />
                {macError ? <p className="text-destructive text-xs">{macError}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-comment">Comment</Label>
                <Input id="usr-comment" value={form.comment} onChange={(e) => set({ comment: e.target.value })} placeholder="Optional" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invalid || create.isPending}>
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
