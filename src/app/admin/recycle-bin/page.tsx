import { RecycleBinPage } from '@/features/admin/recycle-bin';

export const metadata = { title: 'Recycle Bin', description: 'Restore or delete soft-deleted records' };

export default function AdminRecycleBinRoute() {
  return <RecycleBinPage />;
}
