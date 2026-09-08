import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Ai Platform', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="ai-platform" portal="admin" />;
}
