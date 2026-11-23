import { BlogsPage } from '@/features/platform/content-cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Posts | ISP Pay BD Platform',
};

export default function Page() {
  return <BlogsPage />;
}
