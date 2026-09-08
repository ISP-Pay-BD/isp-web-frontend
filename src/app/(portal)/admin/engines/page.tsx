import { EnginesIndexPage } from '@/features/admin/engines';

export const metadata = { title: 'ISP Engines', description: 'Automation and ops engines' };

export default function Page() {
  return <EnginesIndexPage portal="admin" />;
}
