import { TenantDetailPage } from '@/features/platform/tenants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant Details | ISP Pay BD Platform',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantDetailPage tenantId={id} />;
}
