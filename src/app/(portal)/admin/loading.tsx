import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export default function AdminLoading() {
  return <PageSkeleton variant="table" rows={6} />;
}
