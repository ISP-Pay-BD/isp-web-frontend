import { EnginesIndexPage } from '@/features/admin/engines';

export const metadata = { title: 'Platform Engines', description: 'SaaS engines' };

export default function Page() {
  return <EnginesIndexPage portal="platform" />;
}
