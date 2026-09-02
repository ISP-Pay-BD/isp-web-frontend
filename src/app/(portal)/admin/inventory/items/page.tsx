import type { Metadata } from 'next';
import { InventoryItemsPage } from '@/features/admin/inventory';

export const metadata: Metadata = {
  title: 'Inventory Items',
  description: 'SKU catalog with pricing.',
};

export default function Page() {
  return <InventoryItemsPage />;
}
