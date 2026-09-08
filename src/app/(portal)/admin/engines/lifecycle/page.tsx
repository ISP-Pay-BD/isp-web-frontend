import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Lifecycle', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="lifecycle" portal="admin" />;
}
