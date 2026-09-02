import { UserAccessPage } from '@/features/platform/user-access';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Access | ISP Pay BD Platform',
};

export default function Page() {
  return <UserAccessPage />;
}
