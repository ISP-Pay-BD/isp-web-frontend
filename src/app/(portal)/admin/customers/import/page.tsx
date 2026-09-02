import type { Metadata } from 'next';
import { ImportCustomersPage } from '@/features/admin/customers';

export const metadata: Metadata = {
  title: 'Import Customers | Admin',
  description: 'Upload spreadsheet to batch create subscriber accounts',
};

export default function ImportCustomersRoute() {
  return <ImportCustomersPage />;
}
