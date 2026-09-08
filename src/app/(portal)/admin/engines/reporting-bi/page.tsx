import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Reporting Bi', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="reporting-bi" portal="admin" />;
}
