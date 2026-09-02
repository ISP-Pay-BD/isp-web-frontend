import { ProfilePage } from '@/features/admin/profile';

export const metadata = { title: 'Profile', description: 'Admin account profile and security' };

export default function AdminProfileRoute() {
  return <ProfilePage />;
}
