'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { Network, CheckCircle2, AlertTriangle, RotateCw, Filter, Server, Download, Link2, PauseCircle, WifiOff } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useRouterOptions } from '@/features/admin/routers/hooks/useRouters';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import {
  useAreaOptions,
  useCorporateQueues,
  useImportCorporate,
  usePackageOptions,
  type CorporateQueue,
  type QueueFilter,
} from '../hooks/useCorporateQueues';

const FILTERS: QueueFilter[] = ['all', 'linked', 'unlinked', 'disabled'];
const selectClass =
  'h-9 w-full rounded-lg border border-border/70 bg-background/80 px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary';

export function CorporateQueuesPage() {
  const t = useTranslations();
  const routers = useRouterOptions({ ownedOnly: true });
  const [routerId, setRouterId] = useState('');
  const [status, setStatus] = useState<QueueFilter>('all');
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [importRows, setImportRows] = useState<CorporateQueue[] | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [packageId, setPackageId] = useState('');
  const [areaId, setAreaId] = useState('');

  // One router at a time: every unreachable router costs a connect timeout.
  const activeRouterId = routerId || routers.data?.[0]?.id || '';
  const activeRouter = routers.data?.find((r) => r.id === activeRouterId);
  const queues = useCorporateQueues(activeRouterId, { page, pageSize, search, status });
  const importer = useImportCorporate();
  const dialogOpen = importRows !== null;
  const packages = usePackageOptions(dialogOpen);
  const areas = useAreaOptions(dialogOpen);

  const pageItems = useMemo(() => queues.data?.items ?? [], [queues.data]);
  const unlinkedOnPage = pageItems.filter((q) => !q.linked && q.ipAddress);
  const summary = queues.data?.summary;
  const offline = queues.isError && queues.error?.status === 503;

  const openImport = (rows: CorporateQueue[]) => {
    setImportRows(rows);
    setCustomerName(rows.length === 1 ? rows[0].name : '');
  };

  const submitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importRows || !packageId || !areaId) {
      toast.error(t('admin.corporate.queues.toast.pickPackageArea', 'Pick a package and an area for the new customers'));
      return;
    }
    importer.mutate(
      {
        routerId: activeRouterId,
        packageId,
        areaId,
        queues: importRows.map((q) => ({ queueId: q.queueId, customerName: importRows.length === 1 ? customerName : undefined })),
      },
      {
        onSuccess: (res) => {
          const failed = res?.failed?.length ?? 0;
          if (failed > 0) {
            toast.warning(
              t('admin.corporate.queues.toast.importedPartial', '{imported} imported, {failed} could not be imported', {
                imported: formatCount(res.imported),
                failed: formatCount(failed),
              }),
            );
          } else {
            toast.success(
              t('admin.corporate.queues.toast.imported', '{n} corporate customer(s) imported', { n: formatCount(res?.imported ?? 0) }),
            );
          }
          setImportRows(null);
        },
      },
    );
  };

  const filterLabel = useCallback(
    (f: QueueFilter) => t(`admin.corporate.queues.filter.${f}`, f),
    [t],
  );

  const columns = useMemo<LegacyColumnDef<CorporateQueue, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.corporate.queues.colQueue', 'Queue'),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-primary shrink-0" />
              {row.original.name || row.original.queueId}
            </div>
            {row.original.comment ? (
              <div className="text-xs text-muted-foreground font-mono pl-5">{row.original.comment}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'target',
        header: t('admin.corporate.queues.colTarget', 'Target'),
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted/60 border border-border/60 text-foreground">
            {row.original.target || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'maxLimit',
        header: t('admin.corporate.queues.colMaxLimit', 'Max Limit (up/down)'),
        cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.maxLimit || '—'}</span>,
      },
      {
        accessorKey: 'customerName',
        header: t('admin.corporate.queues.colCustomer', 'Billing Customer'),
        cell: ({ row }) =>
          row.original.linked ? (
            <Link href={`/admin/customers/${row.original.userId}`} className="text-sm font-medium text-primary hover:underline">
              {row.original.customerName || `#${row.original.userId}`}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">{t('admin.corporate.queues.notLinked', 'Not linked')}</span>
          ),
      },
      {
        id: 'state',
        header: t('admin.corporate.queues.colState', 'State'),
        cell: ({ row }) => {
          const q = row.original;
          const tone = q.disabled
            ? 'border-slate-500/30 bg-slate-500/10 text-slate-400'
            : q.linked
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400';
          return (
            <Badge variant="outline" className={`capitalize font-medium text-xs px-2.5 py-0.5 ${tone}`}>
              {q.disabled ? <PauseCircle className="mr-1 h-3 w-3 inline" /> : q.linked ? <CheckCircle2 className="mr-1 h-3 w-3 inline" /> : <AlertTriangle className="mr-1 h-3 w-3 inline" />}
              {filterLabel(q.disabled ? 'disabled' : q.linked ? 'linked' : 'unlinked')}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: t('common.actions', 'Action'),
        cell: ({ row }) =>
          !row.original.linked && row.original.ipAddress ? (
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openImport([row.original])}>
                <Download className="mr-1.5 h-3 w-3" />
                {t('admin.corporate.queues.import', 'Import')}
              </Button>
            </div>
          ) : null,
      },
    ],
    [t, filterLabel],
  );

  if (routers.isLoading) return <PageSkeleton variant="table" />;
  if (routers.isError) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.corporate.queues.routersFailed', 'Failed to load routers')}
        description={routers.error?.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => routers.refetch()}
      />
    );
  }
  if ((routers.data ?? []).length === 0) {
    return (
      <EmptyState
        icon={<Server className="h-5 w-5" />}
        title={t('admin.corporate.queues.noRouters', 'No active routers')}
        description={t('admin.corporate.queues.noRoutersHint', 'Corporate queues are read live from your MikroTik routers. Add a router first.')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.corporate.queues.title', 'Corporate Queues & Bandwidth Sync')}
        subtitle={t('admin.corporate.queues.subtitle', 'MikroTik simple queues for dedicated corporate links, matched to billing customers')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('admin.corporate.queues.crumbCorporate', 'Corporate') },
          { label: t('admin.corporate.queues.crumbQueues', 'Bandwidth Queues') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queues.refetch()}
              disabled={queues.isFetching}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
            >
              <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${queues.isFetching ? 'animate-spin' : ''}`} />
              {t('admin.corporate.queues.refresh', 'Refresh')}
            </Button>
            <Button
              size="sm"
              disabled={unlinkedOnPage.length === 0}
              onClick={() => openImport(unlinkedOnPage)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.corporate.queues.importUnlinked', 'Import unlinked ({n})', { n: formatCount(unlinkedOnPage.length) })}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.corporate.queues.kpiTotal', 'Corporate Queues'), value: summary?.total, hint: activeRouter?.name ?? '', icon: Network, tone: 'text-foreground', chip: 'bg-primary/10 text-primary border-primary/20' },
          { label: t('admin.corporate.queues.kpiLinked', 'Linked to Customers'), value: summary?.linked, hint: t('admin.corporate.queues.kpiLinkedHint', 'Billed in the system'), icon: CheckCircle2, tone: 'text-emerald-400', chip: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
          { label: t('admin.corporate.queues.kpiUnlinked', 'Unlinked'), value: summary?.unlinked, hint: t('admin.corporate.queues.kpiUnlinkedHint', 'Import to start billing'), icon: AlertTriangle, tone: 'text-amber-400', chip: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: t('admin.corporate.queues.kpiDisabled', 'Disabled on Router'), value: summary?.disabled, hint: t('admin.corporate.queues.kpiDisabledHint', 'Queue disabled in RouterOS'), icon: PauseCircle, tone: 'text-slate-400', chip: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={`p-2 rounded-lg border ${card.chip}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className={`mt-3 text-2xl font-bold tracking-tight ${card.tone}`}>{card.value === undefined ? '—' : formatCount(card.value)}</div>
            <p className="mt-1 text-xs text-muted-foreground truncate">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" /> {t('admin.corporate.queues.statusLabel', 'Status:')}
            </span>
            {FILTERS.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={status === st ? 'default' : 'outline'}
                onClick={() => {
                  setStatus(st);
                  table.resetPage();
                }}
                className={`h-7 text-xs capitalize ${status === st ? 'bg-primary text-primary-foreground font-medium' : 'border-border/60 hover:bg-muted/50'}`}
              >
                {filterLabel(st)}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{t('admin.corporate.queues.routerLabel', 'Router:')}</span>
            <select
              aria-label={t('admin.corporate.queues.routerSelect', 'Router')}
              value={activeRouterId}
              onChange={(e) => {
                setRouterId(e.target.value);
                table.resetPage();
              }}
              className="h-8 rounded-lg border border-border/70 bg-background/80 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(routers.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {queues.isLoading ? (
          <PageSkeleton variant="table" />
        ) : queues.isError ? (
          <EmptyState
            icon={offline ? <WifiOff className="h-5 w-5" /> : undefined}
            title={offline ? t('admin.corporate.queues.routerOffline', 'Router offline') : t('admin.corporate.queues.loadFailed', 'Failed to load corporate queues')}
            description={queues.error?.message}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => queues.refetch()}
          />
        ) : (
          <DataTable urlState
            columns={columns}
            data={pageItems}
            getRowId={(row) => row.queueId}
            searchPlaceholder={t('admin.corporate.queues.searchPlaceholder', 'Search by queue, target IP, or customer...')}
            emptyTitle={
              search || status !== 'all'
                ? t('admin.corporate.queues.emptyFiltered', 'No queue matches')
                : t('admin.corporate.queues.emptyNone', 'No corporate queues on this router')
            }
            emptyDescription={t('admin.corporate.queues.emptyHint', 'Only simple queues that target a single public IP (or carry an isp-core customer comment) are listed.')}
            server={table.server(queues.data?.meta.total ?? 0)}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setImportRows(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {importRows && importRows.length > 1
                ? t('admin.corporate.queues.dialogTitleMany', 'Import corporate customers')
                : t('admin.corporate.queues.dialogTitleOne', 'Import corporate customer')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'admin.corporate.queues.dialogDesc',
                '{n} queue(s) on {router} become static corporate customers; each queue is tagged with its new customer id.',
                {
                  n: formatCount(importRows?.length ?? 0),
                  router: activeRouter?.name ?? t('admin.corporate.queues.thisRouter', 'this router'),
                },
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitImport} className="space-y-4 py-2">
            {importRows?.length === 1 ? (
              <div className="space-y-1.5">
                <Label htmlFor="corpName">{t('admin.corporate.queues.fieldName', 'Customer name')}</Label>
                <Input id="corpName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="corpPackage">{t('admin.corporate.queues.fieldPackage', 'Package *')}</Label>
              <select id="corpPackage" className={selectClass} value={packageId} onChange={(e) => setPackageId(e.target.value)} disabled={packages.isLoading}>
                <option value="">{packages.isLoading
                  ? t('admin.corporate.queues.packagesLoading', 'Loading packages…')
                  : packages.isError
                    ? t('admin.corporate.queues.packagesFailed', 'Could not load packages')
                    : t('admin.corporate.queues.packagePlaceholder', 'Select a package')}</option>
                {(packages.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="corpArea">{t('admin.corporate.queues.fieldArea', 'Area *')}</Label>
              <select id="corpArea" className={selectClass} value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={areas.isLoading}>
                <option value="">{areas.isLoading
                  ? t('admin.corporate.queues.areasLoading', 'Loading areas…')
                  : areas.isError
                    ? t('admin.corporate.queues.areasFailed', 'Could not load areas')
                    : t('admin.corporate.queues.areaPlaceholder', 'Select an area')}</option>
                {(areas.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setImportRows(null)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={importer.isPending || !packageId || !areaId}>
                {importer.isPending ? t('admin.corporate.queues.importing', 'Importing…') : t('admin.corporate.queues.import', 'Import')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
