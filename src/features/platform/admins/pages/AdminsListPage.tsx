'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Users, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AdminsListPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'admins'],
    queryFn: () => mockFetch('platform.admins.list'),
  });

  if (isLoading) return <PageSkeleton rows={5} />;
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

  const items = data.items.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.tenantSlug ?? '').includes(search.toLowerCase()),
  );

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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Admins" value={data.total} icon={Users} />
        <StatCard title="Active Accounts" value={activeCount} icon={ShieldCheck} />
        <StatCard title="Linked to Tenants" value={linkedCount} description="ISP owner accounts" icon={ShieldCheck} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{a.phone}</div>
                </td>
                <td className="px-4 py-3 capitalize">{a.role.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  {a.tenantSlug ? (
                    <Link href={`/platform/tenants/${a.tenantId}`} className="text-primary hover:underline font-mono text-xs">
                      {a.tenantSlug}.isppaybd.com
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{a.packageName ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                    {a.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.lastLogin.slice(0, 16).replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
