'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useHotspotRouter } from '@/features/admin/hotspot/hooks/useHotspotRouter';
import {
  useDeleteWalledGardenRule,
  useSaveWalledGardenRule,
  useWalledGarden,
} from '@/features/admin/hotspot/hooks/useWalledGarden';
import { HotspotRouterSelect } from '@/features/admin/hotspot/components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '@/features/admin/hotspot/components/HotspotStates';
import { HotspotKpi, HotspotKpiRow } from '@/features/admin/hotspot/components/HotspotKpi';
import type { WalledGardenRule } from '@/features/admin/hotspot/types';
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
import { Plus, ShieldCheck, CheckCircle2, Globe, MoreHorizontal, Edit, Trash2, Ban, Power, ShieldX, Loader2 } from 'lucide-react';

/** Mirrors the backend rule: host name / wildcard / IP, no spaces or punctuation. */
const HOST_RE = /^[a-z0-9*][a-z0-9*.-]{0,252}$/;

const ACTIONS = [
  { value: 'allow', label: 'Allow' },
  { value: 'deny', label: 'Deny' },
] as const;

type EditorState = { rule: WalledGardenRule | null } | null;

export function WalledGardenPage() {
  const hs = useHotspotRouter();
  const [editor, setEditor] = useState<EditorState>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Walled Garden Rules"
        subtitle="Hosts guests can reach before logging in to the hotspot of the selected router."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Walled Garden' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            {hs.router ? (
              <Button size="sm" onClick={() => setEditor({ rule: null })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Add Host Rule
              </Button>
            ) : null}
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? (
          <WalledGardenBody
            key={hs.router.id}
            routerId={hs.router.id}
            routerName={hs.router.name}
            editor={editor}
            onEditorChange={setEditor}
          />
        ) : null}
      </HotspotRouterGate>
    </div>
  );
}

function WalledGardenBody({
  routerId,
  routerName,
  editor,
  onEditorChange,
}: {
  routerId: string;
  routerName: string;
  editor: EditorState;
  onEditorChange: (next: EditorState) => void;
}) {
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [deleteTarget, setDeleteTarget] = useState<WalledGardenRule | null>(null);

  const rules = useWalledGarden(routerId, { page, pageSize, search });
  const save = useSaveWalledGardenRule(routerId);
  const saveRule = save.mutate;
  const remove = useDeleteWalledGardenRule(routerId);
  const summary = rules.data?.summary;

  const columns = useMemo<LegacyColumnDef<WalledGardenRule, unknown>[]>(
    () => [
      {
        accessorKey: 'dstHost',
        header: 'Destination Host',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
                {row.original.dstHost || '—'}
              </span>
              {row.original.dynamic ? <span className="mt-0.5 block text-xs text-muted-foreground">Added by the router</span> : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        size: 100,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.action === 'allow'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            }
          >
            {row.original.action === 'allow' ? 'Allow' : 'Deny'}
          </Badge>
        ),
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        size: 280,
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.comment || '—'}</span>,
      },
      {
        accessorKey: 'hits',
        header: 'Hits',
        size: 90,
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{row.original.hits}</span>,
      },
      {
        accessorKey: 'enabled',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={row.original.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
          >
            {row.original.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          if (r.dynamic) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Actions for ${r.dstHost}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Rule Options</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEditorChange({ rule: r })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Rule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      saveRule(
                        { id: r.id, enabled: !r.enabled },
                        { onSuccess: () => toast.success(`${r.dstHost} ${r.enabled ? 'disabled' : 'enabled'}`) },
                      )
                    }
                  >
                    {r.enabled ? <Ban className="h-3.5 w-3.5 mr-2" /> : <Power className="h-3.5 w-3.5 mr-2" />}
                    {r.enabled ? 'Disable Rule' : 'Enable Rule'}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleteTarget(r)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Remove Rule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEditorChange, saveRule],
  );

  if (rules.isError) {
    return (
      <HotspotQueryError
        error={rules.error}
        routerName={routerName}
        title="Failed to load walled garden rules"
        onRetry={() => void rules.refetch()}
      />
    );
  }

  return (
    <>
      <HotspotKpiRow>
        <HotspotKpi
          label="Total Rules"
          value={summary ? summary.total : '—'}
          hint="Walled garden entries"
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
        />
        <HotspotKpi
          label="Enabled"
          value={summary ? summary.enabled : '—'}
          hint="Applied before login"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          positive
        />
        <HotspotKpi
          label="Disabled"
          value={summary ? summary.disabled : '—'}
          hint="Kept but not applied"
          icon={<Ban className="h-4 w-4 text-muted-foreground" />}
        />
        <HotspotKpi
          label="Deny Rules"
          value={summary ? summary.deny : '—'}
          hint={summary ? `${summary.allow} allow rules` : undefined}
          icon={<ShieldX className="h-4 w-4 text-rose-500" />}
        />
      </HotspotKpiRow>

      <DataTable
        columns={columns}
        data={rules.data?.items ?? []}
        isLoading={rules.isLoading}
        emptyTitle={search ? 'No rules match' : 'No walled garden rules'}
        emptyDescription="Add the hosts guests must reach before logging in, e.g. your payment gateway."
        searchPlaceholder="Search host or comment..."
        getRowId={(r) => r.id}
        server={table.server(rules.data?.meta.total ?? 0)}
      />

      {editor ? (
        <RuleDialog
          key={editor.rule?.id ?? 'new'}
          rule={editor.rule}
          pending={save.isPending}
          onClose={() => onEditorChange(null)}
          onSubmit={(input) =>
            saveRule(
              { id: editor.rule?.id, ...input },
              {
                onSuccess: () => {
                  toast.success(editor.rule ? `Rule ${input.dstHost} updated` : `${input.dstHost} added to the walled garden`);
                  onEditorChange(null);
                },
              },
            )
          }
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Remove this rule?"
        description={deleteTarget ? `${deleteTarget.dstHost} is removed from the router's walled garden.` : undefined}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          remove.mutate(target.id, { onSuccess: () => toast.success(`${target.dstHost} removed`) });
        }}
      />
    </>
  );
}

interface RuleInput {
  dstHost: string;
  action: 'allow' | 'deny';
  comment: string;
  enabled: boolean;
}

function RuleDialog({
  rule,
  pending,
  onClose,
  onSubmit,
}: {
  rule: WalledGardenRule | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: RuleInput) => void;
}) {
  const [form, setForm] = useState<RuleInput>({
    dstHost: rule?.dstHost ?? '',
    action: rule?.action ?? 'allow',
    comment: rule?.comment ?? '',
    enabled: rule?.enabled ?? true,
  });
  const set = (patch: Partial<RuleInput>) => setForm((f) => ({ ...f, ...patch }));
  const host = form.dstHost.trim().toLowerCase();
  const hostError = host && (!HOST_RE.test(host) || !/[a-z0-9]/.test(host)) ? 'Use a host like *.bkash.com or an IP address' : '';
  const commentError = form.comment.length > 120 ? 'At most 120 characters' : '';
  const invalid = !host || Boolean(hostError || commentError);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) onSubmit({ ...form, dstHost: host, comment: form.comment.trim() });
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {rule ? 'Edit Walled Garden Rule' : 'Add Walled Garden Host'}
            </DialogTitle>
            <DialogDescription>Guests can reach allowed hosts before logging in to the hotspot.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="wg-host">Destination Host *</Label>
              <Input
                id="wg-host"
                placeholder="e.g. *.bkash.com"
                value={form.dstHost}
                onChange={(e) => set({ dstHost: e.target.value })}
                className="font-mono"
                aria-invalid={Boolean(hostError)}
                required
              />
              {hostError ? <p className="text-destructive text-xs">{hostError}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="wg-action">Action</Label>
                <Select value={form.action} onValueChange={(v) => v && set({ action: v as RuleInput['action'] })} items={[...ACTIONS]}>
                  <SelectTrigger id="wg-action" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-end justify-between gap-3 pb-1.5">
                <span className="text-sm font-medium">Enabled</span>
                <Switch checked={form.enabled} onCheckedChange={(checked) => set({ enabled: Boolean(checked) })} />
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wg-desc">Comment</Label>
              <Input
                id="wg-desc"
                placeholder="Optional, e.g. payment gateway checkout"
                value={form.comment}
                onChange={(e) => set({ comment: e.target.value })}
                aria-invalid={Boolean(commentError)}
              />
              {commentError ? <p className="text-destructive text-xs">{commentError}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={invalid || pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {rule ? 'Save Rule' : 'Add Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
