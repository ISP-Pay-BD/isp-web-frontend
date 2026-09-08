import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Noc Advanced', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="noc-advanced" portal="admin" />;
}
