'use client';

import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, Copy, Check, ExternalLink, Edit2, Trash2, CheckCircle2, Ban, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { platformService } from '@/lib/api/services/platform.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PlatformPageHeader } from '@/features/platform/shared';
import { DataTable } from '@/features/shared/data-table';
import { formatBdt, formatCount } from '@/lib/format';
import { toast } from 'sonner';
import type { PlatformTenant } from '@/features/platform/types';
import { useTranslations } from '@/i18n/locale-context';

export function TenantsListPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['platform', 'tenants', 'list', { page, pageSize, search, status }],
    queryFn: () => platformService.getTenants({ page, perPage: pageSize, search, status }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformService.deleteTenant(id),
    onSuccess: () => {
      toast.success(t('platform.tenants.list.toast.deleted', 'Tenant portal deleted. The owner account was kept.'));
      setDeletingId(null);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
    },
    onSettled: () => setDeletingId(null),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'active' | 'suspended' }) =>
      platformService.setTenantStatus(id, next),
    onSuccess: (_, vars) => {
      toast.success(
        vars.next === 'active'
          ? t('platform.tenants.list.toast.activated', 'Portal activated')
          : t('platform.tenants.list.toast.suspended', 'Portal suspended'),
      );
      void queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
  });

  const statusFilters = [
    { value: '', label: t('admin.support.filter.allStatuses', 'All statuses') },
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'suspended', label: t('status.suspended', 'Suspended') },
  ];

  const copyUrl = useCallback(
    (tenant: PlatformTenant) => {
      void navigator.clipboard.writeText(tenant.portalUrl).then(() => {
        setCopiedSlug(tenant.slug);
        toast.success(t('platform.tenants.list.toast.urlCopied', 'Portal URL copied to clipboard'));
        setTimeout(() => setCopiedSlug(null), 2000);
      });
    },
    [t],
  );

  const columns = useMemo<LegacyColumnDef<PlatformTenant, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('platform.tenants.list.colCompany', 'ISP Company & Branding'),
        size: 240,
        enableHiding: false,
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-md flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-xs"
                style={tenant.primaryColor ? { backgroundColor: tenant.primaryColor } : undefined}
              >
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link href={`/platform/tenants/${tenant.id}`} className="font-semibold text-foreground hover:underline">
                  {tenant.name}
                </Link>
                <div className="text-xs text-muted-foreground">{t('platform.tenants.list.idLabel', 'ID: {id}', { id: tenant.id })}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'slug',
        header: t('platform.tenants.list.colPortalUrl', 'Portal URL'),
        size: 220,
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center gap-2 font-mono text-xs">
              <a
                href={tenant.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {tenant.domain}
                <ExternalLink className="h-3 w-3 inline" />
              </a>
              <button
                type="button"
                onClick={() => copyUrl(tenant)}
                className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                title={t('platform.tenants.list.copyUrl', 'Copy Portal URL')}
                aria-label={t('platform.tenants.list.copyUrl', 'Copy Portal URL')}
              >
                {copiedSlug === tenant.slug ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          );
        },
      },
      {
        id: 'owner',
        accessorFn: (row) => row.ownerName ?? '',
        header: t('platform.tenants.list.colOwner', 'Owner Contact'),
        size: 180,
        cell: ({ row }) => {
          const tenant = row.original;
          return tenant.ownerName ? (
            <div>
              <div className="text-xs font-medium text-foreground">{tenant.ownerName}</div>
              <div className="text-xs text-muted-foreground">{tenant.ownerEmail}</div>
              <div className="text-xs text-muted-foreground font-mono">{tenant.ownerPhone}</div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{t('platform.tenants.list.noOwner', 'No owner linked')}</span>
          );
        },
      },
      {
        accessorKey: 'plan',
        header: t('platform.tenants.list.colPlan', 'Plan & Subs'),
        size: 150,
        cell: ({ row }) => (
          <div>
            <Badge variant="outline" className="font-semibold text-xs mb-0.5">
              {row.original.plan ?? t('platform.tenants.list.noPlan', 'No plan')}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {t('platform.tenants.list.subscribers', '{n} subscribers', { n: formatCount(row.original.customers) })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('platform.tenants.list.paidThisMonth', '৳{amount} paid this month', { amount: formatBdt(row.original.monthRevenue) })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            tone={row.original.status === 'active' ? 'success' : 'danger'}
          >
            {t(`status.${row.original.status}`, row.original.status)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 220,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" render={<Link href={`/platform/tenants/${tenant.id}`} />}>
                  {t('platform.tenants.list.details', 'Details')}
                </Button>
              <Button variant="ghost" size="sm" title={t('platform.tenants.list.healthScore', 'Health score')} aria-label={t('platform.tenants.list.healthScore', 'Health score')} className="h-8 w-8 p-0" render={<Link href={`/platform/tenants/${tenant.id}/health`} />}>
                  <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                </Button>
              <Button variant="ghost" size="sm" title={t('platform.tenants.list.editTenant', 'Edit Tenant')} aria-label={t('platform.tenants.list.editTenant', 'Edit Tenant')} className="h-8 w-8 p-0" render={<Link href={`/platform/tenants/${tenant.id}/edit`} />}>
                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: tenant.id, next: tenant.status === 'active' ? 'suspended' : 'active' })}
                title={tenant.status === 'active' ? t('platform.tenants.list.suspendPortal', 'Suspend Portal') : t('platform.tenants.list.activatePortal', 'Activate Portal')}
                aria-label={tenant.status === 'active' ? t('platform.tenants.list.suspendPortal', 'Suspend Portal') : t('platform.tenants.list.activatePortal', 'Activate Portal')}
              >
                {tenant.status === 'active' ? (
                  <Ban className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeletingId(tenant.id)}
                title={t('platform.tenants.list.deleteTenant', 'Delete Tenant')}
                aria-label={t('platform.tenants.list.deleteTenant', 'Delete Tenant')}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [copiedSlug, copyUrl, statusMutation, t],
  );

  if (isLoading) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.tenants.list.loadFailed', 'Failed to load tenants')}
        description={error instanceof Error ? error.message : t('platform.tenants.list.loadFailedHint', 'Could not retrieve tenant portals from the server.')}
        actionLabel={t('platform.tenants.list.tryAgain', 'Try Again')}
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.tenants.list.title', 'Tenant Portals')}
        subtitle={t('platform.tenants.list.subtitle', 'Subdomain portals for each ISP — one platform application, isolated tenant data')}
        breadcrumb={[{ label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' }]}
        actions={
          <Button className="bg-primary hover:bg-primary/90" render={<Link href="/platform/tenants/new" />}>
              <Plus className="mr-1.5 h-4 w-4" /> {t('platform.tenants.list.create', 'Create Portal')}
            </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{summary.total}</span>{' '}
          <span className="text-muted-foreground">{t('platform.tenants.list.totalPortals', 'total portals')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{summary.active}</span>{' '}
          <span className="text-muted-foreground">{t('platform.tenants.list.activePortals', 'active portals')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{summary.suspended}</span>{' '}
          <span className="text-muted-foreground">{t('platform.tenants.list.suspendedPortals', 'suspended portals')}</span>
        </p>
      </div>

      <DataTable urlState
        columns={columns}
        data={data.items}
        getRowId={(row) => row.id}
        searchPlaceholder={t('platform.tenants.list.searchPlaceholder', 'Search name, subdomain, owner email or phone...')}
        server={{
          page,
          pageSize,
          total: data.total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange: (q) => {
            setSearch(q);
            setPage(1);
          },
        }}
        emptyTitle={
          search || status
            ? t('platform.tenants.list.emptyFiltered', 'No portals match your filters')
            : t('platform.tenants.list.emptyNone', 'No tenant portals yet')
        }
        emptyDescription={t('platform.tenants.list.emptyHint', 'Create a subdomain portal for an ISP. No Nginx or DNS change is required per tenant.')}
        toolbarActions={
          <div className="flex items-center gap-2">
            <select
              aria-label={t('platform.tenants.list.filterStatus', 'Filter by status')}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {isFetching ? <span className="text-xs text-muted-foreground">{t('platform.tenants.list.updating', 'Updating…')}</span> : null}
          </div>
        }
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={t('platform.tenants.list.deleteTitle', 'Delete Tenant Portal')}
        description={t('platform.tenants.list.deleteDesc', 'The subdomain portal is removed and its users are unlinked from it. The owner account, subscribers and billing data are kept.')}
        confirmLabel={deleteMutation.isPending ? t('platform.tenants.list.deleting', 'Deleting…') : t('platform.tenants.list.deleteConfirm', 'Yes, Delete Portal')}
        destructive
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
