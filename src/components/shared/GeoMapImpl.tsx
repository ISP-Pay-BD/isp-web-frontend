'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { type Map as LeafletMap, type Marker as LeafletMarker, type Polyline as LeafletPolyline } from 'leaflet';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

export type GeoMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  color?: string;
  label?: string;
};

/** A connecting line between two coordinates — e.g. a parent→child wiring edge drawn under the markers. */
export type GeoMapLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  color?: string;
};

type GeoMapProps = {
  markers: GeoMapMarker[];
  lines?: GeoMapLine[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  height?: string | number;
  initialZoom?: number;
  showNavigation?: boolean;
  fitPadding?: number;
  emptyMessage?: string;
  renderMarker?: (marker: GeoMapMarker, selected: boolean) => ReactNode;
};

const DHAKA: [number, number] = [23.8103, 90.4125];

// OpenStreetMap raster tiles — free, no API key or billing account required.
// Same tile source and attribution the legacy PHP frontend (app/Views/network/map.php) used.
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Default pin, used when the caller doesn't supply `renderMarker`. */
function DefaultMarkerContent({ color, selected }: { color?: string; selected: boolean }) {
  return (
    <span
      className={cn(
        'block h-3.5 w-3.5 rounded-full border-2 border-white shadow-md transition-transform',
        selected && 'scale-125 ring-2 ring-primary/50 ring-offset-1',
      )}
      style={{ backgroundColor: color ?? '#e85a1a' }}
    />
  );
}

/**
 * Builds a Leaflet divIcon from static markup. A Leaflet marker's icon isn't
 * a live React tree, so `renderMarker`'s output is baked to an HTML string
 * per rebuild — Tailwind's `group-hover:` etc still work since they're plain
 * CSS; clicks are wired on the L.Marker instance itself, not inside the
 * rendered markup. The wrapper's own translate(-50%,-100%) anchors
 * bottom-center at the coordinate regardless of the (possibly
 * label-widened) content size.
 */
function markerIcon(node: ReactNode) {
  const html = renderToStaticMarkup(
    <div style={{ transform: 'translate(-50%, -100%)' }}>{node}</div>,
  );
  return L.divIcon({ html, className: 'geo-map-marker', iconSize: [0, 0], iconAnchor: [0, 0] });
}

export function GeoMap({
  markers,
  lines = [],
  selectedId,
  onSelect,
  className,
  height = 480,
  initialZoom = 11,
  showNavigation = true,
  fitPadding = 56,
  emptyMessage = 'No map points to display.',
  renderMarker,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const linesRef = useRef<Map<string, LeafletPolyline>>(new Map());

  // Mirror the latest callback props in refs so the marker-rebuild effect
  // below can call them without listing them as dependencies — both are
  // passed as new inline functions on every parent render, and re-running
  // the effect (tearing down and recreating every marker) on every
  // unrelated parent render would churn the DOM for no reason. Assigned in
  // an effect, not during render, per the rules of React.
  const onSelectRef = useRef(onSelect);
  const renderMarkerRef = useRef(renderMarker);
  useEffect(() => {
    onSelectRef.current = onSelect;
    renderMarkerRef.current = renderMarker;
  });

  const validMarkers = useMemo(
    () =>
      markers.filter(
        (m) =>
          Number.isFinite(m.latitude) &&
          Number.isFinite(m.longitude) &&
          Math.abs(m.latitude) <= 90 &&
          Math.abs(m.longitude) <= 180,
      ),
    [markers],
  );
  const hasMarkers = validMarkers.length > 0;

  // Create/destroy the Leaflet map exactly once per mount. The base map is
  // always drawn, even with zero markers — like the legacy Map View, which
  // shows the Dhaka basemap and lets you pan before any node has GPS.
  // Raw L.map()/map.remove() here — not react-leaflet's <MapContainer> —
  // specifically to sidestep react-leaflet's still-open "Map container is
  // already initialized" crash under React 18/19 Strict Mode dev
  // double-invoke (react-leaflet#1133): owning init/teardown ourselves
  // means React's Strict Mode mount→unmount→remount just calls our cleanup
  // (map.remove()) before the second mount runs, so there's nothing left
  // to clash with.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const layers = layersRef.current;

    const map = L.map(el, { zoomControl: false, attributionControl: true }).setView(DHAKA, initialZoom);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    if (showNavigation) L.control.zoom({ position: 'topright' }).addTo(map);
    mapRef.current = map;

    const lineLayers = linesRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      layers.clear();
      lineLayers.clear();
    };
    // initialZoom is intentionally read once here (the map's starting view,
    // not a live prop to track); only an actual mount/unmount or toggling
    // the zoom control should recreate the whole map instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNavigation]);

  // Rebuild marker layers whenever the data or the selection changes —
  // selection is included so the selected marker's icon (ring/scale) updates.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of layersRef.current.values()) marker.remove();
    layersRef.current.clear();

    for (const m of validMarkers) {
      const selected = selectedId === m.id;
      const content = renderMarkerRef.current
        ? renderMarkerRef.current(m, selected)
        : <DefaultMarkerContent color={m.color} selected={selected} />;
      const marker = L.marker([m.latitude, m.longitude], {
        icon: markerIcon(content),
        title: m.label,
        zIndexOffset: selected ? 1000 : 0,
      }).addTo(map);
      if (onSelectRef.current) marker.on('click', () => onSelectRef.current?.(m.id));
      layersRef.current.set(m.id, marker);
    }
  }, [validMarkers, selectedId]);

  // Redraw connecting lines (e.g. a topology's parent→child wiring) whenever
  // the line set changes. Markers always render above these — Leaflet puts
  // markers on markerPane (z-index 600) and polylines on overlayPane
  // (z-index 400) regardless of creation order, so no ordering is needed
  // against the marker effect above.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const line of linesRef.current.values()) line.remove();
    linesRef.current.clear();

    for (const l of lines) {
      const polyline = L.polyline([l.from, l.to], {
        color: l.color ?? '#94a3b8',
        weight: 2.5,
        opacity: 0.75,
      }).addTo(map);
      linesRef.current.set(l.id, polyline);
    }
  }, [lines]);

  // Fit the viewport to the marker set — only when the set itself changes,
  // not on every selection click (that's handled separately below), so
  // picking a marker doesn't immediately zoom back out to show them all.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || validMarkers.length === 0) return;
    if (validMarkers.length === 1) {
      const only = validMarkers[0]!;
      map.flyTo([only.latitude, only.longitude], Math.max(initialZoom, 13), { duration: 0.5 });
      return;
    }
    const bounds = L.latLngBounds(validMarkers.map((m) => [m.latitude, m.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [fitPadding, fitPadding], maxZoom: 14, animate: true, duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validMarkers, fitPadding]);

  // Fly to whichever marker becomes selected.
  useEffect(() => {
    const map = mapRef.current;
    if (!selectedId || !map) return;
    const selected = validMarkers.find((m) => m.id === selectedId);
    if (!selected) return;
    map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 13), { duration: 0.45 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div
      className={cn('geo-map-host relative overflow-hidden rounded-xl border border-border/50 shadow-inner', className)}
      style={{ height, minHeight: 240 }}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {!hasMarkers && (
        // Above Leaflet's panes (≤ 700) but click-through, so the map stays pannable.
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[800] flex justify-center px-4">
          <p className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
