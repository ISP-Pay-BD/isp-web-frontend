import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Billing Advanced', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="billing-advanced" portal="admin" />;
}
