'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotProfileItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Package } from 'lucide-react';
import { toast } from 'sonner';

const profileSearchFilter = (
  row: LegacyRow<HotspotProfileItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return p.name.toLowerCase().includes(q) || p.rateLimit.includes(q);
};

export function HotspotPackagesPage() {
  const { data, isLoading } = useHotspotData();
  const [profiles, setProfiles] = useState<HotspotProfileItem[]>([]);

  const initial = data?.profiles ?? [];
  if (profiles.length === 0 && initial.length > 0) {
    setProfiles(initial);
  }

  const list = profiles.length > 0 ? profiles : initial;

  const handleToggle = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p,
      ),
    );
    toast.success('Profile status updated.');
  };

  const columns = useMemo<LegacyColumnDef<HotspotProfileItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Profile',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'rateLimit',
        header: 'Speed',
        cell: ({ row }) => <Badge variant="outline">{row.original.rateLimit}</Badge>,
      },
      {
        accessorKey: 'validityFormatted',
        header: 'Validity',
      },
      {
        id: 'pricing',
        accessorFn: (row) => row.sellingPriceBdt,
        header: 'Cost / Sell',
        cell: ({ row }) => (
          <span>
            {formatBdtWithSymbol(row.original.priceBdt)} /{' '}
            {formatBdtWithSymbol(row.original.sellingPriceBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'addressPool',
        header: 'Pool',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.addressPool}</span>
        ),
      },
      {
        accessorKey: 'activeUsers',
        header: 'Active',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status === 'active' ? 'online' : 'offline'} />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="ghost" size="sm" onClick={() => handleToggle(row.original.id)}>
              Toggle
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="cards" rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Packages"
        subtitle="User profiles, rate limits, validity, and selling price"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Packages' },
        ]}
        actions={
          <Button size="sm" onClick={() => toast.info('Profile management coming soon')}>
            <Plus className="mr-2 h-4 w-4" />
            Add profile
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total profiles" value={String(list.length)} icon={Package} />
        <StatCard title="Active profiles" value={String(list.filter((p) => p.status === 'active').length)} />
        <StatCard title="Active users" value={String(list.reduce((s, p) => s + p.activeUsers, 0))} />
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search profiles…"
        searchFilterFn={profileSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No profiles found"
        emptyDescription="Try a different search term."
      />

      <Button variant="link" className="px-0" render={<Link href="/admin/hotspot" />}>
        ← Back to hotspot hub
      </Button>
    </div>
  );
}
