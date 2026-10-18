'use client';

import { Fragment, useState, type ReactNode } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Key,
  Webhook as WebhookIcon,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
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
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
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

import { formatDateTime } from '@/lib/format';
/** Queue fields the deliveries endpoint returns next to the base delivery row. */
type DeliveryRow = WebhookDelivery & { status?: string; attempts?: number; nextAttemptAt?: string | null };

/** Read-only endpoints an API key unlocks (X-Api-Key header). */
const INTEGRATION_ENDPOINTS: { path: string; note: string | [string, string]; scope: string }[] = [
  { path: '/api/v1/integrations/customers', note: '?page, per_page, search, status=active|inactive|expired', scope: 'customers:read' },
  { path: '/api/v1/integrations/customers/{id}', note: ['admin.ops.developers.endpointOne', 'one customer'], scope: 'customers:read' },
  { path: '/api/v1/integrations/payments', note: '?page, per_page, from, to (Y-m-d), status=successful|pending|failed', scope: 'payments:read' },
  { path: '/api/v1/integrations/packages', note: '?page, per_page, search, status', scope: 'packages:read' },
];

const fmt = (iso: string | null) => (iso ? formatDateTime(iso.replace(' ', 'T')) : '—');
const ok = (status: number | null) => status !== null && status >= 200 && status < 300;

type Translate = ReturnType<typeof useTranslations>;

function copy(t: Translate, text: string, what: string) {
  void navigator.clipboard.writeText(text).then(() => toast.success(t('admin.ops.developers.copied', '{what} copied to clipboard', { what })));
}

/** Fills `{name}` tokens of a translated sentence with elements (for text that wraps `<code>` or `<strong>`). */
function rich(text: string, parts: Record<string, ReactNode>): ReactNode[] {
  return text.split(/(\{\w+\})/).map((piece, i) => {
    const name = /^\{(\w+)\}$/.exec(piece)?.[1];
    return name && name in parts ? <Fragment key={i}>{parts[name]}</Fragment> : piece;
  });
}

export function DevelopersPage() {
  const t = useTranslations();
  const [keyPage, setKeyPage] = useState(1);
  const [keySearch, setKeySearch] = useState('');
  const keys = useApiKeys({ page: keyPage, pageSize: 10, search: keySearch });
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
      <EmptyState variant="error"
        title={t('admin.ops.developers.loadFailed', 'Failed to load developer settings')}
        description={errorMessage(err)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
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

  const keyColumns: LegacyColumnDef<ApiKey, unknown>[] = [
    {
      id: 'name',
      header: t('admin.ops.developers.colName', 'Name'),
      enableSorting: false,
      meta: { mobile: 'title' },
      cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.name}</span>,
    },
    {
      id: 'key',
      header: t('admin.ops.developers.colKey', 'Key'),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-muted-foreground">{row.original.keyPrefix}…</span>
      ),
    },
    {
      id: 'scopes',
      header: t('admin.ops.developers.colScopes', 'Scopes'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.scopes.map((s) => (
            <Badge key={s} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'created',
      header: t('admin.ops.developers.colCreated', 'Created'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmt(row.original.createdAt)}</span>,
    },
    {
      id: 'lastUsed',
      header: t('admin.ops.developers.colLastUsed', 'Last used'),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.lastUsedAt ? fmt(row.original.lastUsedAt) : t('admin.ops.developers.never', 'Never')}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('admin.ops.developers.colAction', 'Action')}</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row: { original: k } }) => (
        <div className="flex justify-end">
          {k.status === 'active' ? (
            <Button size="sm" variant="ghost" onClick={() => setRevoking(k)} className="text-xs h-7 text-destructive hover:bg-destructive/10">
              {t('admin.ops.developers.revoke', 'Revoke')}
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {t('admin.ops.developers.revokedOn', 'Revoked {when}', { when: fmt(k.revokedAt) })}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const webhookActive = (w: Webhook) => (
    <Switch
      checked={w.active}
      aria-label={t('admin.ops.developers.webhookActiveLabel', 'Webhook {url} active', { url: w.url })}
      onCheckedChange={(v) =>
        updateHook.mutate({ id: w.id, active: v === true }, { onSuccess: () => toast.success(v ? t('admin.ops.developers.endpointEnabled', 'Endpoint enabled') : t('admin.ops.developers.endpointPaused', 'Endpoint paused')) })
      }
    />
  );

  const webhookLastDelivery = (w: Webhook) =>
    w.lastDeliveryAt ? (
      <Badge variant="outline" tone={ok(w.lastStatus) ? 'success' : 'danger'} className="h-auto whitespace-normal text-xs font-mono">
        {w.lastStatus ?? t('admin.ops.developers.noResponseLower', 'no response')} · {fmt(w.lastDeliveryAt)}
      </Badge>
    ) : (
      <span className="text-xs text-muted-foreground">{t('admin.ops.developers.never', 'Never')}</span>
    );

  const webhookActions = (w: Webhook) => (
    <div className="flex flex-wrap justify-end gap-1">
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
                ? toast.success(t('admin.ops.developers.delivered', 'Delivered — HTTP {code} in {ms} ms', { code: res.statusCode ?? '', ms: res.durationMs ?? '' }))
                : toast.error(t('admin.ops.developers.deliveryFailed', 'Delivery failed: {reason}', { reason: res.error ?? `HTTP ${res.statusCode}` })),
            onSettled: () => setTestingId(null),
          });
        }}
      >
        <Send className="h-3 w-3" /> {testingId === w.id ? t('admin.ops.developers.sending', 'Sending…') : t('admin.ops.developers.sendTest', 'Send test')}
      </Button>
      <Button size="sm" variant="ghost" className="text-xs h-7" title={t('admin.ops.developers.deliveryLog', 'Delivery log')} aria-label={t('admin.ops.developers.deliveryLog', 'Delivery log')} onClick={() => setLogFor(w)}>
        <History className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="text-xs h-7" title={t('admin.ops.developers.rotateSecret', 'Rotate secret')} aria-label={t('admin.ops.developers.rotateSecret', 'Rotate secret')} onClick={() => setRotating(w)}>
        <RotateCw className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" title={t('common.delete', 'Delete')} aria-label={t('admin.ops.developers.deleteWebhook', 'Delete webhook')} onClick={() => setDeleting(w)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const submitKey = () => {
    if (!keyName.trim() || keyScopes.length === 0) {
      toast.error(t('admin.ops.developers.keyInvalid', 'Give the key a name and at least one scope'));
      return;
    }
    createKey.mutate(
      { name: keyName.trim(), scopes: keyScopes },
      {
        onSuccess: (res) => {
          setKeyDialog(false);
          setKeyName('');
          setKeyScopes([]);
          setRevealed({ title: t('admin.ops.developers.apiKeyTitle', 'API key “{name}”', { name: res.item.name }), value: res.key });
        },
      },
    );
  };

  const submitHook = () => {
    if (!/^https?:\/\//i.test(hookUrl.trim()) || hookEvents.length === 0) {
      toast.error(t('admin.ops.developers.hookInvalid', 'Enter an http(s) URL and pick at least one event'));
      return;
    }
    createHook.mutate(
      { url: hookUrl.trim(), events: hookEvents, active: true },
      {
        onSuccess: (res) => {
          setHookDialog(false);
          setHookUrl('');
          setHookEvents([]);
          setRevealed({ title: t('admin.ops.developers.hookSecretTitle', 'Webhook signing secret'), value: res.secret });
        },
      },
    );
  };

  const toggle = (list: string[], value: string, on: boolean) => (on ? [...new Set([...list, value])] : list.filter((v) => v !== value));

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.ops.developers.title', 'Developer API & Webhooks')}
        subtitle={t('admin.ops.developers.subtitle', 'Integration keys and outbound webhook endpoints for your ISP account.')}
        breadcrumb={[{ label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' }, { label: t('common.crumb.developers', 'Developers') }]}
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
              {t('admin.ops.ipLogs.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={() => setKeyDialog(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              {t('admin.ops.developers.newKey', 'New API Key')}
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {rich(
            t(
              'admin.ops.developers.info',
              'Integrations call the read-only endpoints below with the key in the {header} header — never in the URL. Results are limited to your account and never include passwords. Keys are shown once and kept only as a hash; “last used” updates when an integration authenticates. Webhook events are queued and retried with exponential backoff; use {test} to verify an endpoint — every attempt is recorded in its delivery log.',
            ),
            {
              header: <code className="font-mono">X-Api-Key</code>,
              test: <strong>{t('admin.ops.developers.sendTest', 'Send test')}</strong>,
            },
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t('admin.ops.developers.kpiKeys', 'API Keys')} value={keys.data.meta.total} hint={t('admin.ops.developers.kpiKeysHint', 'Created, incl. revoked')} icon={<Key className="h-4 w-4" />} tone="purple" />
        <Kpi label={t('admin.ops.developers.kpiHooks', 'Webhooks')} value={hooks.data.meta.total} hint={t('admin.ops.developers.kpiHooksHint', 'Configured endpoints')} icon={<WebhookIcon className="h-4 w-4" />} tone="blue" />
        <Kpi label={t('admin.ops.developers.kpiHealthy', 'Healthy')} value={healthy} hint={t('admin.ops.developers.kpiHealthyHint', 'Last delivery answered 2xx')} icon={<CheckCircle2 className="h-4 w-4" />} tone="emerald" />
        <Kpi label={t('admin.ops.developers.kpiFailing', 'Failing')} value={failing} hint={t('admin.ops.developers.kpiFailingHint', 'Last delivery failed')} icon={<AlertCircle className="h-4 w-4" />} tone="amber" />
      </div>

      {/* API keys */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Key className="h-4 w-4 text-primary" /> {t('admin.ops.developers.keysTitle', 'API Access Keys')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {rich(t('admin.ops.developers.keysDesc', 'Read-only keys for CRM, RADIUS or reporting integrations — send as {header}'), {
              header: <code className="font-mono">X-Api-Key: ipb_…</code>,
            })}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('admin.ops.developers.endpointsGet', 'Endpoints (GET)')}</p>
          <ul className="mt-1.5 space-y-1">
            {INTEGRATION_ENDPOINTS.map((e) => (
              <li key={e.path} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <code className="font-mono text-foreground break-all">{e.path}</code>
                <span className="text-muted-foreground">{Array.isArray(e.note) ? t(e.note[0], e.note[1]) : e.note}</span>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {e.scope}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <DataTable
          urlState
          className={cn(keys.isFetching && 'opacity-80')}
          columns={keyColumns}
          data={keys.data.items}
          getRowId={(k) => k.id}
          enableColumnVisibility={false}
          enableLayoutToggle={false}
          pageSizeOptions={[10]}
          searchPlaceholder={t('admin.ops.developers.searchKeys', 'Search keys...')}
          emptyTitle={keySearch ? t('admin.ops.developers.emptyKeysFiltered', 'No keys match your search.') : t('admin.ops.developers.emptyKeys', 'No API keys yet.')}
          server={{
            page: keyPage,
            pageSize: 10,
            total: keys.data.meta.total,
            onPageChange: setKeyPage,
            onPageSizeChange: () => undefined,
            search: keySearch,
            onSearchChange: (value) => {
              setKeySearch(value);
              setKeyPage(1);
            },
          }}
        />
      </section>

      {/* Webhooks */}
      <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <WebhookIcon className="h-4 w-4 text-primary" /> {t('admin.ops.developers.hooksTitle', 'Webhook Endpoints')}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {rich(
                  t(
                    'admin.ops.developers.hooksDesc',
                    'Signed JSON POSTs: verify {signature} — HMAC-SHA256 of the raw body with the endpoint secret. {timestamp}, {event} and {delivery} (unique id, use it to drop duplicates) come with every delivery.',
                  ),
                  {
                    signature: <code className="font-mono">X-ISP-Signature: sha256=&lt;hex&gt;</code>,
                    timestamp: <code className="font-mono">X-ISP-Timestamp</code>,
                    event: <code className="font-mono">X-ISP-Event</code>,
                    delivery: <code className="font-mono">X-ISP-Delivery</code>,
                  },
                )}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setHookDialog(true)} className="text-xs h-8 gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" /> {t('admin.ops.developers.addWebhook', 'Add Webhook')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {webhooks.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">{t('admin.ops.developers.emptyHooks', 'No webhook endpoints yet.')}</p>
          ) : (
            <>
              <ul className="divide-y divide-border/40 md:hidden">
                {webhooks.map((w) => (
                  <li key={w.id} className="space-y-3 p-4">
                    <div className="min-w-0">
                      <span className="font-mono text-xs text-foreground break-all">{w.url}</span>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">{t('admin.ops.developers.secretHint', 'secret {hint}', { hint: w.secretHint })}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {w.events.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs bg-muted/50 border-border/60 text-muted-foreground">
                          {e}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                        {webhookActive(w)} {t('status.active', 'Active')}
                      </label>
                      {webhookLastDelivery(w)}
                    </div>
                    {webhookActions(w)}
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      <th className="h-10 px-3.5">{t('admin.ops.developers.colEndpoint', 'Endpoint URL')}</th>
                      <th className="h-10 px-3.5">{t('admin.ops.developers.colEvents', 'Events')}</th>
                      <th className="h-10 px-3.5">{t('status.active', 'Active')}</th>
                      <th className="h-10 px-3.5">{t('admin.ops.developers.colLastDelivery', 'Last delivery')}</th>
                      <th className="h-10 px-3.5 text-right">{t('admin.customers.list.colActions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {webhooks.map((w) => (
                      <tr key={w.id} className="hover:bg-muted/30">
                        <td className="py-3 px-3.5">
                          <span className="font-mono text-xs text-foreground break-all">{w.url}</span>
                          <div className="text-xs font-mono text-muted-foreground mt-0.5">{t('admin.ops.developers.secretHint', 'secret {hint}', { hint: w.secretHint })}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex flex-wrap gap-1">
                            {w.events.map((e) => (
                              <Badge key={e} variant="outline" className="text-xs bg-muted/50 border-border/60 text-muted-foreground">
                                {e}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">{webhookActive(w)}</td>
                        <td className="py-3 px-3.5">{webhookLastDelivery(w)}</td>
                        <td className="py-3 px-3.5">{webhookActions(w)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New key */}
      <Dialog open={keyDialog} onOpenChange={setKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.ops.developers.newKeyTitle', 'New API key')}</DialogTitle>
            <DialogDescription>{t('admin.ops.developers.newKeyDesc', 'The key is shown once — store it in your integration right away.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">{t('admin.ops.developers.colName', 'Name')}</Label>
              <Input id="name" value={keyName} onChange={(e) => setKeyName(e.target.value)} maxLength={100} className="text-xs" />
            </div>
            <ChecklistField label={t('admin.ops.developers.colScopes', 'Scopes')} options={scopes} values={keyScopes} onToggle={(v, on) => setKeyScopes((s) => toggle(s, v, on))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={submitKey} disabled={createKey.isPending}>
              {createKey.isPending ? t('admin.ops.developers.creating', 'Creating…') : t('admin.ops.developers.createKey', 'Create key')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New webhook */}
      <Dialog open={hookDialog} onOpenChange={setHookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.ops.developers.addHookTitle', 'Add webhook endpoint')}</DialogTitle>
            <DialogDescription>{t('admin.ops.developers.addHookDesc', 'We sign every delivery with a secret shown once after saving.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="endpoint-url" className="text-xs">{t('admin.ops.developers.colEndpoint', 'Endpoint URL')}</Label>
              <Input id="endpoint-url" value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} placeholder="https://…" className="text-xs font-mono" />
            </div>
            <ChecklistField label={t('admin.ops.developers.colEvents', 'Events')} options={events} values={hookEvents} onToggle={(v, on) => setHookEvents((s) => toggle(s, v, on))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHookDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={submitHook} disabled={createHook.isPending}>
              {createHook.isPending ? t('admin.ops.developers.saving', 'Saving…') : t('admin.ops.developers.addEndpoint', 'Add endpoint')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time secret reveal */}
      <Dialog open={Boolean(revealed)} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{revealed?.title}</DialogTitle>
            <DialogDescription>{t('admin.ops.developers.copyNow', 'Copy it now — it will not be shown again.')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-xs">{revealed?.value}</code>
            <Button size="icon" variant="outline" onClick={() => revealed && copy(t, revealed.value, t('admin.ops.developers.secret', 'Secret'))} aria-label={t('admin.ops.developers.copy', 'Copy')}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>{t('admin.ops.developers.done', 'Done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeliveryLogDialog webhook={logFor} onClose={() => setLogFor(null)} />

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
        title={t('admin.ops.developers.revokeTitle', 'Revoke API key?')}
        description={revoking ? t('admin.ops.developers.revokeDesc', '“{name}” stops working for any integration using it.', { name: revoking.name }) : undefined}
        confirmLabel={t('admin.ops.developers.revoke', 'Revoke')}
        destructive
        onConfirm={() => {
          const target = revoking;
          setRevoking(null);
          if (target) revokeKey.mutate(target.id, { onSuccess: () => toast.success(t('admin.ops.developers.revoked', 'Revoked {name}', { name: target.name })) });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('admin.ops.developers.deleteTitle', 'Delete webhook?')}
        description={deleting ? t('admin.ops.developers.deleteDesc', '{url} and its delivery log will be removed.', { url: deleting.url }) : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (target) deleteHook.mutate(target.id, { onSuccess: () => toast.success(t('admin.ops.developers.hookDeleted', 'Webhook deleted')) });
        }}
      />
      <ConfirmDialog
        open={Boolean(rotating)}
        onOpenChange={(open) => !open && setRotating(null)}
        title={t('admin.ops.developers.rotateTitle', 'Rotate signing secret?')}
        description={t('admin.ops.developers.rotateDesc', 'The old secret stops validating immediately — update your receiver with the new one.')}
        confirmLabel={t('admin.ops.developers.rotate', 'Rotate')}
        onConfirm={() => {
          const target = rotating;
          setRotating(null);
          if (target) rotateSecret.mutate(target.id, { onSuccess: (res) => setRevealed({ title: t('admin.ops.developers.newSecretTitle', 'New signing secret'), value: res.secret }) });
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
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
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
            <span className="font-mono text-xs text-muted-foreground">{opt.value}</span>
            <span className="text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DeliveryLogDialog({ webhook, onClose }: { webhook: Webhook | null; onClose: () => void }) {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useWebhookDeliveries(webhook?.id ?? null, page);
  const deliveryColumns: LegacyColumnDef<DeliveryRow, unknown>[] = [
    {
      id: 'when',
      header: t('admin.ops.developers.colWhen', 'When'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs">{fmt(row.original.createdAt)}</span>,
    },
    {
      id: 'event',
      header: t('admin.ops.developers.colEvent', 'Event'),
      enableSorting: false,
      meta: { mobile: 'title' },
      cell: ({ row }) => <span className="font-mono text-xs break-all">{row.original.event}</span>,
    },
    {
      id: 'result',
      header: t('admin.ops.developers.colResult', 'Result'),
      enableSorting: false,
      cell: ({ row: { original: d } }) => (
        <div className="text-xs">
          {d.status === 'pending' && !d.attempts ? (
            <span className="text-amber-500">{t('status.queued', 'Queued')}</span>
          ) : (
            <span className={d.success ? 'text-emerald-500' : d.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}>
              {d.statusCode ? `HTTP ${d.statusCode}` : t('admin.ops.developers.noResponse', 'No response')}
            </span>
          )}
          {d.status === 'pending' && d.attempts ? (
            <div className="text-xs text-muted-foreground">
              {d.nextAttemptAt
                ? t('admin.ops.developers.retryingNext', 'Retrying — attempt {n} failed, next try {when}', { n: d.attempts ?? 0, when: fmt(d.nextAttemptAt) })
                : t('admin.ops.developers.retrying', 'Retrying — attempt {n} failed', { n: d.attempts ?? 0 })}
            </div>
          ) : null}
          {d.error && <div className="text-xs text-muted-foreground">{d.error}</div>}
        </div>
      ),
    },
    {
      id: 'time',
      header: t('admin.ops.developers.colTime', 'Time'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.durationMs ?? '—'} ms</span>,
    },
  ];
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
          <DialogTitle>{t('admin.ops.developers.deliveryLog', 'Delivery log')}</DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">{webhook?.url}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <PageSkeleton variant="table" rows={3} />
        ) : isError || !data ? (
          <EmptyState variant="error" title={t('admin.ops.developers.deliveriesFailed', 'Could not load deliveries')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
        ) : data.items.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">{t('admin.ops.developers.noDeliveries', 'No deliveries yet — events appear here once queued, or send a test.')}</p>
        ) : (
          <DataTable
            columns={deliveryColumns}
            data={data.items as DeliveryRow[]}
            getRowId={(d) => d.id}
            enableColumnVisibility={false}
            enableLayoutToggle={false}
            pageSizeOptions={[10]}
            server={{ page, pageSize: 10, total: data.meta.total, onPageChange: setPage, onPageSizeChange: () => undefined }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
