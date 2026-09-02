import { TenantFormPage } from '@/features/platform/tenants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Tenant Portal | ISP Pay BD Platform',
};

export default function Page() {
  return <TenantFormPage />;
}
