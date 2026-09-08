import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Reseller X', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="reseller-x" portal="admin" />;
}
