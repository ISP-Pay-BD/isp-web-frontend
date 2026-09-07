'use client';

import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEmployeeFieldOps } from '@/features/employee/shared/hooks/use-employee-field';
import { cn } from '@/lib/utils';

export function EmployeeJobsPage() {
  const { data, isLoading, isError, refetch } = useEmployeeFieldOps();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load jobs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const jobs = data.jobs;
  if (jobs.length === 0) {
    return <EmptyState title="No assigned jobs" description="New install and repair tickets will show here." />;
  }

  const openCount = jobs.filter((j) => j.status !== 'done').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My work orders"
        subtitle="Assigned install and repair jobs"
        breadcrumb={[{ label: 'Employee' }, { label: 'Jobs' }]}
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {jobs.length} jobs · {openCount} open
      </p>
      <div className="space-y-3">
        {jobs.map((j) => (
          <Card key={j.id} className="border-border/60 shadow-sm ring-1 ring-foreground/5">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div>
                <CardTitle className="text-base">{j.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {j.customerName} · {j.area}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="capitalize">
                  {j.status.replace('_', ' ')}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(j.priority === 'high' && 'bg-amber-500/15 text-amber-800 dark:text-amber-300')}
                >
                  {j.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Due {j.dueLabel}</span>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Updated ${j.id} (mock)`)}>
                Update
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
