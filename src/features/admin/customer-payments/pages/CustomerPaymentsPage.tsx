'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/format';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { Payment } from '@/data/shared/types';

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useCustomerPayments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const items = data?.items ?? [];
  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        search === '' ||
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        (p.note ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [items, search, statusFilter, methodFilter]);

  const columns: LegacyColumnDef<Payment, unknown>[] = [
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
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.customerId}</div>
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
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-[180px] block">
          {row.original.note ?? '—'}
        </span>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load payments" description="Could not fetch payment records." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customer Payments</h1>
          <p className="text-muted-foreground text-sm">Collection ledger — bKash, Nagad, cash, and bank deposits.</p>
        </div>
        <Can menu="customer_payment" action="create">
          <Link href="/admin/customer-payments/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Record Payment
            </Button>
          </Link>
        </Can>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice, customer, TrxID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => v && setMethodFilter(v)}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No payments found"
        emptyDescription="Record your first customer payment to start tracking collections."
      />
    </div>
  );
}
