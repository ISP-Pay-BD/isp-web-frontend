'use client';

import { useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  Users,
  Navigation,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Phone,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type CollectionPoint = IspOpsData['collectionPoints'][number];

export function CollectionsMapPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');

  const rows: CollectionPoint[] = useMemo(() => data?.collectionPoints ?? [], [data?.collectionPoints]);

  const uniqueAreas = useMemo(() => {
    const set = new Set(rows.map((r) => r.area));
    return Array.from(set);
  }, [rows]);

  const totalStops = useMemo(() => rows.reduce((s, r) => s + r.stops, 0), [rows]);
  const totalCollected = useMemo(() => rows.reduce((s, r) => s + r.collectedBdt, 0), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          r.collector.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          String(r.collectedBdt).includes(q);
        if (!matches) return false;
      }

      if (areaFilter !== 'all' && r.area !== areaFilter) {
        return false;
      }

      return true;
    });
  }, [rows, search, areaFilter]);

  const markers = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        latitude: r.lat,
        longitude: r.lng,
        color: selectedId === r.id ? '#f75803' : '#2E8BFF',
        label: `${r.collector} (${r.area}) — ৳${r.collectedBdt.toLocaleString()}`,
      })),
    [filtered, selectedId]
  );

  const selectedPoint = useMemo(
    () => rows.find((r) => r.id === selectedId) || null,
    [rows, selectedId]
  );

  const handleExportCsv = () => {
    const headers = ['Collector Agent', 'Assigned Area', 'Stops / Points', 'Collected BDT', 'Latitude', 'Longitude'];
    const dataRows = filtered.map((r) => [
      r.collector,
      r.area,
      r.stops,
      r.collectedBdt,
      r.lat,
      r.lng,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `field_collections_route_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Field collector GPS route data exported to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load collection map"
        description="Could not query field agent GPS telemetry."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <PageHeader
        title="Field Collections GPS Map"
        subtitle="Real-time collection agent routes, physical door-to-door cash collection stops, and spatial settlement density."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Reports' },
          { label: 'Collections Map' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Routes
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Field Agents
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rows.length}
            </span>
            <span className="text-xs text-muted-foreground">collectors</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Doorstep Stops
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {totalStops}
            </span>
            <span className="text-xs text-muted-foreground">stops logged</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Cash Collected
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={totalCollected} className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg / Agent
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay
              amount={rows.length ? Math.round(totalCollected / rows.length) : 0}
              className="text-2xl font-bold tracking-tight text-foreground"
            />
          </div>
        </Card>
      </div>

      {/* Mapbox Map Container */}
      <Card className="border-border/70 shadow-md bg-card overflow-hidden ring-1 ring-border/50">
        <div className="p-3.5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                GPS Route Geometry
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Click any agent marker to view route details or highlight their cluster.
              </p>
            </div>
          </div>

          {selectedPoint && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-semibold animate-in fade-in duration-150">
              <span>Selected: {selectedPoint.collector} ({selectedPoint.area})</span>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground text-[10px] ml-1 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="p-2">
          <MapboxMap
            markers={markers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height={440}
            className="rounded-lg overflow-hidden border border-border/60"
            renderMarker={(marker, selected) => (
              <div className="relative flex flex-col items-center cursor-pointer group">
                <span
                  className={cn(
                    'h-4 w-4 rounded-full border-2 border-white shadow-lg transition-transform duration-200',
                    selected ? 'scale-125 ring-4 ring-primary/40' : 'group-hover:scale-110'
                  )}
                  style={{ backgroundColor: marker.color }}
                />
                {selected ? (
                  <span className="mt-1.5 max-w-[180px] truncate rounded-md bg-popover px-2 py-1 text-[11px] font-bold text-popover-foreground shadow-md ring-1 ring-border">
                    {marker.label}
                  </span>
                ) : null}
              </div>
            )}
          />
        </div>
      </Card>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by collector name, area, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[140px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Areas</SelectItem>
                {uniqueAreas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Collector Agent</th>
                <th className="py-3.5 px-4">Coverage Area</th>
                <th className="py-3.5 px-4">Stops</th>
                <th className="py-3.5 px-4">Cash Handover</th>
                <th className="py-3.5 px-4">GPS Coordinates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No matching route points</p>
                      <p className="text-xs text-muted-foreground">
                        Try clearing search terms or selecting another coverage area.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isSelected = selectedId === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        'transition-colors duration-150',
                        isSelected ? 'bg-primary/[0.06]' : 'hover:bg-muted/30'
                      )}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(isSelected ? null : r.id)}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold border',
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-border/60'
                            )}
                          >
                            {r.collector.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{r.collector}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-foreground">{r.area}</td>

                      <td className="py-3.5 px-4">
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/60">
                          {r.stops} stops
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        <CurrencyDisplay amount={r.collectedBdt} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          className="h-7 text-xs"
                          onClick={() => setSelectedId(isSelected ? null : r.id)}
                        >
                          {isSelected ? 'Focusing' : 'Locate on Map'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
