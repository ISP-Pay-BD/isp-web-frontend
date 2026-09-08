'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkMap } from '../hooks/useNetwork';
import type { NetworkMapNodeItem } from '@/data/admin/network-ops.data';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  MapPin,
  Layers,
  RadioTower,
  Wifi,
  WifiOff,
  Server,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const levelColors: Record<
  string,
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

export function NetworkMapPage() {
  const { data: nodes = [], isLoading, isError, refetch } = useNetworkMap();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<NetworkMapNodeItem | null>(null);

  const filtered = nodes.filter((n) => selectedLevel === 'all' || n.level === selectedLevel);

  const markers = useMemo(
    () =>
      filtered.map((node) => ({
        id: node.id,
        latitude: node.lat,
        longitude: node.lng,
        color: levelColors[node.level]?.hex ?? '#f75803',
        label: node.name,
      })),
    [filtered],
  );

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={5} />;
  }
  if (isError) {
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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="Network Geographic Mapping"
        subtitle="Geographic distribution of NOC core, distribution POPs, OLT headends, and customer fiber nodes"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network' },
          { label: 'Mapping' },
        ]}
      />

      <Card className="overflow-hidden border-border/60 shadow-sm ring-1 ring-foreground/5">
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-muted/20 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <RadioTower className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Live Bangladesh Topology Map</CardTitle>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {filtered.length} of {nodes.length} nodes on Mapbox
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
            {(['Root', 'L1', 'L2', 'L3', 'L4', 'L5+'] as const).map((lvl) => {
              const count = nodes.filter((n) => n.level === lvl).length;
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
                  <span
                    className={cn('h-2 w-2 rounded-full', style.dot, isSelected && 'animate-pulse')}
                  />
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
              selectedId={activeNode?.id ?? null}
              onSelect={(id) => {
                const node = nodes.find((n) => n.id === id) ?? null;
                setActiveNode(node);
              }}
              height="100%"
              className="absolute inset-4 md:inset-5 ring-1 ring-border/40"
              renderMarker={(marker, selected) => {
                const node = nodes.find((n) => n.id === marker.id);
                const style = levelColors[node?.level ?? 'L1'];
                return (
                  <div className="relative flex items-center justify-center">
                    <span
                      className={cn(
                        'absolute h-8 w-8 rounded-full opacity-35',
                        style?.dot ?? 'bg-primary',
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/90 text-[10px] font-bold text-white shadow-lg',
                        style?.dot ?? 'bg-primary',
                        selected && 'ring-2 ring-offset-2 ring-offset-background',
                        selected && style?.ring,
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
                  <div className="text-sm font-bold text-foreground">{activeNode.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {activeNode.zone}
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                  <Badge
                    variant={activeNode.status === 'online' ? 'default' : 'destructive'}
                    className="gap-1 text-[10px] capitalize"
                  >
                    {activeNode.status === 'online' ? (
                      <Wifi className="h-2.5 w-2.5" />
                    ) : (
                      <WifiOff className="h-2.5 w-2.5" />
                    )}
                    {activeNode.status}
                  </Badge>
                </div>

                <div className="space-y-2.5 border-t border-border/50 pt-3">
                  {activeNode.ip && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        IP Address
                      </span>
                      <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                        {activeNode.ip}
                      </code>
                    </div>
                  )}
                  {activeNode.deviceModel && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Server className="h-3 w-3" />
                        Hardware
                      </span>
                      <span className="text-xs font-medium">{activeNode.deviceModel}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Coordinates</span>
                    <span className="font-mono text-xs">
                      {activeNode.lat}, {activeNode.lng}
                    </span>
                  </div>
                  {activeNode.connectedCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Connected</span>
                      <span className="text-xs font-bold text-foreground">
                        {activeNode.connectedCount} users
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => setActiveNode(null)}
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="space-y-3 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">No node selected</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    Click any node on the map to inspect telemetry, IP assignment, and fiber
                    hierarchy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
