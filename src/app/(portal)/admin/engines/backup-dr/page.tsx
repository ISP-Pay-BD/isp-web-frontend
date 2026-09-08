import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Backup Dr', description: 'ISP engine hub' };

export default function Page() {
  return <EngineHubPage groupId="backup-dr" portal="admin" />;
}
