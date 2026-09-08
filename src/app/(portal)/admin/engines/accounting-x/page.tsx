import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Accounting X', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="accounting-x" portal="admin" />;
}
