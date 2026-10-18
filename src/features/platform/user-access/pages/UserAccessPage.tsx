'use client';

import { useMemo, useState } from 'react';
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

import { formatCount } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useLocale>['t'];

function statusLabel(t: Translate, status: string): string {
  if (status === 'active') return t('status.active', 'Active');
  if (status === 'inactive') return t('status.inactive', 'Inactive');
  if (status === 'suspended') return t('status.suspended', 'Suspended');
  return status;
}

const getColumns = (t: Translate): LegacyColumnDef<PlatformAdminUser, unknown>[] => [
  {
    accessorKey: 'name',
    header: t('platform.userAccess.page.colUser', 'User'),
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
    header: t('platform.userAccess.page.colRole', 'Role'),
    size: 140,
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.role === 'super_admin'
          ? t('platform.userAccess.page.roleSuperAdmin', 'Super admin')
          : row.original.role.replace('_', ' ')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: t('platform.userAccess.page.colStatus', 'Status'),
    size: 100,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
        {statusLabel(t, row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: t('platform.userAccess.page.colLastLogin', 'Last Login'),
    size: 160,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? platformDateTime(row.original.lastLoginAt) : t('platform.userAccess.page.neverRecorded', 'Never recorded')}
      </span>
    ),
  },
];

export function UserAccessPage() {
  const { t } = useLocale();
  const columns = useMemo(() => getColumns(t), [t]);
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
      <EmptyState variant="error"
        title={t('platform.userAccess.page.loadFailed', 'Failed to load user access')}
        description={
          err instanceof Error ? err.message : t('platform.userAccess.page.loadFailedDesc', 'Could not retrieve roles and administrators.')
        }
        actionLabel={t('common.retry', 'Retry')}
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
        title={t('platform.userAccess.page.title', 'Platform Access & Roles')}
        subtitle={t(
          'platform.userAccess.page.subtitle',
          'Who holds each role across the platform and how many permissions each default template grants',
        )}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('platform.userAccess.page.crumb', 'User Access Management') },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {roles.data.map((role) => (
          <Card key={role.id} className="border-border/60 bg-card hover:border-primary/40 transition">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-foreground">{role.name}</span>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                  {t('platform.userAccess.page.perms', '{n} perms', { n: role.permissions })}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{role.modules !== null
                    ? t('platform.userAccess.page.modules', '{n} modules', { n: role.modules })
                    : t('platform.userAccess.page.allModules', 'All modules')}
                </span>
                <span className="font-mono text-primary">
                  {t('platform.userAccess.page.users', '{n} users', { n: formatCount(role.users) })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserLock className="h-4 w-4 text-primary" /> {t('platform.userAccess.page.superAdmins', 'Platform Super-Administrators')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('platform.userAccess.page.managedPrefix', 'Tenant owner accounts are managed on')}{' '}
            <Link href="/platform/admins" className="underline">
              {t('platform.userAccess.page.secondAdmins', 'Second Admins')}
            </Link>
            {t('platform.userAccess.page.managedSuffix', '.')}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable urlState
            columns={columns}
            data={admins.data.items}
            getRowId={(row) => row.id}
            searchPlaceholder={t('platform.userAccess.page.search', 'Search name, email, phone...')}
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
            emptyTitle={t('platform.userAccess.page.emptyTitle', 'No platform administrators')}
            emptyDescription={t('platform.userAccess.page.emptyDesc', 'No super-admin accounts match.')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
