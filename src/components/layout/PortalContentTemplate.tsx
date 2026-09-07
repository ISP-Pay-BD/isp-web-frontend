import type { ReactNode } from 'react';

/** Next.js template remounts on nav; no enter animation (portals stay CSS-only). */
export default function PortalContentTemplate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
