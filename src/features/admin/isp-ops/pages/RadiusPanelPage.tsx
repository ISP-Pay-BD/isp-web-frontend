'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { RadiusCoaLog, RadiusNas } from '@/data/admin/isp-ops.data';

const nasFilter = (row: LegacyRow<RadiusNas>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.name.toLowerCase().includes(q) || r.ip.includes(q);
};

const coaFilter = (row: LegacyRow<RadiusCoaLog>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.username.toLowerCase().includes(q) || r.nas.toLowerCase().includes(q);
};

export function RadiusPanelPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const nasColumns = useMemo<LegacyColumnDef<RadiusNas, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'NAS', enableHiding: false },
      {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ip}</span>,
      },
      {
        accessorKey: 'secretMasked',
        header: 'Secret',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.secretMasked}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'online' ? 'default' : 'secondary'}>
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  const coaColumns = useMemo<LegacyColumnDef<RadiusCoaLog, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.at}</span>,
      },
      { accessorKey: 'nas', header: 'NAS' },
      {
        accessorKey: 'username',
        header: 'User',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.username}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
      },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: ({ row }) => (
          <Badge variant={row.original.result === 'ok' ? 'default' : 'destructive'}>
            {row.original.result}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load RADIUS" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const nasOnline = data.radiusNas.filter((n) => n.status === 'online').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="RADIUS / CoA / PoD"
        subtitle="NAS inventory and disconnect / CoA audit trail"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'RADIUS' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Test CoA ping OK (mock)')}>
            Test CoA
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {data.radiusNas.length} NAS · {data.radiusCoaLog.length} CoA logs · {nasOnline} online
      </p>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">NAS clients</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={nasColumns}
            data={data.radiusNas}
            searchKey="name"
            searchFilterFn={nasFilter}
            searchPlaceholder="Search NAS…"
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">CoA / PoD log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={coaColumns}
            data={data.radiusCoaLog}
            searchKey="username"
            searchFilterFn={coaFilter}
            searchPlaceholder="Search username…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
