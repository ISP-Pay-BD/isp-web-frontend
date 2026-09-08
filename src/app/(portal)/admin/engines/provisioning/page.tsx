import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Provisioning', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="provisioning" portal="admin" />;
}
