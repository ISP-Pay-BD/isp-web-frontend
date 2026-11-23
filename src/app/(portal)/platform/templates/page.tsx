import { TemplatesPage } from '@/features/platform/content-cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Templates | ISP Pay BD Platform',
};

export default function Page() {
  return <TemplatesPage />;
}
