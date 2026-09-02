import { ShowcasePage } from '@/features/platform/showcase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Showcase | ISP Pay BD Platform',
};

export default function Page() {
  return <ShowcasePage />;
}
