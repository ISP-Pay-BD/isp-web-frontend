'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, CreditCard, Zap } from 'lucide-react';
import { useTenantBilling } from '../hooks/use-tenant-billing';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { TenantBillingPayment } from '@/data/admin/tenant-billing.data';

export function AdminPaymentPage() {
  const { data, isLoading, isError, refetch } = useTenantBilling();
  const [search, setSearch] = useState('');

  const items = data?.items ?? [];
  const summary = data?.summary;

  const filtered = useMemo(() => {
    return items.filter(
      (p) =>
        search === '' ||
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        p.planName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const columns: LegacyColumnDef<TenantBillingPayment, unknown>[] = [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-sm font-medium">{row.original.invoiceNo}</div>
          <div className="text-xs text-muted-foreground">{formatDateTime(row.original.paidAt)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'planName',
      header: 'Plan',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.planName}</div>
          <div className="text-xs text-muted-foreground">{row.original.period}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amountBdt',
      header: 'Amount',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} className="font-semibold" />,
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => <span className="capitalize text-sm">{row.original.method}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.note ?? '—'}</span>,
    },
  ];

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load payments" description="Could not fetch ISP Pay BD billing history." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Payment</h1>
          <p className="text-muted-foreground text-sm">
            Your ISP Pay BD SaaS subscription invoices and payment history.
          </p>
        </div>
        <Link href="/admin/subscription">
          <Button size="sm" variant="outline" className="border-amber-500/30">
            <Zap className="mr-1.5 h-4 w-4" /> Self Recharge
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Paid"
          value={<CurrencyDisplay amount={summary?.totalPaidBdt ?? 0} />}
          description="All completed subscription payments"
          icon={CreditCard}
        />
        <StatCard
          title="Pending"
          value={<CurrencyDisplay amount={summary?.pendingBdt ?? 0} />}
          description="Awaiting payment confirmation"
          icon={CreditCard}
        />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search invoice or plan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No payments yet" emptyDescription="Recharge your subscription to see billing history here." />
    </div>
  );
}
