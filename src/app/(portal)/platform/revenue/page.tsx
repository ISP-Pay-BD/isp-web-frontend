import { RevenuePage } from '@/features/platform/revenue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Revenue | ISP Pay BD Platform',
};

export default function Page() {
  return <RevenuePage />;
}
