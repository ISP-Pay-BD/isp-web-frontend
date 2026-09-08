'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Globe,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Ban,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockFetch } from '@/lib/mock-api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PlatformPageHeader } from '@/features/platform/shared';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import type { TenantPortal } from '@/data/platform/tenants.data';

const tenantSearchFilter = (
  row: LegacyRow<TenantPortal>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const t = row.original;
  return (
    t.name.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q) ||
    t.ownerEmail.toLowerCase().includes(q) ||
    t.ownerName.toLowerCase().includes(q)
  );
};

export function TenantsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: () => mockFetch('platform.tenants.list'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockFetch('platform.tenants.delete', id),
    onSuccess: () => {
      toast.success('Tenant portal deleted successfully');
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete tenant portal');
      setDeletingId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      mockFetch('platform.tenants.update', id, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Tenant status updated to ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update tenant status');
    },
  });

  const copyUrl = (slug: string) => {
    const url = `https://${slug}.isppaybd.com`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Portal URL copied to clipboard');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const columns = useMemo<LegacyColumnDef<TenantPortal, unknown>[]>(
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
                className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: t.primaryColor || '#e85a1a' }}
              >
                {t.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link
                  href={`/platform/tenants/${t.id}`}
                  className="font-semibold text-foreground hover:underline"
                >
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
        size: 200,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-2 font-mono text-xs">
              <a
                href={`https://${t.slug}.isppaybd.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {t.slug}.isppaybd.com
                <ExternalLink className="h-3 w-3 inline" />
              </a>
              <button
                type="button"
                onClick={() => copyUrl(t.slug)}
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
        accessorFn: (row) => row.ownerName,
        header: 'Owner Contact',
        size: 180,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div>
              <div className="text-xs font-medium text-foreground">{t.ownerName}</div>
              <div className="text-xs text-muted-foreground">{t.ownerEmail}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{t.ownerPhone}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'plan',
        header: 'Plan & Subs',
        size: 140,
        cell: ({ row }) => (
          <div>
            <Badge variant="outline" className="font-semibold text-xs mb-0.5">
              {row.original.plan}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {row.original.customers.toLocaleString()} active subs
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="outline"
              className={
                status === 'active'
                  ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs'
                  : status === 'trial'
                    ? 'border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs'
                    : 'border-red-500/30 text-red-600 bg-red-500/10 text-xs'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 200,
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
              <Link href={`/platform/tenants/${t.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Tenant">
                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  statusMutation.mutate({
                    id: t.id,
                    status: t.status === 'active' ? 'suspended' : 'active',
                  })
                }
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
        description="Could not retrieve tenant portals from the server."
        actionLabel="Try Again"
        onAction={() => refetch()}
      />
    );
  }

  const { items, stats } = data;

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
          <span className="font-semibold tabular-nums">{stats.total}</span>{' '}
          <span className="text-muted-foreground">total portals</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.active}</span>{' '}
          <span className="text-muted-foreground">active portals</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.suspended}</span>{' '}
          <span className="text-muted-foreground">suspended portals</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.trial}</span>{' '}
          <span className="text-muted-foreground">trial portals</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search name, slug, email, owner..."
        searchFilterFn={tenantSearchFilter}
        facetFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: ['active', 'trial', 'suspended'],
          },
        ]}
        emptyTitle="No tenant portals found"
        emptyDescription="Create a subdomain portal for an ISP. No Nginx or DNS change is required per tenant."
        toolbarActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/platform/tenants/new')}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Portal
          </Button>
        }
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Tenant Portal"
        description="Are you sure you want to permanently delete this tenant portal? All tenant subscribers, packages and accounting data will be unlinked."
        confirmLabel="Yes, Delete Portal"
        destructive
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
