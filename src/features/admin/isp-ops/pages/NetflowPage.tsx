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

type Row = IspOpsData['netflowTopTalkers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.ip).toLowerCase().includes(q) ||
    String(r.username).toLowerCase().includes(q) ||
    String(r.rxGb).toLowerCase().includes(q) ||
    String(r.txGb).toLowerCase().includes(q) ||
    String(r.apps).toLowerCase().includes(q)
  );
};

function UsageBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground font-mono text-xs tabular-nums min-w-[3ch] text-right">{value}</span>
      <div className="h-1.5 w-16 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function AppTags({ apps }: { apps: string }) {
  const tags = apps.split(',').map((a) => a.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="bg-muted/50 text-muted-foreground px-1.5 py-0 text-[10px] font-medium dark:bg-muted/30"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function NetflowPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(() => {
    let maxRx = 0;
    let maxTx = 0;

    return [
      {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-xs tabular-nums">{String(row.original.ip)}</span>
        ),
      },
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-foreground font-medium text-sm">{String(row.original.username)}</span>
            <span className="text-muted-foreground font-mono text-[10px]">{String(row.original.ip)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'rxGb',
        header: 'Download',
        cell: ({ row }) => {
          const val = row.original.rxGb;
          if (val > maxRx) maxRx = val;
          return (
            <div className="flex items-center gap-2">
              <span className="text-foreground font-mono text-xs tabular-nums min-w-[3ch] text-right">{val}</span>
              <div className="h-1.5 w-16 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${maxRx > 0 ? Math.min((val / maxRx) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="text-muted-foreground/60 text-[10px]">GB</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'txGb',
        header: 'Upload',
        cell: ({ row }) => {
          const val = row.original.txGb;
          if (val > maxTx) maxTx = val;
          return (
            <div className="flex items-center gap-2">
              <span className="text-foreground font-mono text-xs tabular-nums min-w-[3ch] text-right">{val}</span>
              <div className="h-1.5 w-16 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${maxTx > 0 ? Math.min((val / maxTx) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="text-muted-foreground/60 text-[10px]">GB</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'apps',
        header: 'Applications',
        cell: ({ row }) => <AppTags apps={String(row.original.apps)} />,
      },
    ];
  }, []);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.netflowTopTalkers;
  const totalRx = rows.reduce((s, r) => s + r.rxGb, 0);
  const totalTx = rows.reduce((s, r) => s + r.txGb, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="NetFlow Top Talkers"
        subtitle="High bandwidth talkers by username"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'NetFlow Top Talkers' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'talkers' },
          { value: totalRx.toLocaleString(), label: 'GB down' },
          { value: totalTx.toLocaleString(), label: 'GB up' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="username"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search user, IP, app…"
      />
    </div>
  );
}
