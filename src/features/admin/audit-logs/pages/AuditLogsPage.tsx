'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { useAuditLogs } from '../hooks/use-audit-logs';
import type { AuditLogEntry } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<AuditLogEntry>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const e = row.original;
  return (
    e.actor.toLowerCase().includes(q) ||
    e.action.toLowerCase().includes(q) ||
    e.entity.toLowerCase().includes(q) ||
    e.detail.toLowerCase().includes(q)
  );
};

export function AuditLogsPage() {
  const { data, isLoading, isError, refetch } = useAuditLogs();

  const columns = useMemo<LegacyColumnDef<AuditLogEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(row.original.at).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.actor}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.action}</span>,
      },
      {
        accessorKey: 'entity',
        header: 'Entity',
        cell: ({ row }) => (
          <div>
            <div className="text-sm">{row.original.entity}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.original.entityId}</div>
          </div>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          const s = row.original.severity;
          return (
            <Badge
              variant={s === 'critical' ? 'destructive' : s === 'warning' ? 'secondary' : 'outline'}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-2">{row.original.detail}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load audit logs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Who changed what across customers, payments, routers, and access"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Audit Logs' }]}
      />
      <DataTable
        columns={columns}
        data={data.items}
        searchKey="actor"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search actor, action, entity…"
      />
    </div>
  );
}
