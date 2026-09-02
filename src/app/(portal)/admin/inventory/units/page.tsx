import type { Metadata } from 'next';
import { InventoryUnitsPage } from '@/features/admin/inventory';

export const metadata: Metadata = {
  title: 'Inventory Units',
  description: 'Measurement units for stock items.',
};

export default function Page() {
  return <InventoryUnitsPage />;
}
