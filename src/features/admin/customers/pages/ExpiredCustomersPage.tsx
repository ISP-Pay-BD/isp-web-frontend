'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, AlertTriangle, Send } from 'lucide-react';
import { useExpiredCustomers } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { Customer } from '../types';

export function ExpiredCustomersPage() {
  const { data, isLoading, isError, refetch } = useExpiredCustomers();
  const [search, setSearch] = useState('');

  const expiredList = data?.items ?? [];

  const filtered = useMemo(() => {
    return expiredList.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search),
    );
  }, [expiredList, search]);

  const columns: LegacyColumnDef<Customer, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <Link
            href={`/admin/customers/${row.original.id}`}
            className="font-medium hover:underline text-foreground"
          >
            {row.original.name}
          </Link>
          <div className="text-xs text-muted-foreground font-mono">
            {row.original.username} • {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'packageName',
      header: 'Package',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.packageName}</div>
          <div className="text-xs text-muted-foreground">{row.original.areaName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expired On',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-destructive">
          {row.original.expiryDate}
        </span>
      ),
    },
    {
      accessorKey: 'balanceBdt',
      header: 'Due Balance',
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={row.original.balanceBdt}
          className="font-semibold text-destructive"
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/customer-payments/new?customerId=${row.original.id}`}>
            <Button size="sm" variant="default" className="h-8 text-xs bg-primary hover:bg-primary/90">
              Recharge
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => toast.success(`Reminder SMS sent to ${row.original.phone}`)}
          >
            <Send className="mr-1 h-3 w-3" /> SMS
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading expired customers"
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" /> Expired Customers
          </h1>
          <p className="text-muted-foreground text-sm">
            Subscribers whose validity has lapsed. Send batch SMS alerts or process instant renewals.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success(`Bulk expiry reminder queued for ${filtered.length} customers`)}
        >
          <Send className="mr-1.5 h-4 w-4" /> Send Bulk Reminders
        </Button>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expired accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No expired customers"
        emptyDescription="Great news! All active subscriber accounts are currently up-to-date."
      />
    
      </PageContent>
    </div>
  );
}
