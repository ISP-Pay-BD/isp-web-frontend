import { ReviewsPage } from '@/features/platform/content-cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reviews & Testimonials | ISP Pay BD Platform',
};

export default function Page() {
  return <ReviewsPage />;
}
