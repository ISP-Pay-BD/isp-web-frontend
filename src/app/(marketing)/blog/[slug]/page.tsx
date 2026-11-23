import type { Metadata } from 'next';
import { BlogDetailPage } from '@/features/marketing/blog';

export const metadata: Metadata = { title: 'Blog — ISP Pay BD', description: 'An article from the ISP Pay BD blog.' };

export default function BlogPostRoute() {
  return <BlogDetailPage />;
}
