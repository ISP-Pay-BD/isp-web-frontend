'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspInvoice } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<IspInvoice>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    r.number.toLowerCase().includes(q) ||
    r.customerName.toLowerCase().includes(q) ||
    r.status.includes(q)
  );
};

export function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<IspInvoice, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Invoice',
        enableHiding: false,
        cell: ({ row }) => (
          <Link href={`/admin/invoices/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
            {row.original.number}
          </Link>
        ),
      },
      { accessorKey: 'customerName', header: 'Customer' },
      { accessorKey: 'period', header: 'Period' },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <span className="tabular-nums">{row.original.amountBdt.toLocaleString()} ৳</span>,
      },
      {
        accessorKey: 'taxBdt',
        header: 'Tax',
        cell: ({ row }) => <span className="tabular-nums">{row.original.taxBdt.toLocaleString()} ৳</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.status}</Badge>,
      },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.dueDate}</span>,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load invoices" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const overdue = data.invoices.filter((i) => i.status === 'overdue').length;
  const dueTotal = data.invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.amountBdt + i.taxBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        subtitle="Generate, send, and track customer invoices (mock PDF)"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Invoices' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Invoice batch generated (mock)')}>
            Generate month
          </Button>
        }
      />
      <OpsSummaryStrip
        items={[
          { value: data.invoices.length, label: "invoices" },
          { value: overdue, label: "overdue" },
          { value: dueTotal.toLocaleString(), label: "৳ open" },
        ]}
      />
      <DataTable
        columns={columns}
        data={data.invoices}
        searchKey="number"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search invoice…"
      />
      <p className="text-xs text-muted-foreground">
        Tip: open an invoice for PDF preview ·{' '}
        <Link href="/admin/invoices/inv_01" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'h-auto p-0')}>
          sample
        </Link>
      </p>
    </div>
  );
}
