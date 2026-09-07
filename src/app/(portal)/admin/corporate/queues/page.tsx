import { CorporateQueuesPage } from '@/features/admin/corporate';

export const metadata = { title: 'Corporate Queues', description: 'Corporate MikroTik sync jobs' };

export default function AdminCorporateQueuesRoute() {
  return <CorporateQueuesPage />;
}
