import type { Metadata } from 'next';
import { ForbiddenPage } from '@/features/shared/permission';

export const metadata: Metadata = {
  title: 'Access denied',
};

export default function ForbiddenRoutePage() {
  return <ForbiddenPage />;
}
