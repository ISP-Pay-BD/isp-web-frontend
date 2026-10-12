'use client';

import { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { UserLock } from 'lucide-react';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/features/shared/data-table';
import type { PlatformAdminUser } from '@/features/platform/types';

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
    cell: ({ row }) => <span className="capitalize">{row.original.role.replace('_', ' ')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    size: 160,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? platformDateTime(row.original.lastLoginAt) : 'Never recorded'}
      </span>
    ),
  },
];

export function UserAccessPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const roles = useQuery({
    queryKey: ['platform', 'roles'],
    queryFn: () => platformService.getRoles(),
  });

  const admins = useQuery({
    queryKey: ['platform', 'admins', 'list', { role: 'super_admin', page, pageSize, search }],
    queryFn: () => platformService.getAdmins({ role: 'super_admin', page, perPage: pageSize, search }),
    placeholderData: keepPreviousData,
  });

  if (roles.isLoading || admins.isLoading) return <PageSkeleton variant="table" rows={4} />;
  if (roles.error || admins.error || !roles.data || !admins.data) {
    const err = roles.error ?? admins.error;
    return (
      <EmptyState
        title="Failed to load user access"
        description={err instanceof Error ? err.message : 'Could not retrieve roles and administrators.'}
        actionLabel="Retry"
        onAction={() => {
          void roles.refetch();
          void admins.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Platform Access & Roles"
        subtitle="Who holds each role across the platform and how many permissions each default template grants"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'User Access Management' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {roles.data.map((role) => (
          <Card key={role.id} className="border-border/60 bg-card hover:border-primary/40 transition">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-foreground">{role.name}</span>
                <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                  {role.permissions} perms
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{role.modules !== null ? `${role.modules} modules` : 'All modules'}</span>
                <span className="font-mono text-primary">{role.users.toLocaleString()} users</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserLock className="h-4 w-4 text-primary" /> Platform Super-Administrators
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Tenant owner accounts are managed on{' '}
            <Link href="/platform/admins" className="underline">
              Second Admins
            </Link>
            .
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable
            columns={columns}
            data={admins.data.items}
            getRowId={(row) => row.id}
            searchPlaceholder="Search name, email, phone..."
            server={{
              page,
              pageSize,
              total: admins.data.total,
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
            emptyTitle="No platform administrators"
            emptyDescription="No super-admin accounts match."
          />
        </CardContent>
      </Card>
    </div>
  );
}
