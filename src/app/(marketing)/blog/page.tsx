import type { Metadata } from 'next';
import { BlogListPage } from '@/features/marketing/blog';

export const metadata: Metadata = {
  title: 'Blog & Insights — ISP Pay BD',
  description: 'Articles on ISP billing automation, MikroTik operations and reseller growth from the ISP Pay BD team.',
};

export default function BlogRoute() {
  return <BlogListPage />;
}
