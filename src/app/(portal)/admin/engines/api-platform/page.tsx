import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Api Platform', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="api-platform" portal="admin" />;
}
