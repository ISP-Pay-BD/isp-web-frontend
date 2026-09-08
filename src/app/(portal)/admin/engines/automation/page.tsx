import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Automation', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="automation" portal="admin" />;
}
