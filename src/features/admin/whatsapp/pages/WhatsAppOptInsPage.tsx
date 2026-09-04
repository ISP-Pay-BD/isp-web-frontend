'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppOptIn } from '@/data/admin/comms.data';

type OptInRow = WhatsAppOptIn & { marketingLabel: string };

const optInSearchFilter = (
  row: LegacyRow<OptInRow>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const opt = row.original;
  return (
    opt.customerName.toLowerCase().includes(q) ||
    opt.phone.toLowerCase().includes(q)
  );
};

export function WhatsAppOptInsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();

  const rows = useMemo<OptInRow[]>(
    () =>
      (data?.optIns ?? []).map((opt) => ({
        ...opt,
        marketingLabel: opt.optedIn ? 'Opted in' : 'Opted out',
      })),
    [data?.optIns],
  );

  const columns = useMemo<LegacyColumnDef<OptInRow, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.customerName}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'optInDate',
        header: 'Opt-in Date',
        cell: ({ row }) => (
          <span className="text-xs">{row.original.optInDate}</span>
        ),
      },
      {
        accessorKey: 'marketingLabel',
        header: 'Marketing',
        cell: ({ row }) => {
          const opt = row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={opt.optedIn}
                onCheckedChange={() =>
                  toast.success(`Opt-in updated for ${opt.customerName}`)
                }
              />
              <Badge variant={opt.optedIn ? 'default' : 'secondary'}>
                {opt.marketingLabel}
              </Badge>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load opt-ins" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Opt-ins"
        subtitle="Marketing consent registry for WhatsApp Business API"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Opt-ins' },
        ]}
      />
      <WhatsAppNavLinks />
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchKey="customerName"
        searchPlaceholder="Search customer or phone..."
        searchFilterFn={optInSearchFilter}
        facetFilters={[{ columnId: 'marketingLabel', title: 'Marketing' }]}
        emptyTitle="No opt-in records"
        emptyDescription="Customer marketing consent entries will appear here."
      />
    </div>
  );
}
