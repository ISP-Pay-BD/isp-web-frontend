'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export function MaintenancePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => mockFetch('platform.settings'),
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => mockFetch('platform.maintenance', enabled),
    onSuccess: (_, enabled) => {
      toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <PageSkeleton rows={3} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load maintenance status"
        description="Could not retrieve platform settings."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Maintenance Mode"
        subtitle="Temporarily disable all tenant portals for system upgrades"
      />

      <Card className={`border-border/60 ${data.maintenanceMode ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${data.maintenanceMode ? 'bg-amber-500/20' : 'bg-muted'}`}>
                {data.maintenanceMode ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                ) : (
                  <Wrench className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {data.maintenanceMode ? 'Maintenance Mode Active' : 'All Systems Operational'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  {data.maintenanceMode
                    ? 'All tenant portals are showing a maintenance page. Super-admin access remains available.'
                    : 'Tenant portals are live. Enable maintenance mode before database migrations or major deployments.'}
                </p>
              </div>
            </div>
            <Switch
              checked={data.maintenanceMode}
              onCheckedChange={(v) => toggleMutation.mutate(v)}
              disabled={toggleMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
