'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Router, Wifi, RefreshCw, Globe, Zap, Smartphone, Activity, Power, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  CustomerEmptyState,
} from '@/features/customer/shared';
import {
  useRouterTargets,
  useRouterAction,
  usePingConnection,
  CAPABILITY_LABELS,
  type RouterTool,
} from '../hooks/use-customer-router';
import { RouterActionResultPanel } from '../components/RouterActionResultPanel';
import { useLocale } from '@/i18n/locale-context';
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

export function CustomerRouterPage() {
  const { t } = useLocale();
  const { data: targets, isLoading, isError, error, refetch } = useRouterTargets();
  const action = useRouterAction();
  const ping = usePingConnection();
  const [runningTool, setRunningTool] = useState<RouterTool | null>(null);
  const [confirmTool, setConfirmTool] = useState<RouterTool | null>(null);
  const [lastResult, setLastResult] = useState<{ title: string; result: RouterActionResult } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // On a phone the result panel can sit below the fold of the button that was tapped; bring it into view.
  useEffect(() => {
    if (lastResult) resultRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lastResult]);

  const title = t('customer.router.title', 'Router tools');
  const crumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.router.crumb', 'Router') },
  ];

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.router.loading', 'Loading your router…')} breadcrumbs={crumbs}>
        <CustomerLoadingSkeleton variant="router" />
      </CustomerPageShell>
    );
  }

  if (isError || !targets) {
    return (
      <CustomerPageShell title={title} breadcrumbs={crumbs}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const primary = targets[0];

  const toolTitles: Record<RouterTool, string> = {
    'reset-session': t('customer.router.reset.title', 'Reset connection'),
    'flush-dns': t('customer.router.dns.title', 'Flush DNS'),
    reboot: t('customer.router.reboot.title', 'Restart router'),
  };

  const runTool = (tool: RouterTool) => {
    setRunningTool(tool);
    action.mutate(
      { tool, targetId: tool === 'reboot' ? primary?.id || undefined : undefined },
      {
        onSuccess: (result) => setLastResult({ title: toolTitles[tool], result }),
        onSettled: () => setRunningTool(null),
      },
    );
  };

  const capabilityLabel = (type: string) => t(`customer.router.capability.${type}`, CAPABILITY_LABELS[type] ?? type);
  const modeLabel = (mode: 'auto' | 'manual') =>
    mode === 'auto' ? t('customer.router.modeAuto', 'automatic') : t('customer.router.modeGuided', 'guided steps');

  const toolCard = (
    tool: RouterTool,
    icon: ReactNode,
    cardTitle: string,
    description: string,
    cta: string,
    busy: string,
  ) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="p-4 pb-2">
        {icon}
        <CardTitle className="mt-2 text-base font-semibold">{cardTitle}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Button
          variant="outline"
          disabled={action.isPending}
          onClick={() => (tool === 'flush-dns' ? runTool(tool) : setConfirmTool(tool))}
          className="h-11 w-full gap-2 font-semibold"
        >
          {runningTool === tool ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {runningTool === tool ? busy : cta}
        </Button>
      </CardContent>
    </Card>
  );

  const iconBox = (icon: ReactNode) => <div className="bg-primary/10 text-primary w-fit rounded-xl p-2.5">{icon}</div>;

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.router.subtitle', 'Reset your connection, restart your router, and run a line check.')}
      breadcrumbs={crumbs}
      actions={
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button variant="outline" className="h-11 gap-2" render={<Link href="/customer/router/wifi" />}>
            <Wifi className="text-primary h-4 w-4" />
            {t('customer.router.wifiSettings', 'Wi-Fi settings')}
          </Button>
          <Button className="h-11 gap-2" render={<Link href="/customer/router/devices" />}>
            <Smartphone className="h-4 w-4" />
            {t('customer.router.devicesLink', 'Connection & devices')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {targets.length === 0 ? (
          <CustomerEmptyState
            icon={<Router className="text-muted-foreground h-5 w-5" />}
            title={t('customer.router.noRouterTitle', 'No router linked')}
            description={t('customer.router.noRouterDesc', 'Your provider has not linked a router to your account yet.')}
          />
        ) : (
          targets.map((target, idx) => (
            <div key={target.id || idx} className="bg-card rounded-2xl border p-4 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <div className="bg-primary/10 text-primary shrink-0 rounded-2xl p-3">
                    <Router className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold sm:text-xl">{target.label || t('customer.router.myRouter', 'My router')}</h2>
                      <Badge variant="outline" className="h-auto min-h-5 whitespace-normal text-left">
                        {capabilityLabel(target.capabilityType)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t('customer.router.modes', 'Restart: {restart} · Wi-Fi change: {wifi} · Devices: {devices}', {
                        restart: modeLabel(target.actions.reboot),
                        wifi: modeLabel(target.actions.changeWifi),
                        devices: modeLabel(target.actions.listDevices),
                      })}
                    </p>
                  </div>
                </div>

                {target.webAdminUrl && (
                  <a
                    href={target.webAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold hover:underline sm:self-auto"
                  >
                    {t('customer.router.adminPage', 'Router admin page')} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
            <Zap className="text-primary h-4 w-4" />
            {t('customer.router.quickFix', 'Quick fix actions')}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolCard(
              'reset-session',
              iconBox(<RefreshCw className="h-5 w-5" />),
              toolTitles['reset-session'],
              t('customer.router.reset.desc', 'Drops and re-establishes your PPPoE session on the provider network.'),
              t('customer.router.reset.cta', 'Reset now'),
              t('customer.router.reset.busy', 'Resetting…'),
            )}
            {toolCard(
              'flush-dns',
              iconBox(<Globe className="h-5 w-5" />),
              toolTitles['flush-dns'],
              t('customer.router.dns.desc', 'Clears cached DNS lookups for your connection.'),
              t('customer.router.dns.cta', 'Clear DNS cache'),
              t('customer.router.dns.busy', 'Clearing…'),
            )}
            {toolCard(
              'reboot',
              iconBox(<Power className="h-5 w-5" />),
              toolTitles.reboot,
              t('customer.router.reboot.desc', 'Restarts your router remotely when supported, otherwise shows the steps.'),
              t('customer.router.reboot.cta', 'Restart'),
              t('customer.router.reboot.busy', 'Restarting…'),
            )}

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                {iconBox(<Activity className="h-5 w-5" />)}
                <CardTitle className="mt-2 text-base font-semibold">{t('customer.router.ping.title', 'Line health check')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('customer.router.ping.desc', 'Pings your connection from the provider router.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-2">
                <Button variant="outline" disabled={ping.isPending} onClick={() => ping.mutate()} className="h-11 w-full gap-2 font-semibold">
                  {ping.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {ping.isPending ? t('customer.router.ping.busy', 'Testing…') : t('customer.router.ping.cta', 'Run check')}
                </Button>
                {ping.data && (
                  <div className="text-muted-foreground space-y-0.5 text-sm">
                    <div>
                      {t('customer.router.ping.latency', 'Latency')}:{' '}
                      <span className="text-foreground font-mono">{ping.data.averageLatency || '—'}</span>
                    </div>
                    <div>
                      {t('customer.router.ping.packets', 'Packets: {received}/{sent}', {
                        received: ping.data.received,
                        sent: ping.data.sent,
                      })}
                      {ping.data.loss ? ` · ${t('customer.router.ping.loss', 'loss {loss}', { loss: ping.data.loss })}` : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {lastResult && (
          <div ref={resultRef}>
            <RouterActionResultPanel title={lastResult.title} result={lastResult.result} />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold">
                <span>{t('customer.router.wifiCard.title', 'Wi-Fi network')}</span>
                <Wifi className="text-primary h-4 w-4" />
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.router.wifiCard.desc', 'Change your wireless network name and password')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="h-11 w-full font-semibold" render={<Link href="/customer/router/wifi" />}>
                {t('customer.router.wifiCard.cta', 'Change Wi-Fi name / password')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold">
                <span>{t('customer.router.devicesCard.title', 'Connection & devices')}</span>
                <Smartphone className="text-primary h-4 w-4" />
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.router.devicesCard.desc', 'Session status and devices on your network')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="h-11 w-full font-semibold" render={<Link href="/customer/router/devices" />}>
                {t('customer.router.devicesCard.cta', 'View connection & devices')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirmTool !== null}
        onOpenChange={(open) => !open && setConfirmTool(null)}
        title={confirmTool ? t('customer.router.confirm.title', 'Run “{tool}”?', { tool: toolTitles[confirmTool] }) : ''}
        description={t(
          'customer.router.confirm.desc',
          'Your internet will drop for a short while and then reconnect by itself. Anyone using your connection will be interrupted.',
        )}
        confirmLabel={t('customer.router.confirm.yes', 'Yes, continue')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onConfirm={() => {
          if (confirmTool) runTool(confirmTool);
          setConfirmTool(null);
        }}
      />
    </CustomerPageShell>
  );
}
