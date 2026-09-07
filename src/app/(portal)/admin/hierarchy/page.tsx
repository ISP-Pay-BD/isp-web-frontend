import type { Metadata } from 'next';
import { AdminHierarchyPage } from '@/features/admin/hierarchy';

export const metadata: Metadata = {
  title: 'Hierarchy | ISP Pay BD Admin',
  description: 'Admin → Reseller → Customer organization graph',
};

export default function Page() {
  return <AdminHierarchyPage />;
}
