'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import type { CorporateQueueJob } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<CorporateQueueJob>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const j = row.original;
  return (
    j.customerName.toLowerCase().includes(q) ||
    j.routerName.toLowerCase().includes(q) ||
    j.action.toLowerCase().includes(q)
  );
};

export function CorporateQueuesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'corporateQueues'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'corporateQueues');
      return res as { items: CorporateQueueJob[] };
    },
  });

  const columns = useMemo<LegacyColumnDef<CorporateQueueJob, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">{row.original.customerName}</div>
            <div className="text-xs text-muted-foreground">{row.original.packageName}</div>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.action}</span>,
      },
      {
        accessorKey: 'routerName',
        header: 'Router',
        cell: ({ row }) => <span className="text-sm">{row.original.routerName}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={
                s === 'failed'
                  ? 'destructive'
                  : s === 'success'
                    ? 'default'
                    : s === 'running'
                      ? 'secondary'
                      : 'outline'
              }
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'attempts',
        header: 'Tries',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.attempts}</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status === 'failed' ? (
            <Button size="sm" variant="outline" onClick={() => toast.success('Requeued (mock)')}>
              Retry
            </Button>
          ) : null,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load queues" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Sync Queues"
        subtitle="PPPoE create / speed / suspend jobs pushed to MikroTik"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Corporate Queues' }]}
      />
      <DataTable
        columns={columns}
        data={data.items}
        searchKey="customerName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search customer or router…"
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
      />
    </div>
  );
}
