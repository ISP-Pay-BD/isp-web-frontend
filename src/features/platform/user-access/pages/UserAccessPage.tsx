'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { UserLock } from 'lucide-react';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/features/shared/data-table';
import type { PlatformAdminUser } from '@/data/platform/contacts.data';

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
    a.role.toLowerCase().includes(q)
  );
};

const columns: LegacyColumnDef<PlatformAdminUser, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    size: 240,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    size: 140,
    cell: ({ row }) => (
      <span className="capitalize">{row.original.role.replace('_', ' ')}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'active' ? 'default' : 'secondary'}
        className="text-xs capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    size: 160,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLogin.slice(0, 16).replace('T', ' ')}
      </span>
    ),
  },
];

export function UserAccessPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'user-access'],
    queryFn: () => mockFetch('platform.user-access'),
  });

  const platformAdmins = useMemo(
    () =>
      (data?.admins ?? []).filter(
        (a) => a.role === 'super_admin' || a.role === 'admin',
      ),
    [data?.admins],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load user access"
        description="Could not retrieve roles and permissions."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="User Access Management"
        subtitle="Platform-level roles and permission presets for super-admin staff"
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        {data.roles.map((role) => (
          <p key={role.id}>
            <span className="font-semibold tabular-nums">{role.users}</span>{' '}
            <span className="text-muted-foreground">{role.name}</span>
            <span className="text-muted-foreground"> · {role.permissions} perms</span>
          </p>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserLock className="h-4 w-4" /> Platform Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={platformAdmins}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search user, email, role..."
            searchFilterFn={adminSearchFilter}
            facetFilters={[
              { columnId: 'role', title: 'Role' },
              { columnId: 'status', title: 'Status' },
            ]}
            emptyTitle="No platform administrators"
            emptyDescription="No super-admin or admin users found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
