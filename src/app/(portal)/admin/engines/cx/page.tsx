import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Cx', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="cx" portal="admin" />;
}
