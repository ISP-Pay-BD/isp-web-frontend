import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Multi Tenant', description: 'Platform engine hub' };

export default function Page() {
  return <EngineHubPage groupId="multi-tenant" portal="platform" />;
}
