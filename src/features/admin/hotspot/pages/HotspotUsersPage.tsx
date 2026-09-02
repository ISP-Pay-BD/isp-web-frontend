'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotUserItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMac } from '@/lib/format/network';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

export function HotspotUsersPage() {
  const { data, isLoading } = useHotspotData();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<HotspotUserItem[]>([]);

  const initial = data?.users ?? [];
  if (users.length === 0 && initial.length > 0) {
    setUsers(initial);
  }

  const list = users.length > 0 ? users : initial;
  const filtered = list.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      u.ipAddress.includes(search) ||
      u.pin.includes(search),
  );

  const handleDisconnect = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'expired' as const } : u)),
    );
    toast.success('User session disconnected.');
  };

  if (isLoading && list.length === 0) return <PageSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Users"
        subtitle="Voucher users, MAC binding, and live session data"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Users' },
        ]}
        actions={
          <Button size="sm" onClick={() => toast.info('Generate voucher — mock phase')}>
            <Plus className="mr-2 h-4 w-4" />
            Generate voucher
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total users" value={String(list.length)} icon={Users} />
        <StatCard title="Active" value={String(list.filter((u) => u.status === 'active').length)} />
        <StatCard title="Expired" value={String(list.filter((u) => u.status === 'expired').length)} />
      </div>

      <Input
        placeholder="Search username, MAC, IP, or PIN…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No hotspot users" description="Generate a voucher to get started." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.profileName}</TableCell>
                  <TableCell className="font-mono text-xs">{formatMac(user.macAddress)}</TableCell>
                  <TableCell className="font-mono text-xs">{user.ipAddress}</TableCell>
                  <TableCell className="font-mono text-xs">{user.pin}</TableCell>
                  <TableCell className="text-xs">
                    ↓{user.bytesInMb}MB / ↑{user.bytesOutMb}MB
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        user.status === 'active'
                          ? 'online'
                          : user.status === 'expired'
                            ? 'offline'
                            : 'pending'
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {user.status === 'active' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleDisconnect(user.id)}>
                        Disconnect
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button variant="link" className="px-0" render={<Link href="/admin/hotspot" />}>
        ← Back to hotspot hub
      </Button>
    </div>
  );
}
