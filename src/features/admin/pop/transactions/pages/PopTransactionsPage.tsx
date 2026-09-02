'use client';

import { useMemo, useState } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { usePopData, type PopTransaction } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';

export function PopTransactionsPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const [search, setSearch] = useState('');

  const transactions = data?.transactions ?? [];
  const filtered = useMemo(() => {
    return transactions.filter(
      (t) =>
        search === '' ||
        t.popName.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase()),
    );
  }, [transactions, search]);

  const columns: LegacyColumnDef<PopTransaction, unknown>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.date}</span>,
    },
    {
      accessorKey: 'popName',
      header: 'POP',
      cell: ({ row }) => <span className="font-medium">{row.original.popName}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'credit' ? 'default' : 'secondary'} className="gap-1">
          {row.original.type === 'credit' ? (
            <ArrowDownCircle className="h-3 w-3" />
          ) : (
            <ArrowUpCircle className="h-3 w-3" />
          )}
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'amountBdt',
      header: 'Amount',
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={Math.abs(row.original.amountBdt)}
          className={row.original.type === 'credit' ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}
        />
      ),
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.note}</span>,
    },
  ];

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load transactions" description="Could not fetch POP transaction ledger." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">POP Transactions</h1>
        <p className="text-muted-foreground text-sm">Funding credits and debit remittances across all POP resellers.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search POP or note..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No transactions" emptyDescription="POP funding and remittance history will appear here." />
    </div>
  );
}
