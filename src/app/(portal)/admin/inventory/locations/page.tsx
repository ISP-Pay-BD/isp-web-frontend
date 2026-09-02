import type { Metadata } from 'next';
import { InventoryLocationsPage } from '@/features/admin/inventory';

export const metadata: Metadata = {
  title: 'Store Locations',
  description: 'Warehouses and POP stores.',
};

export default function Page() {
  return <InventoryLocationsPage />;
}
