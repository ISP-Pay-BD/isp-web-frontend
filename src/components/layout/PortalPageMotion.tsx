'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

/**
 * Re-triggers a short page enter animation on every portal route change.
 * CSS-only (no Framer on portals). Respects prefers-reduced-motion via globals.css.
 * The Suspense boundary lets screens read the URL (`useSearchParams`: table filters, deep links) without
 * forcing the whole route to client-render.
 */
export function PortalPageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="ui-page-enter min-w-0">
      <Suspense fallback={<PageSkeleton variant="table" rows={6} />}>{children}</Suspense>
    </div>
  );
}
