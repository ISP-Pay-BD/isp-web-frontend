import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Security', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="security" portal="admin" />;
}
