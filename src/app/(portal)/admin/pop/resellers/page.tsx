import type { Metadata } from 'next';
import { PopResellersPage } from '@/features/admin/pop/resellers';

export const metadata: Metadata = {
  title: 'POP Resellers | Admin',
  description: 'Point-of-Presence reseller directory',
};

export default function PopResellersRoute() {
  return <PopResellersPage />;
}
