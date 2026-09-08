'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Row = IspOpsData['announcements'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.title).toLowerCase().includes(q) ||
    String(r.audience).toLowerCase().includes(q) ||
    String(r.startsAt).toLowerCase().includes(q) ||
    String(r.endsAt).toLowerCase().includes(q)
  );
};

export function AnnouncementsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.title)}</span>,
      },
      {
        accessorKey: 'audience',
        header: 'Audience',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.audience)}</span>,
      },
      {
        accessorKey: 'startsAt',
        header: 'Starts',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.startsAt)}</span>,
      },
      {
        accessorKey: 'endsAt',
        header: 'Ends',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.endsAt)}</span>,
      },
      {
        accessorKey: 'active',
        header: 'Active',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.active)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.announcements;
  const active = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Announcements"
        subtitle="Portal banner campaigns"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Announcements" }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Draft announcement created (mock)')}>
            New banner
          </Button>
        }
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "banners" },
          { value: active, label: "active" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="title"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
