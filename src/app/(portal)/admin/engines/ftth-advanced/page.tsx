import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Ftth Advanced', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="ftth-advanced" portal="admin" />;
}
