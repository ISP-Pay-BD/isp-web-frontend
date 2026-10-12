'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Router, Wifi, RefreshCw, Globe, Zap, Smartphone, Activity, Power, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

const TOOL_TITLES: Record<RouterTool, string> = {
  'reset-session': 'Reset connection',
  'flush-dns': 'Flush DNS',
  reboot: 'Restart router',
};

export function CustomerRouterPage() {
  const { data: targets, isLoading, isError, error, refetch } = useRouterTargets();
  const action = useRouterAction();
  const ping = usePingConnection();
  const [runningTool, setRunningTool] = useState<RouterTool | null>(null);
  const [lastResult, setLastResult] = useState<{ title: string; result: RouterActionResult } | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="Router Tools" subtitle="Loading your router...">
        <CustomerLoadingSkeleton variant="router" />
      </CustomerPageShell>
    );
  }

  if (isError || !targets) {
    return (
      <CustomerPageShell title="Router Tools" subtitle="Self-Service Gateway Diagnostics">
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const primary = targets[0];

  const runTool = (tool: RouterTool) => {
    setRunningTool(tool);
    action.mutate(
      { tool, targetId: tool === 'reboot' ? primary?.id || undefined : undefined },
      {
        onSuccess: (result) => setLastResult({ title: TOOL_TITLES[tool], result }),
        onSettled: () => setRunningTool(null),
      },
    );
  };

  const toolCard = (
    tool: RouterTool,
    icon: ReactNode,
    title: string,
    description: string,
    cta: string,
    busy: string,
  ) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="p-4 pb-2">
        {icon}
        <CardTitle className="text-sm font-bold mt-2">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Button
          size="sm"
          variant="outline"
          disabled={action.isPending}
          onClick={() => runTool(tool)}
          className="w-full text-xs font-semibold"
        >
          {runningTool === tool ? busy : cta}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <CustomerPageShell
      title="Router Diagnostics & Tools"
      subtitle="Reset your connection, restart your router, and run a line check."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Router' },
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/customer/router/wifi">
            <Button variant="outline" size="sm" className="gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              WiFi Settings
            </Button>
          </Link>
          <Link href="/customer/router/devices">
            <Button size="sm" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Connection & Devices
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {targets.length === 0 ? (
          <CustomerEmptyState
            icon={<Router className="text-muted-foreground h-5 w-5" />}
            title="No router linked"
            description="Your provider has not linked a router to your account yet."
          />
        ) : (
          targets.map((target, idx) => (
            <div key={target.id || idx} className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3.5 text-primary">
                    <Router className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold">{target.label || 'My router'}</h2>
                      <Badge variant="outline" className="text-xs">
                        {CAPABILITY_LABELS[target.capabilityType] ?? target.capabilityType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Restart: {target.actions.reboot === 'auto' ? 'automatic' : 'guided steps'} · WiFi change:{' '}
                      {target.actions.changeWifi === 'auto' ? 'automatic' : 'guided steps'} · Devices:{' '}
                      {target.actions.listDevices === 'auto' ? 'automatic' : 'guided steps'}
                    </p>
                  </div>
                </div>

                {target.webAdminUrl && (
                  <a
                    href={target.webAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
                  >
                    Router admin page <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Fix Actions
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolCard(
              'reset-session',
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary w-fit">
                <RefreshCw className="h-5 w-5" />
              </div>,
              'Reset PPPoE Session',
              'Drops and re-establishes your session on the provider network.',
              'Execute Reset',
              'Resetting...',
            )}
            {toolCard(
              'flush-dns',
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 w-fit">
                <Globe className="h-5 w-5" />
              </div>,
              'Flush DNS',
              'Clears cached DNS lookups for your connection.',
              'Flush DNS Cache',
              'Flushing...',
            )}
            {toolCard(
              'reboot',
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 w-fit">
                <Power className="h-5 w-5" />
              </div>,
              'Restart Router',
              'Restarts your router remotely when supported, otherwise shows the steps.',
              'Restart',
              'Restarting...',
            )}

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 w-fit">
                  <Activity className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-bold mt-2">Line Health Check</CardTitle>
                <CardDescription className="text-xs">Pings your connection from the provider router.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={ping.isPending}
                  onClick={() => ping.mutate()}
                  className="w-full text-xs font-semibold"
                >
                  {ping.isPending ? 'Testing...' : 'Run Check'}
                </Button>
                {ping.data && (
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div>
                      Latency: <span className="font-mono text-foreground">{ping.data.averageLatency || '—'}</span>
                    </div>
                    <div>
                      Packets: {ping.data.received}/{ping.data.sent}
                      {ping.data.loss ? ` · loss ${ping.data.loss}` : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {lastResult && <RouterActionResultPanel title={lastResult.title} result={lastResult.result} />}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>WiFi Network</span>
                <Wifi className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs">Change your wireless network name and password</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer/router/wifi" className="block">
                <Button className="w-full font-bold text-xs">Change WiFi Name / Password</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Connection & Devices</span>
                <Smartphone className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs">Session status and devices on your network</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer/router/devices" className="block">
                <Button variant="outline" className="w-full text-xs">
                  View Connection & Devices
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}
