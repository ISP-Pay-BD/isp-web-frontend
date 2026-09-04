'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Router,
  Wifi,
  RefreshCw,
  Globe,
  Zap,
  Smartphone,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerRouter } from '../hooks/use-customer-router';
import { toast } from 'sonner';

export function CustomerRouterPage() {
  const { data, isLoading, isError, refetch, quickFixMutation } = useCustomerRouter();
  const [runningAction, setRunningAction] = useState<string | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="Router Tools" subtitle="Loading router telemetry...">
        <CustomerLoadingSkeleton variant="router" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Router Tools" subtitle="Self-Service Gateway Diagnostics">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { router, connectedDevices, ipAddress, macAddress, connectionStatus } = data;

  const handleRunTool = async (actionId: string, label: string) => {
    setRunningAction(actionId);
    try {
      const res = await quickFixMutation.mutateAsync(actionId);
      toast.success(res.message);
    } catch {
      toast.error(`Failed to execute ${label}.`);
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <CustomerPageShell
      title="Router Diagnostics & Tools"
      subtitle="Troubleshoot PPPoE line status, flush gateway DNS, and manage connected WiFi clients."
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
              Connected Devices ({connectedDevices.length})
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Router Status Hero */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary/10 p-3.5 text-primary">
                <Router className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{router.routerModel}</h2>
                  <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'} className="text-xs">
                    {connectionStatus.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  PPPoE User: {router.pppoeUsername} · Last Sync: {router.lastReconnect}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              disabled={quickFixMutation.isPending}
              onClick={() => handleRunTool('quick_fix', 'Quick Fix')}
              className="font-bold gap-2 self-start sm:self-auto"
            >
              <Activity className={`h-4 w-4 text-primary ${quickFixMutation.isPending ? 'animate-spin' : ''}`} />
              Run Full Diagnostics
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 text-xs">
            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Assigned IP</span>
              <div className="font-mono font-bold text-sm text-foreground">{ipAddress}</div>
              <span className="text-muted-foreground text-[11px]">Static CGNAT Allocation</span>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Physical MAC Binding</span>
              <div className="font-mono font-bold text-sm text-foreground">{macAddress}</div>
              <span className="text-muted-foreground text-[11px]">Secured against line clone</span>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Active WiFi SSID</span>
              <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5" />
                {router.wifiSsid}
              </div>
              <Link href="/customer/router/wifi" className="text-primary hover:underline text-[11px] font-semibold">
                Change password →
              </Link>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Client Devices</span>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                {connectedDevices.length} Connected
              </div>
              <Link href="/customer/router/devices" className="text-blue-600 hover:underline text-[11px] font-semibold">
                Inspect devices →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Fix Interactive Actions Grid matching PHP router tools */}
        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Interactive Quick Fix Actions
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary w-fit">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-bold mt-2">Reset PPPoE Session</CardTitle>
                <CardDescription className="text-xs">
                  Forces your router to re-authenticate with the MikroTik Bras router.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runningAction === 'reset_session'}
                  onClick={() => handleRunTool('reset_session', 'Reset Session')}
                  className="w-full text-xs font-semibold"
                >
                  {runningAction === 'reset_session' ? 'Resetting...' : 'Execute Reset'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 w-fit">
                  <Wifi className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-bold mt-2">Reconnect Fiber Line</CardTitle>
                <CardDescription className="text-xs">
                  Simulates optical link re-negotiation and resets routing state.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runningAction === 'reconnect'}
                  onClick={() => handleRunTool('reconnect', 'Reconnect Line')}
                  className="w-full text-xs font-semibold"
                >
                  {runningAction === 'reconnect' ? 'Reconnecting...' : 'Reconnect Line'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 w-fit">
                  <Globe className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-bold mt-2">Flush Gateway DNS</CardTitle>
                <CardDescription className="text-xs">
                  Clears stale domain cache and resolves website loading timeouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runningAction === 'dns_flush'}
                  onClick={() => handleRunTool('dns_flush', 'Flush DNS')}
                  className="w-full text-xs font-semibold"
                >
                  {runningAction === 'dns_flush' ? 'Flushing...' : 'Flush DNS Cache'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 w-fit">
                  <Zap className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-bold mt-2">Line Health Check</CardTitle>
                <CardDescription className="text-xs">
                  Runs ICMP ping and jitter test against Google and Cloudflare DNS.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runningAction === 'quick_fix'}
                  onClick={() => handleRunTool('quick_fix', 'Line Health Check')}
                  className="w-full text-xs font-semibold"
                >
                  {runningAction === 'quick_fix' ? 'Testing...' : 'Run Diagnostics'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* WiFi & Devices Quick Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>WiFi Network Configuration</span>
                <Wifi className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs">
                Quickly customize your wireless network name and security key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Name (SSID):</span>
                  <span className="font-bold">{router.wifiSsid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency Band:</span>
                  <span className="font-bold">Dual-Band 2.4GHz / 5GHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Protocol:</span>
                  <span className="font-bold">WPA2-Personal (AES)</span>
                </div>
              </div>

              <Link href="/customer/router/wifi" className="block">
                <Button className="w-full font-bold text-xs">
                  Change WiFi Password
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Active Wireless Clients</span>
                <Smartphone className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs">
                Currently connected smartphones, laptops, and smart devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectedDevices.slice(0, 3).map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                >
                  <div>
                    <div className="font-bold">{dev.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{dev.ip}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {dev.mac}
                  </Badge>
                </div>
              ))}

              <Link href="/customer/router/devices" className="block">
                <Button variant="outline" className="w-full text-xs">
                  View All {connectedDevices.length} Connected Devices
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}
