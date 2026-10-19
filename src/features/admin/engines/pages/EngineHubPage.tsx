'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { DataTable } from '@/features/shared/data-table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth-store';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  useDeployEngine,
  useEngineAction,
  useEngineEntry,
  useEngineInstances,
  useTenantAdminOptions,
} from '../hooks/use-engines';
import { engineDate, enginePriceLabel, instanceStatusLabel } from '../lib/engine-format';
import type { EngineCatalogItem, EngineInstance, EnginePortal } from '../types';

type Props = {
  /** Catalog slug of the engine (route segment) */
  groupId: string;
  portal?: EnginePortal;
};

const CONFIG_MAX_BYTES = 16 * 1024;

function statusVariant(status: EngineInstance['status'] | undefined): 'default' | 'destructive' | 'outline' {
  if (status === 'enabled') return 'default';
  if (status === 'disabled') return 'destructive';
  return 'outline';
}

export function EngineHubPage({ groupId, portal = 'admin' }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { data: entry, isLoading, isError, error, refetch } = useEngineEntry(groupId);

  const enginesIndex = portal === 'platform' ? '/platform/engines' : '/admin/engines';
  const dashboard = portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard';

  if (isLoading) return <PageSkeleton variant="detail" />;

  if (isError || !entry) {
    const notFound = error?.status === 404;
    return (
      <div className="space-y-5">
        <PageHeader
          title={t('admin.engines.hub.engine', 'Engine')}
          breadcrumb={[
            { label: t('common.crumb.dashboard', 'Dashboard'), url: dashboard },
            { label: t('common.crumb.engines', 'Engines'), url: enginesIndex },
            { label: groupId },
          ]}
        />
        {notFound ? (
          <EmptyState
            title={t('admin.engines.hub.notAvailable', 'This engine is not available')}
            description={error?.message && error.message !== 'This engine is not available' ? error.message : undefined}
            actionLabel={t('admin.engines.hub.backToEngines', 'Back to engines')}
            onAction={() => router.push(enginesIndex)}
          />
        ) : (
          <EmptyState variant="error"
            title={t('admin.engines.hub.loadFailed', 'Failed to load engine')}
            description={error?.message}
            actionLabel={t('admin.customers.list.retry', 'Retry')}
            onAction={() => refetch()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={entry.name}
        subtitle={entry.category}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: dashboard },
          { label: t('common.crumb.engines', 'Engines'), url: enginesIndex },
          { label: entry.name },
        ]}
        actions={
          <Link
            href={enginesIndex}
            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {t('admin.engines.hub.allEngines', 'All engines')}
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <span>{entry.category}</span>
        <span className="text-border">·</span>
        <span className="tabular-nums text-foreground">{enginePriceLabel(t, entry)}</span>
        {entry.priceType ? (
          <>
            <span className="text-border">·</span>
            <span className="capitalize">{t(`admin.engines.priceType.${entry.priceType.toLowerCase().replace(/[^a-z]+/g, '_')}`, entry.priceType)}</span>
          </>
        ) : null}
        <span className="text-border">·</span>
        {portal === 'platform' ? (
          <>
            <Badge variant={entry.published ? 'default' : 'outline'}>
              {entry.published ? t('admin.engines.index.statusPublished', 'Published') : t('admin.engines.index.statusUnpublished', 'Unpublished')}
            </Badge>
            {entry.instancesSummary ? (
              <>
                <span className="text-border">·</span>
                <span>
                  <span className="font-semibold tabular-nums text-foreground">{formatCount(entry.instancesSummary.enabled)}</span>{' '}
                  {t('admin.engines.index.enabled', 'enabled')}
                </span>
                <span className="text-border">·</span>
                <span>
                  <span className="font-semibold tabular-nums text-foreground">{formatCount(entry.instancesSummary.disabled)}</span>{' '}
                  {t('admin.engines.hub.disabledCount', 'disabled')}
                </span>
              </>
            ) : null}
          </>
        ) : (
          <Badge variant={statusVariant(entry.instance?.status)}>{instanceStatusLabel(t, entry.instance)}</Badge>
        )}
      </div>

      <div className="ui-panel-enter flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-4 sm:flex-row sm:p-5">
        {entry.imageUrl ? (
          // Remote catalog image (arbitrary host) — next/image would need a remotePatterns entry.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.imageUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg border border-border/50 object-cover"
            onError={(e) => {
              e.currentTarget.hidden = true;
            }}
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{t('admin.engines.hub.about', 'About this engine')}</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {entry.description || t('admin.engines.hub.noDescription', 'No description provided.')}
          </p>
        </div>
      </div>

      {portal === 'platform' ? <PlatformInstancesPanel entry={entry} /> : <TenantInstancePanel entry={entry} />}
    </div>
  );
}

/* ---------------------------------------------------------------- admin portal */

function TenantInstancePanel({ entry }: { entry: EngineCatalogItem }) {
  const t = useTranslations();
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === 'admin';
  const instance = entry.instance;
  const deploy = useDeployEngine(entry.slug);
  const action = useEngineAction(entry.slug);
  const busy = deploy.isPending || action.isPending;

  const enable = () => {
    const done = () => toast.success(t('admin.engines.hub.enabledToast', '{name} enabled', { name: entry.name }));
    if (!instance) deploy.mutate({ pluginId: entry.id }, { onSuccess: done });
    else action.mutate({ id: instance.id, action: 'enable' }, { onSuccess: done });
  };

  const disable = () => {
    if (!instance) return;
    action.mutate(
      { id: instance.id, action: 'disable' },
      { onSuccess: () => toast.success(t('admin.engines.hub.disabledToast', '{name} disabled', { name: entry.name })) },
    );
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{t('admin.engines.hub.yourIsp', 'Your ISP')}</h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">{t('common.status', 'Status')}</dt>
            <dd>
              <Badge variant={statusVariant(instance?.status)}>{instanceStatusLabel(t, instance)}</Badge>
            </dd>
            {instance ? (
              <>
                <dt className="text-muted-foreground">{t('admin.engines.hub.enabledAt', 'Enabled at')}</dt>
                <dd className="tabular-nums">{engineDate(instance.enabledAt)}</dd>
                {instance.status === 'disabled' ? (
                  <>
                    <dt className="text-muted-foreground">{t('admin.engines.hub.disabledAt', 'Disabled at')}</dt>
                    <dd className="tabular-nums">{engineDate(instance.disabledAt)}</dd>
                  </>
                ) : null}
                <dt className="text-muted-foreground">{t('admin.engines.hub.lastUpdated', 'Last updated')}</dt>
                <dd className="tabular-nums">{engineDate(instance.updatedAt)}</dd>
              </>
            ) : null}
          </dl>
        </div>

        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {instance?.status === 'enabled' ? (
              <Button size="sm" variant="destructive" className="ui-press" disabled={busy} onClick={disable}>
                {action.isPending && action.variables?.action === 'disable' ? t('admin.engines.hub.disabling', 'Disabling…') : t('admin.engines.hub.disable', 'Disable')}
              </Button>
            ) : (
              <Button size="sm" className="ui-press" disabled={busy} onClick={enable}>
                {deploy.isPending || (action.isPending && action.variables?.action === 'enable')
                  ? t('admin.engines.hub.enabling', 'Enabling…')
                  : t('admin.engines.hub.enable', 'Enable')}
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {!canWrite ? (
        <p className="text-xs text-muted-foreground">
          {t('admin.engines.hub.adminOnly', 'Only the ISP admin account can enable, disable or configure engines.')}
        </p>
      ) : null}

      {instance ? (
        canWrite ? (
          <ConfigEditor
            key={`${instance.id}-${instance.updatedAt ?? ''}`}
            instance={instance}
            pending={action.isPending && action.variables?.action === 'configure'}
            disabled={busy}
            onSave={(config) =>
              action.mutate(
                { id: instance.id, action: 'configure', config },
                { onSuccess: () => toast.success(t('admin.engines.hub.configSaved', 'Configuration saved')) },
              )
            }
          />
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('admin.engines.hub.configuration', 'Configuration')}</p>
            <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-muted/10 p-3 font-mono text-xs">
              {JSON.stringify(instance.config, null, 2)}
            </pre>
          </div>
        )
      ) : canWrite ? (
        <p className="text-xs text-muted-foreground">{t('admin.engines.hub.enableToConfigure', 'Enable this engine to configure it.')}</p>
      ) : null}
    </div>
  );
}

function ConfigEditor({
  instance,
  pending,
  disabled,
  onSave,
}: {
  instance: EngineInstance;
  pending: boolean;
  disabled: boolean;
  onSave: (config: Record<string, unknown>) => void;
}) {
  const t = useTranslations();
  const [text, setText] = useState(() => JSON.stringify(instance.config, null, 2));
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text.trim() === '' ? '{}' : text);
    } catch {
      setError(t('admin.engines.hub.errJson', 'Configuration must be valid JSON.'));
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setError(t('admin.engines.hub.errObject', 'Configuration must be a JSON object, e.g. { "key": "value" }.'));
      return;
    }
    if (new Blob([JSON.stringify(parsed)]).size > CONFIG_MAX_BYTES) {
      setError(t('admin.engines.hub.errSize', 'Configuration must be 16 KB or smaller.'));
      return;
    }
    setError(null);
    onSave(parsed as Record<string, unknown>);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="engine-config" className="text-sm font-medium">
        {t('admin.engines.hub.configure', 'Configure')}
      </label>
      <Textarea
        id="engine-config"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        spellCheck={false}
        rows={8}
        aria-invalid={error ? true : undefined}
        className="font-mono text-xs"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button size="sm" className="ui-press" disabled={disabled} onClick={save}>
        {pending ? t('admin.engines.hub.saving', 'Saving…') : t('admin.engines.hub.saveConfig', 'Save configuration')}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------- platform portal */

function PlatformInstancesPanel({ entry }: { entry: EngineCatalogItem }) {
  const t = useTranslations();
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === 'super_admin';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const action = useEngineAction(entry.slug);

  const { data, isLoading, isError, refetch } = useEngineInstances({
    engineKey: entry.slug,
    search,
    page,
    perPage: pageSize,
  });

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns: LegacyColumnDef<EngineInstance, unknown>[] = [
    {
      accessorKey: 'tenantName',
      header: t('admin.engines.hub.colTenant', 'Tenant'),
      enableHiding: false,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.tenantName || '—'}</div>
          <div className="font-mono text-xs text-muted-foreground">#{row.original.tenantId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status', 'Status'),
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)} className="capitalize">
          {instanceStatusLabel(t, row.original)}
        </Badge>
      ),
    },
    {
      accessorKey: 'enabledAt',
      header: t('admin.engines.hub.enabledAt', 'Enabled at'),
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">{engineDate(row.original.enabledAt)}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: t('admin.engines.hub.colUpdated', 'Updated'),
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">{engineDate(row.original.updatedAt)}</span>
      ),
    },
  ];

  if (canWrite) {
    columns.push({
      id: 'actions',
      header: '',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const inst = row.original;
        const next = inst.status === 'enabled' ? 'disable' : 'enable';
        const rowPending = action.isPending && action.variables?.id === inst.id;
        return (
          <Button
            size="sm"
            variant={next === 'disable' ? 'destructive' : 'outline'}
            disabled={action.isPending}
            onClick={() =>
              action.mutate(
                { id: inst.id, action: next },
                {
                  onSuccess: () => {
                    const vars = {
                      name: entry.name,
                      tenant: inst.tenantName || t('admin.engines.hub.tenantNum', 'tenant #{id}', { id: inst.tenantId }),
                    };
                    toast.success(
                      next === 'enable'
                        ? t('admin.engines.hub.enabledFor', '{name} enabled for {tenant}', vars)
                        : t('admin.engines.hub.disabledFor', '{name} disabled for {tenant}', vars),
                    );
                  },
                },
              )
            }
          >
            {rowPending ? t('admin.engines.hub.saving', 'Saving…') : next === 'enable' ? t('admin.engines.hub.enable', 'Enable') : t('admin.engines.hub.disable', 'Disable')}
          </Button>
        );
      },
    });
  }

  return (
    <div className="space-y-4">
      {canWrite ? <EnableForTenant entry={entry} /> : null}

      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">{t('admin.engines.hub.tenantInstalls', 'Tenant installs')}</h2>
        {isError ? (
          <EmptyState variant="error" title={t('admin.engines.hub.installsFailed', 'Failed to load installs')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
        ) : (
          <DataTable urlState
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            emptyTitle={search ? t('admin.engines.hub.emptyFiltered', 'No tenants match') : t('admin.engines.hub.emptyNone', 'No tenant has enabled this engine yet')}
            searchPlaceholder={t('admin.engines.hub.searchTenants', 'Search tenants…')}
            enableColumnVisibility={false}
            enableLayoutToggle={false}
            server={{
              page,
              pageSize,
              total: data?.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
              search,
              onSearchChange,
            }}
          />
        )}
      </div>
    </div>
  );
}

function EnableForTenant({ entry }: { entry: EngineCatalogItem }) {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const deploy = useDeployEngine(entry.slug);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isLoading, isError, isFetching, refetch } = useTenantAdminOptions(search);
  const options = data?.items ?? [];
  const selected = options.find((o) => o.id === tenantId);

  const submit = () => {
    if (!tenantId) return;
    deploy.mutate(
      { pluginId: entry.id, tenantId },
      {
        onSuccess: () => {
          toast.success(
            t('admin.engines.hub.enabledFor', '{name} enabled for {tenant}', {
              name: entry.name,
              tenant: selected?.organizationName || selected?.name || t('admin.engines.hub.tenantNum', 'tenant #{id}', { id: tenantId }),
            }),
          );
          setTenantId('');
        },
      },
    );
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{t('admin.engines.hub.enableForTenant', 'Enable for tenant')}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t('admin.engines.hub.pickAdmin', 'Pick an ISP admin account to deploy this engine to.')}</p>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('admin.engines.hub.searchAdmins', 'Search admins by name, email or phone…')}
          aria-label={t('admin.engines.hub.searchAdminsLabel', 'Search tenant admins')}
          className="h-8 text-xs md:max-w-xs"
        />
        <Select value={tenantId} onValueChange={(v) => setTenantId(v ?? '')}>
          <SelectTrigger aria-label={t('admin.engines.hub.colTenant', 'Tenant')} className="h-8 w-full text-xs md:w-72" disabled={isLoading || isError}>
            <SelectValue>
              {(v: string) =>
                v
                  ? (selected?.organizationName || selected?.name || `#${v}`)
                  : isLoading || isFetching
                    ? t('admin.engines.hub.loadingAdmins', 'Loading admins…')
                    : options.length === 0
                      ? t('admin.engines.hub.noAdmins', 'No admins found')
                      : t('admin.engines.hub.selectAdmin', 'Select tenant admin')
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                <span className="truncate">
                  {o.organizationName || o.name}
                  <span className="ml-1 text-muted-foreground">{o.email}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="ui-press" disabled={!tenantId || deploy.isPending} onClick={submit}>
          {deploy.isPending ? t('admin.engines.hub.enabling', 'Enabling…') : t('admin.engines.hub.enableForTenant', 'Enable for tenant')}
        </Button>
      </div>
      {isError ? (
        <p className="text-xs text-destructive">
          {t('admin.engines.hub.adminsFailed', 'Could not load tenant admins.')}{' '}
          <button type="button" className="underline" onClick={() => refetch()}>
            {t('admin.customers.list.retry', 'Retry')}
          </button>
        </p>
      ) : data && data.total > options.length ? (
        <p className="text-xs text-muted-foreground">
          {t('admin.engines.hub.showing', 'Showing {shown} of {total} — refine the search to find more.', { shown: formatCount(options.length), total: formatCount(data.total) })}
        </p>
      ) : null}
    </div>
  );
}
