'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotUserItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { formatMac } from '@/lib/format/network';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

const userSearchFilter = (
  row: LegacyRow<HotspotUserItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const u = row.original;
  return (
    u.username.toLowerCase().includes(q) ||
    u.macAddress.toLowerCase().includes(q) ||
    u.ipAddress.includes(q) ||
    u.pin.includes(q)
  );
};

export function HotspotUsersPage() {
  const { data, isLoading } = useHotspotData();
  const [users, setUsers] = useState<HotspotUserItem[]>([]);

  const initial = data?.users ?? [];
  if (users.length === 0 && initial.length > 0) {
    setUsers(initial);
  }

  const list = users.length > 0 ? users : initial;

  const handleDisconnect = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'expired' as const } : u)),
    );
    toast.success('User session disconnected.');
  };

  const columns = useMemo<LegacyColumnDef<HotspotUserItem, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
      },
      {
        accessorKey: 'profileName',
        header: 'Profile',
      },
      {
        accessorKey: 'macAddress',
        header: 'MAC',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatMac(row.original.macAddress)}</span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ipAddress}</span>
        ),
      },
      {
        accessorKey: 'pin',
        header: 'PIN',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.pin}</span>
        ),
      },
      {
        id: 'traffic',
        accessorFn: (row) => row.bytesInMb + row.bytesOutMb,
        header: 'Traffic',
        cell: ({ row }) => (
          <span className="text-xs">
            ↓{row.original.bytesInMb}MB / ↑{row.original.bytesOutMb}MB
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={
              row.original.status === 'active'
                ? 'online'
                : row.original.status === 'expired'
                  ? 'offline'
                  : 'pending'
            }
          />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.status === 'active' ? (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect(row.original.id)}
              >
                Disconnect
              </Button>
            </div>
          ) : null,
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" rows={5} />;

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
          <Button size="sm" onClick={() => toast.info('Voucher generation coming soon')}>
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

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="username"
        searchPlaceholder="Search username, MAC, IP, or PIN…"
        searchFilterFn={userSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No hotspot users"
        emptyDescription="Generate a voucher to get started."
      />

      <Button variant="link" className="px-0" render={<Link href="/admin/hotspot" />}>
        ← Back to hotspot hub
      </Button>
    </div>
  );
}
