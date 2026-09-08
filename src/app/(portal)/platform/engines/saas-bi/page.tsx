import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Saas Bi', description: 'Platform engine hub' };

export default function Page() {
  return <EngineHubPage groupId="saas-bi" portal="platform" />;
}
