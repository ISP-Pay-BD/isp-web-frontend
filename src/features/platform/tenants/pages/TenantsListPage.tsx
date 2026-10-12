'use client';

import { useMemo, useState } from 'react';
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
import { formatBdt } from '@/lib/format';
import { toast } from 'sonner';
import type { PlatformTenant } from '@/features/platform/types';

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
] as const;

export function TenantsListPage() {
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
      toast.success('Tenant portal deleted. The owner account was kept.');
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
      toast.success(vars.next === 'active' ? 'Portal activated' : 'Portal suspended');
      void queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
  });

  const copyUrl = (t: PlatformTenant) => {
    void navigator.clipboard.writeText(t.portalUrl).then(() => {
      setCopiedSlug(t.slug);
      toast.success('Portal URL copied to clipboard');
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const columns = useMemo<LegacyColumnDef<PlatformTenant, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ISP Company & Branding',
        size: 240,
        enableHiding: false,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-md flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-xs"
                style={t.primaryColor ? { backgroundColor: t.primaryColor } : undefined}
              >
                {t.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link href={`/platform/tenants/${t.id}`} className="font-semibold text-foreground hover:underline">
                  {t.name}
                </Link>
                <div className="text-xs text-muted-foreground">ID: {t.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'slug',
        header: 'Portal URL',
        size: 220,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-2 font-mono text-xs">
              <a
                href={t.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {t.domain}
                <ExternalLink className="h-3 w-3 inline" />
              </a>
              <button
                type="button"
                onClick={() => copyUrl(t)}
                className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                title="Copy Portal URL"
              >
                {copiedSlug === t.slug ? (
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
        header: 'Owner Contact',
        size: 180,
        cell: ({ row }) => {
          const t = row.original;
          return t.ownerName ? (
            <div>
              <div className="text-xs font-medium text-foreground">{t.ownerName}</div>
              <div className="text-xs text-muted-foreground">{t.ownerEmail}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{t.ownerPhone}</div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No owner linked</span>
          );
        },
      },
      {
        accessorKey: 'plan',
        header: 'Plan & Subs',
        size: 150,
        cell: ({ row }) => (
          <div>
            <Badge variant="outline" className="font-semibold text-xs mb-0.5">
              {row.original.plan ?? 'No plan'}
            </Badge>
            <div className="text-xs text-muted-foreground">{row.original.customers.toLocaleString()} subscribers</div>
            <div className="text-[11px] text-muted-foreground">৳{formatBdt(row.original.monthRevenue)} paid this month</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'active'
                ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs'
                : 'border-red-500/30 text-red-600 bg-red-500/10 text-xs'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 220,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link href={`/platform/tenants/${t.id}`}>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  Details
                </Button>
              </Link>
              <Link href={`/platform/tenants/${t.id}/health`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Health score">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                </Button>
              </Link>
              <Link href={`/platform/tenants/${t.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Tenant">
                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: t.id, next: t.status === 'active' ? 'suspended' : 'active' })}
                title={t.status === 'active' ? 'Suspend Portal' : 'Activate Portal'}
              >
                {t.status === 'active' ? (
                  <Ban className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeletingId(t.id)}
                title="Delete Tenant"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [copiedSlug, statusMutation],
  );

  if (isLoading) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load tenants"
        description={error instanceof Error ? error.message : 'Could not retrieve tenant portals from the server.'}
        actionLabel="Try Again"
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant Portals"
        subtitle="Subdomain portals for each ISP — one platform application, isolated tenant data"
        actions={
          <Link href="/platform/tenants/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" /> Create Portal
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{summary.total}</span>{' '}
          <span className="text-muted-foreground">total portals</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{summary.active}</span>{' '}
          <span className="text-muted-foreground">active portals</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{summary.suspended}</span>{' '}
          <span className="text-muted-foreground">suspended portals</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        getRowId={(row) => row.id}
        searchPlaceholder="Search name, subdomain, owner email or phone..."
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
        emptyTitle={search || status ? 'No portals match your filters' : 'No tenant portals yet'}
        emptyDescription="Create a subdomain portal for an ISP. No Nginx or DNS change is required per tenant."
        toolbarActions={
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {isFetching ? <span className="text-xs text-muted-foreground">Updating…</span> : null}
          </div>
        }
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Tenant Portal"
        description="The subdomain portal is removed and its users are unlinked from it. The owner account, subscribers and billing data are kept."
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete Portal'}
        destructive
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
