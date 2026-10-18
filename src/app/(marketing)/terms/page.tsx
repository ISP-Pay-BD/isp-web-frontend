import type { Metadata } from 'next';
import { LegalPage } from '@/features/marketing/legal';

export const metadata: Metadata = {
  title: 'Terms of Service — ISP Pay BD',
  description: 'The terms that apply when you use ISP Pay BD.',
};

export default function TermsRoute() {
  return <LegalPage slug="terms" />;
}
