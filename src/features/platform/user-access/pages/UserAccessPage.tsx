'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserLock, Shield } from 'lucide-react';

export function UserAccessPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'user-access'],
    queryFn: () => mockFetch('platform.user-access'),
  });

  if (isLoading) return <PageSkeleton rows={4} />;
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.roles.map((role) => (
          <Card key={role.id} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {role.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{role.users}</div>
              <div className="text-xs text-muted-foreground">{role.permissions} permissions granted</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserLock className="h-4 w-4" /> Platform Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="py-2 text-left">User</th>
                  <th className="py-2 text-left">Role</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.admins
                  .filter((a) => a.role === 'super_admin' || a.role === 'admin')
                  .map((a) => (
                    <tr key={a.id}>
                      <td className="py-2">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </td>
                      <td className="py-2 capitalize">{a.role.replace('_', ' ')}</td>
                      <td className="py-2">
                        <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {a.lastLogin.slice(0, 16).replace('T', ' ')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
