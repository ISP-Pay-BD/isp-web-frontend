'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export type { GeoMapMarker, GeoMapLine } from './GeoMapImpl';

/**
 * leaflet is loaded only when a map actually renders so pages that import
 * this (or the shared barrel) don't ship it in their initial bundle.
 */
export const GeoMap = dynamic(() => import('./GeoMapImpl').then((m) => m.GeoMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});
