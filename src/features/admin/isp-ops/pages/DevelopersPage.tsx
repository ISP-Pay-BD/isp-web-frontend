'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ApiKeyRow, WebhookRow } from '@/data/admin/isp-ops.data';

const keyFilter = (row: LegacyRow<ApiKeyRow>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  return row.original.name.toLowerCase().includes(q);
};

const whFilter = (row: LegacyRow<WebhookRow>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  return row.original.url.toLowerCase().includes(q) || row.original.events.toLowerCase().includes(q);
};

export function DevelopersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const keyColumns = useMemo<LegacyColumnDef<ApiKeyRow, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', enableHiding: false },
      {
        accessorKey: 'keyMasked',
        header: 'Key',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.keyMasked}</span>,
      },
      { accessorKey: 'scopes', header: 'Scopes' },
      {
        accessorKey: 'lastUsedAt',
        header: 'Last used',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.lastUsedAt}</span>,
      },
    ],
    [],
  );

  const whColumns = useMemo<LegacyColumnDef<WebhookRow, unknown>[]>(
    () => [
      {
        accessorKey: 'url',
        header: 'URL',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs break-all">{row.original.url}</span>,
      },
      { accessorKey: 'events', header: 'Events' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
      {
        accessorKey: 'lastDeliveryAt',
        header: 'Last delivery',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.lastDeliveryAt}</span>,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load developers" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const failing = data.webhooks.filter((w) => w.status === 'failing').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Developers"
        subtitle="API keys and webhook endpoints"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Developers' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('API key created (mock)')}>
            New API key
          </Button>
        }
      />
      <OpsSummaryStrip
        items={[
          { value: data.apiKeys.length, label: "API keys" },
          { value: data.webhooks.length, label: "webhooks" },
          { value: failing, label: "failing" },
        ]}
      />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">API keys</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={keyColumns}
            data={data.apiKeys}
            searchKey="name"
            searchFilterFn={keyFilter}
            searchPlaceholder="Search keys…"
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={whColumns}
            data={data.webhooks}
            searchKey="url"
            searchFilterFn={whFilter}
            searchPlaceholder="Search webhooks…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
