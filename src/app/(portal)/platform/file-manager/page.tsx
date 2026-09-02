import { FileManagerPage } from '@/features/platform/file-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'File Manager | ISP Pay BD Platform',
};

export default function Page() {
  return <FileManagerPage />;
}
