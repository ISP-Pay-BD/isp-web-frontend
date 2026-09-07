'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Row = IspOpsData['backupJobs'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.target).toLowerCase().includes(q) ||
    String(r.lastRun).toLowerCase().includes(q) ||
    String(r.sizeMb).toLowerCase().includes(q)
  );
};

export function BackupPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Job',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'target',
        header: 'Target',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.target)}</span>,
      },
      {
        accessorKey: 'lastRun',
        header: 'Last run',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lastRun)}</span>,
      },
      {
        accessorKey: 'sizeMb',
        header: 'Size MB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.sizeMb)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.status)}</Badge>
        ),
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.backupJobs;
  const failed = rows.filter((r) => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup / Restore"
        subtitle="Scheduled backup jobs"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Backup / Restore" }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Backup job started (mock)')}>
            Run backup
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} jobs · {failed} failed
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
