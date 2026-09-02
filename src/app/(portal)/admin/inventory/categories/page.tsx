import type { Metadata } from 'next';
import { InventoryCategoriesPage } from '@/features/admin/inventory';

export const metadata: Metadata = {
  title: 'Inventory Categories',
  description: 'Item classification groups.',
};

export default function Page() {
  return <InventoryCategoriesPage />;
}
