import { TenantsListPage } from '@/features/platform/tenants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant Portals | ISP Pay BD Platform',
};

export default function Page() {
  return <TenantsListPage />;
}
