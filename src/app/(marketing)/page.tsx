import type { Metadata } from 'next';
import { LandingPage } from '@/features/marketing/landing';

export const metadata: Metadata = {
  title: "ISP Pay BD — Bangladesh's Leading ISP Billing & MikroTik Sync Platform",
  description:
    'Auto-reconcile every bKash & Nagad payment in seconds, sync MikroTik PPPoE & hotspot in real time, manage OLT fiber ONUs, and run your entire ISP operations.',
};

export default function HomePage() {
  return <LandingPage />;
}
