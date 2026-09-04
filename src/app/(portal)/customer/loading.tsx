import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export default function CustomerLoading() {
  return <PageSkeleton variant="table" rows={5} />;
}
