import type { Metadata } from 'next';
import { AreasPage } from '@/features/admin/areas';

export const metadata: Metadata = {
  title: 'Service Areas | Admin',
  description: 'Manage geographic coverage zones and sub-areas',
};

export default function AreasRoute() {
  return <AreasPage />;
}
