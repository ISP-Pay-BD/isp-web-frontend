import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Installation', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="installation" portal="admin" />;
}
