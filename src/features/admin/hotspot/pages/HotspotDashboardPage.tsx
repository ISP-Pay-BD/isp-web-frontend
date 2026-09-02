'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { formatMac } from '@/lib/format/network';

export function HotspotDashboardPage() {
  const { data, isLoading } = useHotspotData();

  if (isLoading) return <PageSkeleton rows={6} />;

  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const routers = data?.routers ?? [];
  const activeSessions = users.filter((u) => u.status === 'active');
  const onlineRouters = routers.filter((r) => r.status === 'online').length;
  const weekRevenue = reports.reduce((s, r) => s + r.priceBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Dashboard"
        subtitle="Real-time voucher sessions and router health"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Dashboard' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/hotspot/reports" />}>
            View sales report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active sessions" value={String(activeSessions.length)} />
        <StatCard title="Online routers" value={`${onlineRouters}/${routers.length}`} />
        <StatCard title="Week revenue" value={formatBdtWithSymbol(weekRevenue)} />
        <StatCard title="Expired today" value={String(users.filter((u) => u.status === 'expired').length)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live hotspot sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.profileName}</TableCell>
                  <TableCell className="font-mono text-xs">{formatMac(user.macAddress)}</TableCell>
                  <TableCell className="font-mono text-xs">{user.ipAddress}</TableCell>
                  <TableCell>{user.uptime}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status === 'active' ? 'online' : 'offline'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
