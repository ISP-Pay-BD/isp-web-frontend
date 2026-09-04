import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export default function EmployeeLoading() {
  return <PageSkeleton variant="table" rows={5} />;
}
