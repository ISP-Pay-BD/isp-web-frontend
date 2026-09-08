import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Network Events', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="network-events" portal="admin" />;
}
