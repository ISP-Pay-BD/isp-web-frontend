'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { LogIn, ShieldCheck, Users, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { platformService } from '@/lib/api/services/platform.service';
import { transformBackendAuthUser } from '@/lib/api/adapters/auth.adapter';
import { setAuthCookie } from '@/lib/auth/session-cookie';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { parkImpersonatorSession } from '@/lib/auth/impersonation';
import { PlatformPageHeader, platformDate, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/features/shared/data-table';
import type { PlatformAdminUser } from '@/features/platform/types';

const selectClass = 'h-9 rounded-md border border-input bg-background px-3 text-xs';

export function AdminsListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loginTarget, setLoginTarget] = useState<PlatformAdminUser | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'admins', 'list', { page, pageSize, search, role, status }],
    queryFn: () => platformService.getAdmins({ page, perPage: pageSize, search, role, status }),
    placeholderData: keepPreviousData,
  });

  const impersonate = useMutation({
    mutationFn: (admin: PlatformAdminUser) => platformService.impersonateAdmin(admin.id),
    onSuccess: (result) => {
      const user = transformBackendAuthUser({
        user_id: result.user_id,
        name: result.name,
        email: result.email,
        mobile: result.mobile,
        role: result.role,
        status: result.status,
        tenant_id: result.tenant_id ?? undefined,
        permissions: result.permissions,
      });
      // Park the super-admin session in this tab so the admin shell can offer
      // "Return to super admin", then drop the refresh token: the impersonation
      // token has none, so an expired session ends instead of silently
      // refreshing back to super admin.
      const current = useAuthStore.getState();
      if (current.user && current.token) {
        let refreshToken: string | null = null;
        try {
          refreshToken = localStorage.getItem('isp_refresh_token');
        } catch {
          /* storage unavailable */
        }
        parkImpersonatorSession({ user: current.user, token: current.token, refreshToken, impersonatedName: user.name });
      }
      try {
        localStorage.removeItem('isp_refresh_token');
      } catch {
        /* storage unavailable — the session still switches */
      }
      queryClient.clear();
      useAuthStore.setState({ user, token: result.access_token, isAuthenticated: true });
      setAuthCookie({ userId: user.id, role: user.role, status: user.status });
      toast.success(`Signed in as ${user.name}`);
      router.replace('/admin/dashboard');
    },
    onSettled: () => setLoginTarget(null),
  });

  const columns = useMemo<LegacyColumnDef<PlatformAdminUser, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Admin',
        size: 240,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.organizationName ? (
              <div className="text-xs text-foreground/80">{row.original.organizationName}</div>
            ) : null}
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
            <div className="text-[11px] font-mono text-muted-foreground">{row.original.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 110,
        cell: ({ row }) => <span className="capitalize">{row.original.role.replace('_', ' ')}</span>,
      },
      {
        id: 'tenant',
        accessorFn: (row) => row.tenantSlug ?? '',
        header: 'Portal',
        size: 150,
        cell: ({ row }) =>
          row.original.tenantId ? (
            <Link href={`/platform/tenants/${row.original.tenantId}`} className="text-primary hover:underline font-mono text-xs">
              {row.original.tenantSlug}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'packageName',
        header: 'Package',
        size: 150,
        cell: ({ row }) =>
          row.original.role === 'admin' ? (
            <div className="text-xs">
              <div>{row.original.packageName ?? 'No package'}</div>
              {row.original.planType ? (
                <div className="text-[11px] uppercase text-muted-foreground">{row.original.planType}</div>
              ) : null}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'subscriptionStatus',
        header: 'Subscription',
        size: 150,
        cell: ({ row }) => {
          const a = row.original;
          if (a.role !== 'admin') return <span className="text-muted-foreground">—</span>;
          const trial = a.trialEndsAt && new Date(a.trialEndsAt.replace(' ', 'T')) > new Date();
          return (
            <div className="text-xs">
              <Badge variant="outline" className="capitalize text-[10px]">
                {trial ? 'trial' : (a.subscriptionStatus ?? 'unknown')}
              </Badge>
              {a.willExpire ? <div className="mt-0.5 text-[11px] text-muted-foreground">until {platformDate(a.willExpire)}</div> : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Account',
        size: 90,
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.lastLoginAt ? platformDateTime(row.original.lastLoginAt) : 'Never recorded'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 190,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.role === 'admin' ? (
            <div className="flex justify-end gap-1.5">
              <Link href={`/platform/admins/${row.original.id}/billing`}>
                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                  <Wallet className="mr-1 h-3.5 w-3.5" /> Billing
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                disabled={row.original.status !== 'active' || impersonate.isPending}
                onClick={() => setLoginTarget(row.original)}
                title={row.original.status !== 'active' ? 'Disabled accounts cannot be impersonated' : undefined}
              >
                <LogIn className="mr-1 h-3.5 w-3.5" /> Login as
              </Button>
            </div>
          ) : null,
      },
    ],
    [impersonate.isPending],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load admins"
        description={error instanceof Error ? error.message : 'Could not retrieve admin accounts.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Second Admins"
        subtitle="Tenant owner accounts and platform-level administrators"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Admins' },
        ]}
        actions={
          <Link href="/platform/admins/packages">
            <Button variant="outline" size="sm">
              Admin Packages
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Administrators</p>
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-0.5">{summary.total}</p>
              <p className="text-[11px] text-muted-foreground">{summary.superAdmins} super admin</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Accounts</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-500 font-mono mt-0.5">{summary.active}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Linked to a Portal</p>
              <p className="text-2xl font-bold tracking-tight text-blue-500 font-mono mt-0.5">{summary.linked}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        getRowId={(row) => row.id}
        searchPlaceholder="Search name, email, phone..."
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
        toolbarActions={
          <div className="flex gap-2">
            <select
              aria-label="Filter by role"
              className={selectClass}
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              <option value="admin">Tenant admins</option>
              <option value="super_admin">Super admins</option>
            </select>
            <select
              aria-label="Filter by status"
              className={selectClass}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All accounts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        }
        emptyTitle="No admins found"
        emptyDescription="No admin accounts match your filters."
      />

      <ConfirmDialog
        open={Boolean(loginTarget)}
        onOpenChange={(open) => !open && setLoginTarget(null)}
        title={loginTarget ? `Login as ${loginTarget.name}?` : 'Login as admin'}
        description="You will act inside this tenant's admin portal with a short-lived session (no refresh). Password, profile and payment-gateway changes are blocked, and the action is audit-logged. Your super-admin session ends — sign in again afterwards to return."
        confirmLabel={impersonate.isPending ? 'Signing in…' : 'Login as admin'}
        onConfirm={() => loginTarget && impersonate.mutate(loginTarget)}
      />
    </div>
  );
}
