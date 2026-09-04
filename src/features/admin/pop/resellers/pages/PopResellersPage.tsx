'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { Building2, Users, Phone } from 'lucide-react';
import { usePopData } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { PopReseller } from '../../hooks/use-pop';

export function PopResellersPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const resellers = data?.resellers ?? [];

  const columns: LegacyColumnDef<PopReseller, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'POP Reseller',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.area}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'balanceBdt',
      header: 'Balance',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.balanceBdt} className="font-semibold" />,
    },
    {
      accessorKey: 'customers',
      header: 'Customers',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.customers}
        </span>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 font-mono text-xs">
          <Phone className="h-3.5 w-3.5" /> {row.original.contact}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load POP resellers" description="Could not fetch POP directory." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">POP Resellers</h1>
        <p className="text-muted-foreground text-sm">
          Point-of-Presence resellers managing downstream customers in assigned areas.
        </p>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex gap-2">
        <Badge variant="outline">{resellers.length} active POPs</Badge>
        <Badge variant="secondary">
          Total balance: <CurrencyDisplay amount={resellers.reduce((s, r) => s + r.balanceBdt, 0)} />
        </Badge>
      </div>

      <DataTable columns={columns} data={resellers} emptyTitle="No POP resellers" emptyDescription="Add POP resellers to distribute packages in remote areas." />
    
      </PageContent>
    </div>
  );
}
