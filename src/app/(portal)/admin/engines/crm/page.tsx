import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Crm', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="crm" portal="admin" />;
}
