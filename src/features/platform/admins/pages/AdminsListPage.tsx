'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { ShieldCheck, Users } from 'lucide-react';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/features/shared/data-table';
import type { PlatformAdminUser } from '@/data/platform/contacts.data';
import { toast } from 'sonner';

const adminSearchFilter = (
  row: LegacyRow<PlatformAdminUser>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const a = row.original;
  return (
    a.name.toLowerCase().includes(q) ||
    a.email.toLowerCase().includes(q) ||
    (a.tenantSlug ?? '').toLowerCase().includes(q)
  );
};

const columns: LegacyColumnDef<PlatformAdminUser, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Admin',
    size: 240,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
        <div className="text-[11px] font-mono text-muted-foreground">{row.original.phone}</div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    size: 120,
    cell: ({ row }) => (
      <span className="capitalize">{row.original.role.replace('_', ' ')}</span>
    ),
  },
  {
    id: 'tenant',
    accessorFn: (row) => row.tenantSlug ?? '',
    header: 'Tenant',
    size: 180,
    cell: ({ row }) =>
      row.original.tenantSlug ? (
        <Link
          href={`/platform/tenants/${row.original.tenantId}`}
          className="text-primary hover:underline font-mono text-xs"
        >
          {row.original.tenantSlug}.isppaybd.com
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'packageName',
    header: 'Package',
    size: 140,
    cell: ({ row }) => (
      <span className="text-xs">{row.original.packageName ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'active' ? 'default' : 'secondary'}
        className="capitalize text-xs"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    size: 140,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLogin.slice(0, 16).replace('T', ' ')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    size: 120,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.success(`Login-as ${row.original.name} (mock)`)}
      >
        Login as
      </Button>
    ),
  },
];

export function AdminsListPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'admins'],
    queryFn: () => mockFetch('platform.admins.list'),
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load admins"
        description="Could not retrieve second admin accounts."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const activeCount = data.items.filter((a) => a.status === 'active').length;
  const linkedCount = data.items.filter((a) => a.tenantId).length;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Second Admins"
        subtitle="Tenant owner accounts and platform-level administrators"
        actions={
          <Link href="/platform/admins/packages">
            <Button variant="outline" size="sm">
              Admin Packages
            </Button>
          </Link>
        }
      />

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{data.total}</span>{' '}
          <span className="text-muted-foreground">total admins</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{activeCount}</span>{' '}
          <span className="text-muted-foreground">active accounts</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{linkedCount}</span>{' '}
          <span className="text-muted-foreground">linked to tenants</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search name, email, tenant..."
        searchFilterFn={adminSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No admins found"
        emptyDescription="No second admin accounts match your filters."
      />
    </div>
  );
}
