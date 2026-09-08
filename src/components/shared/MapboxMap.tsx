'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { LngLatBounds } from 'mapbox-gl';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

export type MapboxMarker = {
  id: string;
  latitude: number;
  longitude: number;
  color?: string;
  label?: string;
};

type MapboxMapProps = {
  markers: MapboxMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  height?: string | number;
  initialZoom?: number;
  showNavigation?: boolean;
  fitPadding?: number;
  emptyMessage?: string;
  renderMarker?: (marker: MapboxMarker, selected: boolean) => ReactNode;
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DHAKA = { longitude: 90.4125, latitude: 23.8103 };

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function MapFallback({
  className,
  height,
  message,
}: {
  className?: string;
  height?: string | number;
  message: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground',
        className,
      )}
      style={{ height: height ?? 420, minHeight: 240 }}
    >
      <MapPin className="h-8 w-8 opacity-40" />
      <p className="max-w-sm px-4 text-center text-xs">{message}</p>
    </div>
  );
}

export function MapboxMap({
  markers,
  selectedId,
  onSelect,
  className,
  height = 480,
  initialZoom = 11,
  showNavigation = true,
  fitPadding = 56,
  emptyMessage = 'No map points to display.',
  renderMarker,
}: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const isClient = useIsClient();

  // Keep a bright streets basemap in both themes — Mapbox dark-v11 / night styles
  // crush Dhaka road & label contrast against the already-dark portal chrome.
  const mapStyle = 'mapbox://styles/mapbox/streets-v12';

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || validMarkers.length === 0) return;

    if (validMarkers.length === 1) {
      const only = validMarkers[0]!;
      map.flyTo({
        center: [only.longitude, only.latitude],
        zoom: Math.max(initialZoom, 13),
        duration: 500,
      });
      return;
    }

    const bounds = new LngLatBounds();
    for (const m of validMarkers) {
      bounds.extend([m.longitude, m.latitude]);
    }
    map.fitBounds(bounds, { padding: fitPadding, maxZoom: 14, duration: 600 });
  }, [validMarkers, fitPadding, initialZoom]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const selected = validMarkers.find((m) => m.id === selectedId);
    if (!selected) return;
    mapRef.current.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 450,
    });
  }, [selectedId, validMarkers]);

  if (!TOKEN) {
    return (
      <MapFallback
        className={className}
        height={height}
        message="Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to show the live map."
      />
    );
  }

  if (!isClient) {
    return (
      <MapFallback className={className} height={height} message="Loading map…" />
    );
  }

  if (validMarkers.length === 0) {
    return <MapFallback className={className} height={height} message={emptyMessage} />;
  }

  return (
    <div
      className={cn(
        'mapbox-host overflow-hidden rounded-xl border border-border/50 shadow-inner',
        className,
      )}
      style={{ height, minHeight: 240 }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={{
          ...DHAKA,
          zoom: initialZoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        reuseMaps
        attributionControl={false}
      >
        {showNavigation ? <NavigationControl position="top-right" showCompass={false} /> : null}
        {validMarkers.map((marker) => {
          const selected = selectedId === marker.id;
          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelect?.(marker.id);
              }}
              style={{ cursor: onSelect ? 'pointer' : 'default', zIndex: selected ? 2 : 1 }}
            >
              {renderMarker ? (
                renderMarker(marker, selected)
              ) : (
                <span
                  className={cn(
                    'block h-3.5 w-3.5 rounded-full border-2 border-white shadow-md transition-transform',
                    selected && 'scale-125 ring-2 ring-primary/50 ring-offset-1',
                  )}
                  style={{ backgroundColor: marker.color ?? '#f75803' }}
                  title={marker.label}
                />
              )}
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}

export function hasMapboxToken() {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
}
