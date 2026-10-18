import { EngineHubPage } from '@/features/admin/engines';

export const metadata = { title: 'Engine', description: 'Platform engine hub' };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EngineHubPage groupId={slug} portal="platform" />;
}
