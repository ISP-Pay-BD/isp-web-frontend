'use client';

import { useState } from 'react';
import {
  Key,
  Webhook as WebhookIcon,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  History,
  RotateCw,
  Trash2,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/settings/hooks/use-debounced-value';
import {
  useApiKeys,
  useCreateApiKey,
  useCreateWebhook,
  useDeleteWebhook,
  useRevokeApiKey,
  useRotateWebhookSecret,
  useTestWebhook,
  useUpdateWebhook,
  useWebhookDeliveries,
  useWebhooks,
} from '@/features/admin/settings/hooks/use-developer';
import type { ApiKey, Option, Webhook, WebhookDelivery } from '@/features/admin/settings/types';

/** Queue fields the deliveries endpoint returns next to the base delivery row. */
type DeliveryRow = WebhookDelivery & { status?: string; attempts?: number; nextAttemptAt?: string | null };

/** Read-only endpoints an API key unlocks (X-Api-Key header). */
const INTEGRATION_ENDPOINTS = [
  { path: '/api/v1/integrations/customers', note: '?page, per_page, search, status=active|inactive|expired', scope: 'customers:read' },
  { path: '/api/v1/integrations/customers/{id}', note: 'one customer', scope: 'customers:read' },
  { path: '/api/v1/integrations/payments', note: '?page, per_page, from, to (Y-m-d), status=successful|pending|failed', scope: 'payments:read' },
  { path: '/api/v1/integrations/packages', note: '?page, per_page, search, status', scope: 'packages:read' },
];

const fmt = (iso: string | null) => (iso ? new Date(iso.replace(' ', 'T')).toLocaleString() : '—');
const ok = (status: number | null) => status !== null && status >= 200 && status < 300;

function copy(text: string, what: string) {
  void navigator.clipboard.writeText(text).then(() => toast.success(`${what} copied to clipboard`));
}

export function DevelopersPage() {
  const [keyPage, setKeyPage] = useState(1);
  const [keySearch, setKeySearch] = useState('');
  const debouncedKeySearch = useDebouncedValue(keySearch.trim());
  const keys = useApiKeys({ page: keyPage, pageSize: 10, search: debouncedKeySearch });
  const hooks = useWebhooks({ page: 1, pageSize: 20 });

  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const createHook = useCreateWebhook();
  const updateHook = useUpdateWebhook();
  const deleteHook = useDeleteWebhook();
  const rotateSecret = useRotateWebhookSecret();
  const testHook = useTestWebhook();

  const [keyDialog, setKeyDialog] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState<string[]>([]);
  const [hookDialog, setHookDialog] = useState(false);
  const [hookUrl, setHookUrl] = useState('');
  const [hookEvents, setHookEvents] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<{ title: string; value: string } | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [deleting, setDeleting] = useState<Webhook | null>(null);
  const [rotating, setRotating] = useState<Webhook | null>(null);
  const [logFor, setLogFor] = useState<Webhook | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  if (keys.isLoading || hooks.isLoading) return <PageSkeleton variant="dashboard" />;
  if (keys.isError || hooks.isError || !keys.data || !hooks.data) {
    const err = keys.error ?? hooks.error;
    return (
      <EmptyState
        title="Failed to load developer settings"
        description={errorMessage(err)}
        actionLabel="Retry"
        onAction={() => {
          void keys.refetch();
          void hooks.refetch();
        }}
      />
    );
  }

  const scopes = hooks.data.scopes;
  const events = hooks.data.events;
  const webhooks = hooks.data.items;
  const healthy = webhooks.filter((w) => ok(w.lastStatus)).length;
  const failing = webhooks.filter((w) => w.lastDeliveryAt && !ok(w.lastStatus)).length;

  const submitKey = () => {
    if (!keyName.trim() || keyScopes.length === 0) {
      toast.error('Give the key a name and at least one scope');
      return;
    }
    createKey.mutate(
      { name: keyName.trim(), scopes: keyScopes },
      {
        onSuccess: (res) => {
          setKeyDialog(false);
          setKeyName('');
          setKeyScopes([]);
          setRevealed({ title: `API key “${res.item.name}”`, value: res.key });
        },
      },
    );
  };

  const submitHook = () => {
    if (!/^https?:\/\//i.test(hookUrl.trim()) || hookEvents.length === 0) {
      toast.error('Enter an http(s) URL and pick at least one event');
      return;
    }
    createHook.mutate(
      { url: hookUrl.trim(), events: hookEvents, active: true },
      {
        onSuccess: (res) => {
          setHookDialog(false);
          setHookUrl('');
          setHookEvents([]);
          setRevealed({ title: 'Webhook signing secret', value: res.secret });
        },
      },
    );
  };

  const toggle = (list: string[], value: string, on: boolean) => (on ? [...new Set([...list, value])] : list.filter((v) => v !== value));

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Developer API & Webhooks"
        subtitle="Integration keys and outbound webhook endpoints for your ISP account."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Developers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void keys.refetch();
                void hooks.refetch();
              }}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', (keys.isFetching || hooks.isFetching) && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setKeyDialog(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              New API Key
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          Integrations call the read-only endpoints below with the key in the <code className="font-mono">X-Api-Key</code> header — never in
          the URL. Results are limited to your account and never include passwords. Keys are shown once and kept only as a hash; “last used”
          updates when an integration authenticates. Webhook events are queued and retried with exponential backoff; use{' '}
          <strong>Send test</strong> to verify an endpoint — every attempt is recorded in its delivery log.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="API Keys" value={keys.data.meta.total} hint="Created, incl. revoked" icon={<Key className="h-4 w-4" />} tone="purple" />
        <Kpi label="Webhooks" value={hooks.data.meta.total} hint="Configured endpoints" icon={<WebhookIcon className="h-4 w-4" />} tone="blue" />
        <Kpi label="Healthy" value={healthy} hint="Last delivery answered 2xx" icon={<CheckCircle2 className="h-4 w-4" />} tone="emerald" />
        <Kpi label="Failing" value={failing} hint="Last delivery failed" icon={<AlertCircle className="h-4 w-4" />} tone="amber" />
      </div>

      {/* API keys */}
      <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> API Access Keys
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Read-only keys for CRM, RADIUS or reporting integrations — send as <code className="font-mono">X-Api-Key: ipb_…</code>
              </CardDescription>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
                value={keySearch}
                onChange={(e) => {
                  setKeySearch(e.target.value);
                  setKeyPage(1);
                }}
                className="pl-8 h-8 text-xs bg-background/80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-border/60 bg-muted/20 px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Endpoints (GET)</p>
            <ul className="mt-1.5 space-y-1">
              {INTEGRATION_ENDPOINTS.map((e) => (
                <li key={e.path} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <code className="font-mono text-foreground">{e.path}</code>
                  <span className="text-muted-foreground">{e.note}</span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {e.scope}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
          {keys.data.items.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">{keySearch ? 'No keys match your search.' : 'No API keys yet.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 border-b border-border/60">
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Key</TableHead>
                    <TableHead className="text-xs font-semibold">Scopes</TableHead>
                    <TableHead className="text-xs font-semibold">Created</TableHead>
                    <TableHead className="text-xs font-semibold">Last used</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {keys.data.items.map((k) => (
                    <TableRow key={k.id} className="hover:bg-muted/30">
                      <TableCell className="py-3 text-xs font-semibold text-foreground">{k.name}</TableCell>
                      <TableCell className="py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-muted-foreground">{k.keyPrefix}…</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 font-mono text-xs text-muted-foreground">{fmt(k.createdAt)}</TableCell>
                      <TableCell className="py-3 font-mono text-xs text-muted-foreground">{k.lastUsedAt ? fmt(k.lastUsedAt) : 'Never'}</TableCell>
                      <TableCell className="py-3 text-right">
                        {k.status === 'active' ? (
                          <Button size="sm" variant="ghost" onClick={() => setRevoking(k)} className="text-xs h-7 text-destructive hover:bg-destructive/10">
                            Revoke
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Revoked {fmt(k.revokedAt)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {keys.data.meta.total > 10 && (
            <div className="p-3 border-t border-border/50">
              <TablePagination currentPage={keyPage} pageSize={10} totalItems={keys.data.meta.total} onPageChange={setKeyPage} onPageSizeChange={() => undefined} pageSizeOptions={[10]} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <WebhookIcon className="h-4 w-4 text-primary" /> Webhook Endpoints
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Signed JSON POSTs: verify <code className="font-mono">X-ISP-Signature: sha256=&lt;hex&gt;</code> — HMAC-SHA256 of the raw body
                with the endpoint secret. <code className="font-mono">X-ISP-Timestamp</code>, <code className="font-mono">X-ISP-Event</code> and{' '}
                <code className="font-mono">X-ISP-Delivery</code> (unique id, use it to drop duplicates) come with every delivery.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setHookDialog(true)} className="text-xs h-8 gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {webhooks.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">No webhook endpoints yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 border-b border-border/60">
                    <TableHead className="text-xs font-semibold">Endpoint URL</TableHead>
                    <TableHead className="text-xs font-semibold">Events</TableHead>
                    <TableHead className="text-xs font-semibold">Active</TableHead>
                    <TableHead className="text-xs font-semibold">Last delivery</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {webhooks.map((w) => (
                    <TableRow key={w.id} className="hover:bg-muted/30">
                      <TableCell className="py-3">
                        <span className="font-mono text-xs text-foreground break-all">{w.url}</span>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">secret {w.secretHint}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {w.events.map((e) => (
                            <Badge key={e} variant="outline" className="text-[10px] bg-muted/50 border-border/60 text-muted-foreground">
                              {e}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Switch
                          checked={w.active}
                          onCheckedChange={(v) =>
                            updateHook.mutate({ id: w.id, active: v === true }, { onSuccess: () => toast.success(v ? 'Endpoint enabled' : 'Endpoint paused') })
                          }
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        {w.lastDeliveryAt ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-mono',
                              ok(w.lastStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                            )}
                          >
                            {w.lastStatus ?? 'no response'} · {fmt(w.lastDeliveryAt)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1"
                            disabled={testingId === w.id}
                            onClick={() => {
                              setTestingId(w.id);
                              testHook.mutate(w.id, {
                                onSuccess: (res) =>
                                  res.success
                                    ? toast.success(`Delivered — HTTP ${res.statusCode} in ${res.durationMs} ms`)
                                    : toast.error(`Delivery failed: ${res.error ?? `HTTP ${res.statusCode}`}`),
                                onSettled: () => setTestingId(null),
                              });
                            }}
                          >
                            <Send className="h-3 w-3" /> {testingId === w.id ? 'Sending…' : 'Send test'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7" title="Delivery log" onClick={() => setLogFor(w)}>
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7" title="Rotate secret" onClick={() => setRotating(w)}>
                            <RotateCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" title="Delete" onClick={() => setDeleting(w)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New key */}
      <Dialog open={keyDialog} onOpenChange={setKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>The key is shown once — store it in your integration right away.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} maxLength={100} className="text-xs" />
            </div>
            <ChecklistField label="Scopes" options={scopes} values={keyScopes} onToggle={(v, on) => setKeyScopes((s) => toggle(s, v, on))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitKey} disabled={createKey.isPending}>
              {createKey.isPending ? 'Creating…' : 'Create key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New webhook */}
      <Dialog open={hookDialog} onOpenChange={setHookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add webhook endpoint</DialogTitle>
            <DialogDescription>We sign every delivery with a secret shown once after saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Endpoint URL</Label>
              <Input value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} placeholder="https://…" className="text-xs font-mono" />
            </div>
            <ChecklistField label="Events" options={events} values={hookEvents} onToggle={(v, on) => setHookEvents((s) => toggle(s, v, on))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitHook} disabled={createHook.isPending}>
              {createHook.isPending ? 'Saving…' : 'Add endpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time secret reveal */}
      <Dialog open={Boolean(revealed)} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{revealed?.title}</DialogTitle>
            <DialogDescription>Copy it now — it will not be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-xs">{revealed?.value}</code>
            <Button size="icon" variant="outline" onClick={() => revealed && copy(revealed.value, 'Secret')} aria-label="Copy">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeliveryLogDialog webhook={logFor} onClose={() => setLogFor(null)} />

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke API key?"
        description={revoking ? `“${revoking.name}” stops working for any integration using it.` : undefined}
        confirmLabel="Revoke"
        destructive
        onConfirm={() => {
          const target = revoking;
          setRevoking(null);
          if (target) revokeKey.mutate(target.id, { onSuccess: () => toast.success(`Revoked ${target.name}`) });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete webhook?"
        description={deleting ? `${deleting.url} and its delivery log will be removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (target) deleteHook.mutate(target.id, { onSuccess: () => toast.success('Webhook deleted') });
        }}
      />
      <ConfirmDialog
        open={Boolean(rotating)}
        onOpenChange={(open) => !open && setRotating(null)}
        title="Rotate signing secret?"
        description="The old secret stops validating immediately — update your receiver with the new one."
        confirmLabel="Rotate"
        onConfirm={() => {
          const target = rotating;
          setRotating(null);
          if (target) rotateSecret.mutate(target.id, { onSuccess: (res) => setRevealed({ title: 'New signing secret', value: res.secret }) });
        }}
      />
    </div>
  );
}

function Kpi({ label, value, hint, icon, tone }: { label: string; value: number; hint: string; icon: React.ReactNode; tone: 'purple' | 'blue' | 'emerald' | 'amber' }) {
  const tones = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg border', tones[tone])}>{icon}</div>
        </div>
        <div className="mt-2 text-2xl font-black font-mono text-foreground">{value}</div>
        <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function ChecklistField({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: Option[];
  values: string[];
  onToggle: (value: string, on: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-border/60 p-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={values.includes(opt.value)} onCheckedChange={(v) => onToggle(opt.value, v === true)} />
            <span className="font-mono text-[11px] text-muted-foreground">{opt.value}</span>
            <span className="text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DeliveryLogDialog({ webhook, onClose }: { webhook: Webhook | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useWebhookDeliveries(webhook?.id ?? null, page);
  return (
    <Dialog
      open={Boolean(webhook)}
      onOpenChange={(open) => {
        if (!open) {
          setPage(1);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery log</DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">{webhook?.url}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <PageSkeleton variant="table" rows={3} />
        ) : isError || !data ? (
          <EmptyState title="Could not load deliveries" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />
        ) : data.items.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No deliveries yet — events appear here once queued, or send a test.</p>
        ) : (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">When</TableHead>
                  <TableHead className="text-xs">Event</TableHead>
                  <TableHead className="text-xs">Result</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.items as DeliveryRow[]).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{fmt(d.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{d.event}</TableCell>
                    <TableCell className="text-xs">
                      {d.status === 'pending' && !d.attempts ? (
                        <span className="text-amber-500">Queued</span>
                      ) : (
                        <span className={d.success ? 'text-emerald-500' : d.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}>
                          {d.statusCode ? `HTTP ${d.statusCode}` : 'No response'}
                        </span>
                      )}
                      {d.status === 'pending' && d.attempts ? (
                        <div className="text-[10px] text-muted-foreground">
                          Retrying — attempt {d.attempts} failed{d.nextAttemptAt ? `, next try ${fmt(d.nextAttemptAt)}` : ''}
                        </div>
                      ) : null}
                      {d.error && <div className="text-[10px] text-muted-foreground">{d.error}</div>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{d.durationMs ?? '—'} ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.meta.total > 10 && (
              <TablePagination currentPage={page} pageSize={10} totalItems={data.meta.total} onPageChange={setPage} onPageSizeChange={() => undefined} pageSizeOptions={[10]} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
