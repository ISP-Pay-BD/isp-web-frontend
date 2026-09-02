import { TenantFormPage } from '@/features/platform/tenants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Tenant Portal | ISP Pay BD Platform',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantFormPage tenantId={id} />;
}
