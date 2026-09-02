import type { Metadata } from 'next';
import { InventoryStockPage } from '@/features/admin/inventory';

export const metadata: Metadata = {
  title: 'Stock Levels',
  description: 'On-hand quantity by location.',
};

export default function Page() {
  return <InventoryStockPage />;
}
