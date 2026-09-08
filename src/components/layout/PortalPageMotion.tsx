'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Re-triggers a short page enter animation on every portal route change.
 * CSS-only (no Framer on portals). Respects prefers-reduced-motion via globals.css.
 */
export function PortalPageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="ui-page-enter min-w-0">
      {children}
    </div>
  );
}
