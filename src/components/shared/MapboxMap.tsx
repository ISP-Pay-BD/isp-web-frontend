'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export type { MapboxMarker } from './MapboxMapImpl';

/**
 * mapbox-gl is ~1.8 MB; load it only when a map actually renders so pages
 * that import this (or the shared barrel) don't ship it in their bundle.
 */
export const MapboxMap = dynamic(() => import('./MapboxMapImpl').then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});

export function hasMapboxToken() {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
}
