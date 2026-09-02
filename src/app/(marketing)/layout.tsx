import type { ReactNode } from 'react';
import { MarketingLayout } from '@/features/marketing/shared';

export default function MarketingRouteLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
