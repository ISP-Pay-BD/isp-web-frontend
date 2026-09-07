import { AdminNewsPage } from '@/features/admin/news';

export const metadata = { title: 'News & Notices', description: 'Manage portal announcements' };

export default function AdminNewsRoute() {
  return <AdminNewsPage />;
}
