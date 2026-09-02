'use client';

import { useState, useMemo } from 'react';
import { Search, Boxes } from 'lucide-react';
import { usePackages } from '@/features/admin/packages/hooks/use-packages';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { Package } from '@/data/shared/types';

export function PopPackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const [search, setSearch] = useState('');

  const items = data?.popPackages ?? [];
  const filtered = useMemo(() => {
    return items.filter((p) => search === '' || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const columns: LegacyColumnDef<Package, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'POP Package',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: 'speedMbps', header: 'Speed', cell: ({ row }) => <span className="font-mono">{row.original.speedMbps} Mbps</span> },
    {
      accessorKey: 'priceBdt',
      header: 'Reseller Price',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.priceBdt} className="font-semibold" />,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.type}</Badge>,
    },
    {
      accessorKey: 'visible',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.visible ? 'default' : 'secondary'}>
          {row.original.visible ? 'Active' : 'Hidden'}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load POP packages" description="Could not fetch reseller package catalog." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">POP Packages</h1>
        <p className="text-muted-foreground text-sm">
          Internet plans available to POP resellers for their downstream customers.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search POP packages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No POP packages" emptyDescription="Configure packages in the main Packages module first." />
    </div>
  );
}
