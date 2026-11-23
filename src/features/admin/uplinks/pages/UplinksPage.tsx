'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Activity, Cable, Plus, RefreshCw, ShieldOff } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { DataTable } from '@/features/shared/data-table';
import { useRequirePermission } from '@/features/shared/permission';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import {
  useCheckAllUplinks,
  useCheckUplink,
  useDeleteUplink,
  useTestUplinkAlert,
  useToggleUplink,
  useUplinks,
} from '../hooks/useUplinks';
import { buildUplinkColumns } from '../components/uplink-columns';
import { UplinkFormDialog } from '../components/UplinkFormDialog';
import { UplinkLogsSheet } from '../components/UplinkLogsSheet';
import { UplinkStatsStrip } from '../components/UplinkStatsStrip';
import type { UplinkRow } from '../types';

export function UplinksPage() {
  const t = useTranslations();
  const nav = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const routerId = params.get('router_id') ?? '';
  const { allowed, user } = useRequirePermission('routers', 'read');

  const list = useUplinks(routerId || undefined);
  const check = useCheckUplink();
  const checkAll = useCheckAllUplinks();
  const testAlert = useTestUplinkAlert();
  const toggle = useToggleUplink();
  const remove = useDeleteUplink();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UplinkRow | null>(null);
  const [logsFor, setLogsFor] = useState<UplinkRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UplinkRow | null>(null);

  const columns = useMemo(
    () =>
      buildUplinkColumns(t, {
        checkingId: check.isPending ? (check.variables ?? null) : null,
        alertingId: testAlert.isPending ? (testAlert.variables ?? null) : null,
        togglingId: toggle.isPending ? (toggle.variables ?? null) : null,
        onCheck: (u) =>
          check.mutate(u.id, {
            onSuccess: (r) => {
              const msg = t('admin.uplinks.toast.checked', '{name} is {status}', {
                name: u.name,
                status: r.status.toUpperCase() || '—',
              });
              const detail = [r.response, r.reason].filter(Boolean).join(' · ');
              if (r.status === 'down') toast.error(msg, { description: detail });
              else toast.success(msg, { description: detail });
            },
          }),
        onTestAlert: (u) =>
          testAlert.mutate(u.id, {
            onSuccess: () =>
              toast.success(
                t(
                  'admin.uplinks.toast.alertSent',
                  'Test alert dispatched. Check your WhatsApp and/or SMS.',
                ),
              ),
          }),
        onToggle: (u) =>
          toggle.mutate(u.id, {
            onSuccess: () =>
              toast.success(
                u.isEnabled
                  ? t('admin.uplinks.toast.paused', 'Monitoring paused')
                  : t('admin.uplinks.toast.resumed', 'Monitoring enabled'),
              ),
          }),
        onLogs: setLogsFor,
        onEdit: (u) => {
          setEditing(u);
          setFormOpen(true);
        },
        onDelete: setDeleteTarget,
      }),
    [t, check, testAlert, toggle],
  );

  const setRouterFilter = (id: string) =>
    nav.replace(id ? `${pathname}?router_id=${id}` : pathname);
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const denied = (user && !allowed) || list.error?.status === 403;
  if (denied) {
    return (
      <EmptyState
        icon={<ShieldOff className="h-5 w-5" />}
        title={t('admin.uplinks.denied', 'You do not have access to uplink monitoring')}
        description={t(
          'admin.uplinks.deniedDesc',
          'Ask your ISP admin for the Routers permission.',
        )}
      />
    );
  }
  if (list.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (list.isError || !list.data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.uplinks.loadFailed', 'Failed to load uplinks')}
        description={list.error?.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => list.refetch()}
      />
    );
  }

  const createButton = (
    <Can menu="routers" action="create">
      <Button size="sm" onClick={openCreate}>
        <Plus className="mr-1.5 h-4 w-4" />
        {t('admin.uplinks.add', 'Add uplink')}
      </Button>
    </Can>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.uplinks.title', 'Uplink Monitoring & Alerts')}
        subtitle={t(
          'admin.uplinks.subtitle',
          'Watch upstream interfaces, BGP peers, gateways and Netwatch targets on your MikroTik routers; get WhatsApp/SMS alerts when one drops.',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.routers', 'Routers'), href: '/admin/routers' },
          { label: t('admin.uplinks.crumb', 'Uplinks') },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => list.refetch()}
              disabled={list.isFetching}
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', list.isFetching && 'animate-spin')} />
              {t('admin.dashboard.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={checkAll.isPending || list.data.items.length === 0}
              onClick={() =>
                checkAll.mutate(undefined, {
                  onSuccess: (s) =>
                    toast.success(
                      t(
                        'admin.uplinks.toast.checkedAll',
                        'Checked {total} uplinks: {up} up, {down} down.',
                        { total: s.total, up: s.up, down: s.down },
                      ),
                    ),
                })
              }
            >
              <Activity className={cn('mr-1.5 h-4 w-4', checkAll.isPending && 'animate-pulse')} />
              {checkAll.isPending
                ? t('admin.uplinks.checking', 'Checking...')
                : t('admin.uplinks.checkAll', 'Check all')}
            </Button>
            {createButton}
          </>
        }
      />

      <UplinkStatsStrip stats={list.data.stats} />

      {list.data.items.length === 0 && !routerId ? (
        <EmptyState
          icon={<Cable className="h-5 w-5" />}
          title={t('admin.uplinks.empty', 'No uplinks monitored yet')}
          description={t(
            'admin.uplinks.emptyDesc',
            'Add your upstream links (BDIX, cache, IIG) to get an alert the moment one goes down.',
          )}
          actionLabel={t('admin.uplinks.add', 'Add uplink')}
          onAction={openCreate}
        />
      ) : (
        <DataTable
          columns={columns}
          data={list.data.items}
          getRowId={(row) => row.id}
          searchKey="name"
          searchFilterFn={(row, _col, value) => {
            const q = String(value ?? '')
              .trim()
              .toLowerCase();
            const u = row.original;
            return (
              !q ||
              [u.name, u.target, u.routerName, u.routerHost].some((f) =>
                f.toLowerCase().includes(q),
              )
            );
          }}
          searchPlaceholder={t('admin.uplinks.search', 'Search uplink, router or target...')}
          emptyTitle={t('admin.uplinks.noMatch', 'No uplinks for this filter')}
          emptyDescription={t(
            'admin.uplinks.noMatchDesc',
            'Pick another router or clear the search.',
          )}
          toolbarActions={
            <select
              aria-label={t('admin.uplinks.filterRouter', 'Filter by router')}
              className="border-input h-8 max-w-[200px] rounded-md border bg-transparent px-2 text-sm"
              value={routerId}
              onChange={(e) => setRouterFilter(e.target.value)}
            >
              <option value="">{t('admin.uplinks.allRouters', 'All routers')}</option>
              {list.data.routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          }
        />
      )}

      <UplinkFormDialog
        key={editing?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        uplink={editing}
        routers={list.data.routers}
        defaultRouterId={routerId || undefined}
        defaultMobile={list.data.adminMobile}
        defaultWhatsapp={list.data.adminWhatsapp}
      />
      <UplinkLogsSheet uplink={logsFor} onClose={() => setLogsFor(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.uplinks.deleteTitle', 'Stop monitoring this uplink?')}
        description={
          deleteTarget
            ? t('admin.uplinks.deleteDesc', '{name} and its incident log will be deleted.', {
                name: deleteTarget.name,
              })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () =>
              toast.success(
                t('admin.uplinks.toast.deleted', '{name} deleted', { name: target.name }),
              ),
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
