'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkNodes } from '../hooks/useNetwork';
import { MAP_LEVELS, type MapLevel, type MapNode } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MapPin, MapPinOff, Layers, RadioTower, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

// mapbox-gl is heavy and browser-only: load the shared map on the client only.
const MapboxMap = dynamic(() => import('@/components/shared/MapboxMap').then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <div className="absolute inset-4 animate-pulse rounded-xl bg-muted/60 md:inset-5" />,
});

const levelColors: Record<
  MapLevel,
  { bg: string; border: string; text: string; dot: string; ring: string; hex: string }
> = {
  Root: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-500',
    dot: 'bg-red-500',
    ring: 'ring-red-500/30',
    hex: '#ef4444',
  },
  L1: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-500',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/30',
    hex: '#3b82f6',
  },
  L2: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    hex: '#10b981',
  },
  L3: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    hex: '#f59e0b',
  },
  L4: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    text: 'text-purple-500',
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/30',
    hex: '#a855f7',
  },
  'L5+': {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/40',
    text: 'text-cyan-500',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/30',
    hex: '#06b6d4',
  },
};

const isPlaced = (n: MapNode) => n.latitude !== null && n.longitude !== null;

export function NetworkMapPage() {
  const { data, isLoading, isError, refetch } = useNetworkNodes();
  const [selectedLevel, setSelectedLevel] = useState<'all' | MapLevel>('all');
  const [activeId, setActiveId] = useState<string | null>(null);

  const nodes = useMemo(() => data?.nodes ?? [], [data]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const activeNode = activeId ? (byId.get(activeId) ?? null) : null;
  const filtered = useMemo(
    () => nodes.filter((n) => selectedLevel === 'all' || n.level === selectedLevel),
    [nodes, selectedLevel],
  );
  const placed = useMemo(() => filtered.filter(isPlaced), [filtered]);
  const unplaced = useMemo(() => filtered.filter((n) => !isPlaced(n)), [filtered]);

  const markers = useMemo(
    () =>
      placed.map((node) => ({
        id: node.id,
        latitude: node.latitude as number,
        longitude: node.longitude as number,
        color: levelColors[node.level].hex,
        label: node.label,
      })),
    [placed],
  );

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={5} />;
  }
  if (isError || !data) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load network map"
          description="Could not fetch network map nodes."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Network Geographic Mapping"
        subtitle="Geographic distribution of your network nodes and their parent hierarchy"
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Network' },
          { label: 'Mapping' },
        ]}
      />

      {nodes.length === 0 ? (
        <EmptyState
          title="No network nodes yet"
          description="Nodes added to your network map (with their coordinates) appear here."
        />
      ) : (
      <Card className="overflow-hidden border-border/60 shadow-sm ring-1 ring-border/60">
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-muted/20 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <RadioTower className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Network Topology Map</CardTitle>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {placed.length} of {filtered.length} nodes placed on the map
                {data.truncated ? ` · first ${nodes.length} of ${data.total} nodes loaded` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" aria-label="Marker hierarchy levels">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200',
                selectedLevel === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
              )}
            >
              All Nodes ({nodes.length})
            </button>
            {MAP_LEVELS.map((lvl) => {
              const count = nodes.filter((n) => n.level === lvl).length;
              if (count === 0) return null;
              const style = levelColors[lvl];
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200',
                    isSelected
                      ? `ring-2 ${style.ring} border-current bg-card ${style.text}`
                      : 'border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                  <span>{lvl}</span>
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="relative flex min-h-[560px] flex-col overflow-hidden bg-background p-0 md:flex-row">
          <div className="relative min-h-[480px] flex-1 bg-muted/40 p-4 md:p-5">
            <MapboxMap
              markers={markers}
              selectedId={activeId}
              onSelect={(id) => setActiveId(id)}
              height="100%"
              className="absolute inset-4 md:inset-5 ring-1 ring-border/40"
              emptyMessage="None of these nodes has coordinates yet — see the list beside the map."
              renderMarker={(marker, selected) => {
                const node = byId.get(marker.id);
                const style = levelColors[node?.level ?? 'L1'];
                return (
                  <div className="relative flex items-center justify-center">
                    <span className={cn('absolute h-8 w-8 rounded-full opacity-35', style.dot)} />
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/90 text-[10px] font-bold text-white shadow-lg',
                        style.dot,
                        selected && 'ring-2 ring-offset-2 ring-offset-background',
                        selected && style.ring,
                      )}
                    >
                      {(node?.level ?? 'N').charAt(0)}
                    </div>
                  </div>
                );
              }}
            />
          </div>

          <div className="w-full space-y-4 border-t border-border/60 bg-card p-5 md:w-80 md:border-l md:border-t-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
                <Layers className="h-3.5 w-3.5 text-primary" />
              </span>
              Node Inspector
            </h3>

            {activeNode ? (
              <div key={activeNode.id} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    {activeNode.color && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-border/60"
                        style={{ backgroundColor: activeNode.color }}
                        aria-hidden
                      />
                    )}
                    {activeNode.label}
                  </div>
                  {activeNode.parentLabel && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      Under {activeNode.parentLabel}
                    </div>
                  )}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-[10px]',
                    levelColors[activeNode.level].text,
                    levelColors[activeNode.level].border,
                  )}
                >
                  {activeNode.level}
                </Badge>

                <div className="space-y-2.5 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Coordinates</span>
                    <span className="font-mono text-xs">
                      {isPlaced(activeNode) ? `${activeNode.latitude}, ${activeNode.longitude}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Child nodes</span>
                    <span className="text-xs font-bold text-foreground">{activeNode.childCount}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => setActiveId(null)}
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="space-y-3 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">No node selected</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    Click a node on the map or in the list below to inspect it.
                  </p>
                </div>
              </div>
            )}

            {unplaced.length > 0 && (
              <div className="space-y-2 border-t border-border/50 pt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <MapPinOff className="h-3.5 w-3.5" />
                  Without coordinates ({unplaced.length})
                </h4>
                <ul className="max-h-64 space-y-1 overflow-y-auto">
                  {unplaced.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(n.id)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/50',
                          activeId === n.id && 'bg-muted/60',
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', levelColors[n.level].dot)} />
                          <span className="truncate">{n.label}</span>
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{n.level}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
