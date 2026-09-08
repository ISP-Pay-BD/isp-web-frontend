'use client';

import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployeeFieldOps } from '@/features/employee/shared/hooks/use-employee-field';

export function EmployeeAttendancePage() {
  const { data, isLoading, isError, refetch } = useEmployeeFieldOps();

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load attendance" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const punches = data.punches;
  if (punches.length === 0) {
    return (
      <EmptyState
        title="No punches yet"
        description="Clock in with GPS when you start your field shift."
        actionLabel="Clock in"
        onAction={() => toast.success('Clocked in at Banani (mock GPS)')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS attendance"
        subtitle="Clock in/out with location for field staff"
        breadcrumb={[{ label: 'Employee' }, { label: 'Attendance' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Clocked in at Banani (mock GPS)')}>
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            Clock in
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">{punches.length} punches today / recent</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {punches.map((p) => (
          <Card key={p.id} className="border-border/60 shadow-sm ring-1 ring-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="font-mono text-sm">{p.at}</span>
                <Badge variant="outline" className="uppercase">
                  {p.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">{p.area}</div>
              <div className="font-mono">
                {p.lat}, {p.lng}
              </div>
              <div>±{p.accuracyM}m accuracy</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
