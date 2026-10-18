'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkNodes, useUpdateNodeLocation } from '../hooks/useNetwork';
import { MAP_LEVELS, type MapLevel, type MapNode } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MapPin, MapPinOff, Layers, RadioTower, GitBranch, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { toast } from 'sonner';

// leaflet is browser-only (touches window/document): load the shared map on the client only.
const GeoMap = dynamic(() => import('@/components/shared/GeoMap').then((m) => m.GeoMap), {
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
  const t = useTranslations();
  const { data, isLoading, isError, refetch } = useNetworkNodes();
  const [selectedLevel, setSelectedLevel] = useState<'all' | MapLevel>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const updateLocation = useUpdateNodeLocation();

  const nodes = useMemo(() => data?.nodes ?? [], [data]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const activeNode = activeId ? (byId.get(activeId) ?? null) : null;

  // Reset the coordinate inputs whenever the selected node changes, so a
  // previous node's half-typed values don't leak into the next one.
  useEffect(() => {
    setLatInput(activeNode && isPlaced(activeNode) ? String(activeNode.latitude) : '');
    setLngInput(activeNode && isPlaced(activeNode) ? String(activeNode.longitude) : '');
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveLocation = () => {
    if (!activeNode) return;
    const lat = Number(latInput);
    const lng = Number(lngInput);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast.error(t('admin.network.map.invalidCoords', 'Enter a valid latitude (-90 to 90) and longitude (-180 to 180).'));
      return;
    }
    updateLocation.mutate(
      { id: activeNode.id, latitude: lat, longitude: lng },
      {
        onSuccess: () => toast.success(t('admin.network.map.locationSaved', 'Location saved for {name}.', { name: activeNode.label })),
        onError: () => toast.error(t('admin.network.map.locationSaveFailed', 'Could not save the location.')),
      },
    );
  };
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

  // Parent→child wiring edges — the "network" part of Network Mapping: the
  // old PHP page drew these as coloured polylines under the pins (matching
  // the OLT→PON→Splitter→ONU tree onto the geography, not just scattered
  // dots). Only drawn between two markers that are both currently visible
  // (placed + passing the level filter), so a line never points at a pin
  // that isn't on screen.
  const placedById = useMemo(() => new Map(placed.map((n) => [n.id, n])), [placed]);
  const lines = useMemo(
    () =>
      placed
        .filter((n) => n.parentId && placedById.has(n.parentId))
        .map((n) => {
          const parent = placedById.get(n.parentId as string)!;
          return {
            id: `${parent.id}-${n.id}`,
            from: [parent.latitude as number, parent.longitude as number] as [number, number],
            to: [n.latitude as number, n.longitude as number] as [number, number],
            color: levelColors[n.level].hex,
          };
        }),
    [placed, placedById],
  );

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={5} />;
  }
  if (isError || !data) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('admin.network.map.loadFailed', 'Failed to load network map')}
          description={t('admin.network.map.loadFailedDesc', 'Could not fetch network map nodes.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title={t('admin.network.map.title', 'Network Geographic Mapping')}
        subtitle={t('admin.network.map.subtitle', 'Geographic distribution of your network nodes and their parent hierarchy')}
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Network' },
          { label: t('admin.network.map.crumb', 'Mapping') },
        ]}
      />

      {nodes.length === 0 ? (
        <EmptyState
          title={t('admin.network.map.empty', 'No network nodes yet')}
          description={t('admin.network.map.emptyDesc', 'Nodes added to your network map (with their coordinates) appear here.')}
        />
      ) : (
      <Card className="overflow-hidden border-border/60 shadow-sm ring-1 ring-border/60">
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-muted/20 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <RadioTower className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">{t('admin.network.map.cardTitle', 'Network Topology Map')}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('admin.network.map.placed', '{placed} of {total} nodes placed on the map', { placed: formatCount(placed.length), total: formatCount(filtered.length) })}
                {data.truncated
                  ? ` · ${t('admin.network.map.truncated', 'first {shown} of {total} nodes loaded', { shown: formatCount(nodes.length), total: formatCount(data.total) })}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" aria-label={t('admin.network.map.levels', 'Marker hierarchy levels')}>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition duration-200',
                selectedLevel === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
              )}
            >
              {t('admin.network.map.allNodes', 'All Nodes ({n})', { n: formatCount(nodes.length) })}
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
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition duration-200',
                    isSelected
                      ? `ring-2 ${style.ring} border-current bg-card ${style.text}`
                      : 'border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                  <span>{lvl}</span>
                  <span className="text-xs opacity-60">({formatCount(count)})</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="relative flex min-h-[560px] flex-col overflow-hidden bg-background p-0 md:flex-row">
          <div className="relative min-h-[480px] flex-1 bg-muted/40 p-4 md:p-5">
            <GeoMap
              markers={markers}
              lines={lines}
              selectedId={activeId}
              onSelect={(id) => setActiveId(id)}
              height="100%"
              className="absolute inset-4 md:inset-5 ring-1 ring-border/40"
              emptyMessage={t('admin.network.map.noCoords', 'None of these nodes has coordinates yet — see the list beside the map.')}
              renderMarker={(marker, selected) => {
                const node = byId.get(marker.id);
                const style = levelColors[node?.level ?? 'L1'];
                return (
                  <div className="relative flex items-center justify-center">
                    <span className={cn('absolute h-8 w-8 rounded-full opacity-35', style.dot)} />
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/90 text-xs font-bold text-white shadow-lg',
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
              {t('admin.network.map.inspector', 'Node Inspector')}
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
                      {t('admin.network.map.under', 'Under {name}', { name: activeNode.parentLabel })}
                    </div>
                  )}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-xs',
                    levelColors[activeNode.level].text,
                    levelColors[activeNode.level].border,
                  )}
                >
                  {activeNode.level}
                </Badge>

                <div className="space-y-2.5 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('admin.network.map.coordinates', 'Coordinates')}</span>
                    {isPlaced(activeNode) ? (
                      <span className="font-mono text-xs">{`${activeNode.latitude}, ${activeNode.longitude}`}</span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('admin.network.map.notSet', 'Not set')}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('admin.network.map.children', 'Child nodes')}</span>
                    <span className="text-xs font-bold text-foreground">{formatCount(activeNode.childCount)}</span>
                  </div>
                </div>

                {/* Set/correct this node's coordinates — the write path the map used to be missing entirely. */}
                <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <Label className="text-xs font-semibold text-foreground">
                    {isPlaced(activeNode)
                      ? t('admin.network.map.editCoords', 'Update coordinates')
                      : t('admin.network.map.setCoords', 'Set coordinates')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      placeholder={t('admin.network.map.latPlaceholder', 'Latitude')}
                      inputMode="decimal"
                      className="h-8 font-mono text-xs"
                    />
                    <Input
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                      placeholder={t('admin.network.map.lngPlaceholder', 'Longitude')}
                      inputMode="decimal"
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleSaveLocation}
                    disabled={updateLocation.isPending || !latInput || !lngInput}
                  >
                    {updateLocation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                    {t('admin.network.map.saveLocation', 'Save location')}
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => setActiveId(null)}
                >
                  {t('admin.network.map.clearSelection', 'Clear Selection')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('admin.network.map.noneSelected', 'No node selected')}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {t('admin.network.map.selectHint', 'Click a node on the map or in the list below to inspect it.')}
                  </p>
                </div>
              </div>
            )}

            {unplaced.length > 0 && (
              <div className="space-y-2 border-t border-border/50 pt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <MapPinOff className="h-3.5 w-3.5" />
                  {t('admin.network.map.withoutCoords', 'Without coordinates ({n})', { n: formatCount(unplaced.length) })}
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
                        <span className="font-mono text-xs text-muted-foreground">{n.level}</span>
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
