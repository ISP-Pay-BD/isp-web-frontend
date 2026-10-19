'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

export function MaintenancePage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [pendingOn, setPendingOn] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => platformService.getSoftwareSettings(),
  });

  const stats = useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: () => platformService.getDashboard(),
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => platformService.updateSoftwareSettings({ maintenance_mode: enabled }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['platform', 'settings'], saved);
      toast.success(
        saved.maintenanceMode
          ? t('platform.settings.maintenance.toast.enabled', 'Maintenance mode enabled')
          : t('platform.settings.maintenance.toast.disabled', 'Maintenance mode disabled'),
      );
    },
  });

  if (isLoading) return <PageSkeleton variant="form" rows={3} />;
  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.settings.maintenance.loadFailed', 'Failed to load maintenance status')}
        description={error instanceof Error ? error.message : t('platform.settings.maintenance.loadFailedHint', 'Could not retrieve platform settings.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const on = data.maintenanceMode;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.settings.maintenance.title', 'Maintenance Mode')}
        subtitle={t('platform.settings.maintenance.subtitle', 'Temporarily take tenant portals and APIs offline for upgrades and database migrations')}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.settings', 'Settings'), href: '/platform/settings' },
          { label: t('platform.settings.maintenance.crumb', 'Maintenance') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className={`font-semibold tabular-nums ${on ? 'text-amber-500' : 'text-emerald-500'}`}>{on ? t('platform.settings.maintenance.statusActive', 'ACTIVE') : t('platform.settings.maintenance.statusNormal', 'NORMAL')}</span>{' '}
          <span className="text-muted-foreground">{t('platform.settings.maintenance.kpiStatus', 'platform status')}</span>
        </p>
        {stats.data ? (
          <>
            <p>
              <span className="font-semibold tabular-nums text-foreground">{stats.data.totalTenants}</span>{' '}
              <span className="text-muted-foreground">{t('platform.settings.maintenance.kpiTenants', 'ISP tenants affected')}</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-foreground">{formatCount(stats.data.totalActiveEndUsers)}</span>{' '}
              <span className="text-muted-foreground">{t('platform.settings.maintenance.kpiSubscribers', 'active subscribers')}</span>
            </p>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className={`md:col-span-8 border-border/60 ${on ? 'border-amber-500/50 bg-amber-500/5' : 'bg-card'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl ${on ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                  {on ? <AlertTriangle className="h-7 w-7" /> : <Wrench className="h-7 w-7" />}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {on
                      ? t('platform.settings.maintenance.activeTitle', 'Maintenance Mode is Active')
                      : t('platform.settings.maintenance.liveTitle', 'All Tenant Portals are Live')}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                    {on
                      ? t(
                          'platform.settings.maintenance.activeDesc',
                          'Tenant portals, customer apps and APIs answer HTTP 503 with a maintenance notice. Super-admin sessions, payment gateway callbacks and the public status page keep working.',
                        )
                      : t(
                          'platform.settings.maintenance.liveDesc',
                          'Enable maintenance mode before running database migrations or core server updates. Non-admin traffic receives HTTP 503 until you turn it off.',
                        )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={on}
                  onCheckedChange={(v) => (v ? setPendingOn(true) : toggleMutation.mutate(false))}
                  disabled={toggleMutation.isPending}
                  aria-label={t('platform.settings.maintenance.switchLabel', 'Maintenance mode')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-border/60 bg-card">
          <CardContent className="p-6 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">{t('platform.settings.maintenance.bypassTitle', 'Bypass during maintenance')}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'platform.settings.maintenance.bypassDesc',
                'Signed-in platform super admins always pass. IP addresses in the server’s MAINTENANCE_ALLOW_IPS setting also pass.',
              )}
            </p>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {data.maintenanceAllowIps.length === 0 ? (
                <span>{t('platform.settings.maintenance.noAllowIps', 'No allow-listed IP addresses configured.')}</span>
              ) : (
                <ul className="space-y-1 font-mono">
                  {data.maintenanceAllowIps.map((ip) => (
                    <li key={ip}>{ip}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingOn}
        onOpenChange={setPendingOn}
        title={t('platform.settings.maintenance.confirmTitle', 'Enable maintenance mode?')}
        description={t(
          'platform.settings.maintenance.confirmDesc',
          'Every tenant portal, customer app and API (except super-admin sessions, payment callbacks and the status page) starts answering HTTP 503 immediately.',
        )}
        confirmLabel={t('platform.settings.maintenance.confirmLabel', 'Enable maintenance')}
        destructive
        onConfirm={() => {
          setPendingOn(false);
          toggleMutation.mutate(true);
        }}
      />
    </div>
  );
}
