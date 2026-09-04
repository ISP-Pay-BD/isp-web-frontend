import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export default function PlatformLoading() {
  return <PageSkeleton variant="dashboard" rows={5} />;
}
