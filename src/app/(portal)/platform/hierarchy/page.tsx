import type { Metadata } from 'next';
import { PlatformHierarchyPage } from '@/features/platform/hierarchy';

export const metadata: Metadata = {
  title: 'Hierarchy | ISP Pay BD Platform',
  description: 'Super Admin → Admin → Reseller → Customer organization graph',
};

export default function Page() {
  return <PlatformHierarchyPage />;
}
