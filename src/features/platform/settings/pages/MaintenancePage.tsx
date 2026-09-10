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

  if (isLoading) return <PageSkeleton variant="form" rows={3} />;
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
        subtitle="Temporarily disable all tenant portals for system upgrades and database migrations"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Settings', href: '/platform/settings' },
          { label: 'Maintenance' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className={`font-semibold tabular-nums ${data.maintenanceMode ? 'text-amber-500' : 'text-emerald-500'}`}>
            {data.maintenanceMode ? 'ACTIVE' : 'NORMAL'}
          </span>{' '}
          <span className="text-muted-foreground">platform status</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">18</span>{' '}
          <span className="text-muted-foreground">managed tenant instances</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">99.98%</span>{' '}
          <span className="text-muted-foreground">30-day SLA uptime</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">0</span>{' '}
          <span className="text-muted-foreground">active maintenance windows</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Switch Card */}
        <Card className={`md:col-span-8 border-border/60 ${data.maintenanceMode ? 'border-amber-500/50 bg-amber-500/5' : 'bg-card'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl ${data.maintenanceMode ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                  {data.maintenanceMode ? (
                    <AlertTriangle className="h-7 w-7" />
                  ) : (
                    <Wrench className="h-7 w-7" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {data.maintenanceMode ? 'Maintenance Mode is Active' : 'All Tenant Portals are Live'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                    {data.maintenanceMode
                      ? 'All tenant broadband subscriber portals and staff dashboards are currently showing the maintenance standby banner. Super-admin access remains online.'
                      : 'Tenant portals are running normally. Enable maintenance mode prior to running database schema migrations or core server updates.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={data.maintenanceMode}
                  onCheckedChange={(v) => toggleMutation.mutate(v)}
                  disabled={toggleMutation.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Bypass Card */}
        <Card className="md:col-span-4 border-border/60 bg-card">
          <CardContent className="p-6 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Maintenance IP Whitelist</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Super-admin IP ranges (<code>103.145.0.0/24</code>) are granted perpetual bypass to test tenant environments during maintenance.
            </p>
            <div className="pt-2 border-t text-[11px] text-muted-foreground flex justify-between">
              <span>Bypass status:</span>
              <span className="font-mono text-emerald-500 font-semibold">ENABLED</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
