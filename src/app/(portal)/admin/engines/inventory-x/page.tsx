import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Inventory X', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="inventory-x" portal="admin" />;
}
