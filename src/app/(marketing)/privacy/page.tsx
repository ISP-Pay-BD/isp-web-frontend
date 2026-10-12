import type { Metadata } from 'next';
import { LegalPage } from '@/features/marketing/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy — ISP Pay BD',
  description: 'How ISP Pay BD collects, uses and protects your information.',
};

export default function PrivacyRoute() {
  return <LegalPage slug="privacy" />;
}
