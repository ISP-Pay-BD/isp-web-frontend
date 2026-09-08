'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { DataTable } from '@/features/shared/data-table';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { cn } from '@/lib/utils';

type Row = IspOpsData['collectionPoints'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.collector).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.stops).toLowerCase().includes(q) ||
    String(r.collectedBdt).toLowerCase().includes(q)
  );
};

export function CollectionsMapPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => data?.collectionPoints ?? [], [data?.collectionPoints]);

  const markers = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        latitude: r.lat,
        longitude: r.lng,
        color: selectedId === r.id ? '#e85a1a' : '#64748b',
        label: `${r.collector} — ${r.area}`,
      })),
    [rows, selectedId],
  );

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'collector',
        header: 'Collector',
        enableHiding: false,
        cell: ({ row }) => (
          <button
            type="button"
            className={cn(
              'text-left text-sm transition-colors hover:text-primary',
              selectedId === row.original.id && 'font-semibold text-primary',
            )}
            onClick={() => setSelectedId(row.original.id)}
          >
            {String(row.original.collector)}
          </button>
        ),
      },
      {
        accessorKey: 'area',
        header: 'Area',
        cell: ({ row }) => <span className="text-sm">{String(row.original.area)}</span>,
      },
      {
        accessorKey: 'stops',
        header: 'Stops',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">{String(row.original.stops)}</span>
        ),
      },
      {
        accessorKey: 'collectedBdt',
        header: 'Collected',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {String(row.original.collectedBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'lat',
        header: 'Lat',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">{String(row.original.lat)}</span>
        ),
      },
      {
        accessorKey: 'lng',
        header: 'Lng',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">{String(row.original.lng)}</span>
        ),
      },
    ],
    [selectedId],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const stops = rows.reduce((s, r) => s + r.stops, 0);
  const collected = rows.reduce((s, r) => s + r.collectedBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Collections Map"
        subtitle="Collector routes and GPS stops on Mapbox"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Collections Map' },
        ]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'collectors' },
          { value: stops, label: 'stops' },
          { value: collected.toLocaleString(), label: '৳' },
        ]}
      />

      <MapboxMap
        markers={markers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        height={420}
        className="shadow-sm ring-1 ring-border/60"
        renderMarker={(marker, selected) => (
          <div className="relative flex flex-col items-center">
            <span
              className={cn(
                'h-3.5 w-3.5 rounded-full border-2 border-white shadow-md',
                selected && 'scale-125 ring-2 ring-primary/40',
              )}
              style={{ backgroundColor: marker.color }}
            />
            {selected ? (
              <span className="mt-1 max-w-[140px] truncate rounded bg-popover px-1.5 py-0.5 text-[10px] font-medium text-popover-foreground shadow">
                {marker.label}
              </span>
            ) : null}
          </div>
        )}
      />

      <DataTable
        columns={columns}
        data={rows}
        searchKey="collector"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
