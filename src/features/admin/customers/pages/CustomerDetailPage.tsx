'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import {
  Edit,
  Zap,
  Phone,
  MapPin,
  Wifi,
  WifiOff,
  Receipt,
  Activity,
  CreditCard,
  User,
  Shield,
  FileText,
  Radio,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  Signal,
  HardDrive,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Clock,
  Printer,
  Layers,
  Key,
  BadgeCheck,
} from 'lucide-react';
import { useCustomer, useCustomerActions, useCustomerSession } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/i18n/locale-context';
import { customerStatusLabel } from '../lib/labels';

const dash = (v: string | undefined | null) => (v ? v : '—');
const ymd = (v: string | null | undefined) => (v ? v.slice(0, 10) : '—');

export function CustomerDetailPage({ id }: { id: string }) {
  const t = useTranslations();
  const { data: customer, isLoading, isError, error, refetch } = useCustomer(id);
  const sessionQuery = useCustomerSession(id);
  const actions = useCustomerActions();

  const [showPppoePassword, setShowPppoePassword] = useState(false);

  const session = sessionQuery.data;
  const pppoe = customer?.pppoe;
  const onu = customer?.onu ?? null;
  const conn = customer?.connection;
  const bandwidthUsage = useMemo(() => customer?.usage ?? [], [customer?.usage]);
  const payments = customer?.payments ?? [];

  const expiryTs = customer?.expiryDate ? Date.parse(customer.expiryDate.replace(' ', 'T')) : NaN;
  const daysLeft = Number.isFinite(expiryTs) ? Math.ceil((expiryTs - Date.now()) / 86_400_000) : null;

  const daysLeftColor =
    daysLeft === null
      ? 'text-muted-foreground bg-muted/20 border-border/60'
      : daysLeft < 0
        ? 'text-red-400 bg-red-500/10 border-red-500/20'
        : daysLeft <= 5
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  const bwToday = useMemo(() => {
    const today = bandwidthUsage[bandwidthUsage.length - 1];
    return { download: today?.downloadMb ?? 0, upload: today?.uploadMb ?? 0 };
  }, [bandwidthUsage]);

  const totalBw = useMemo(
    () =>
      bandwidthUsage.reduce(
        (acc, d) => ({ download: acc.download + d.downloadMb, upload: acc.upload + d.uploadMb }),
        { download: 0, upload: 0 },
      ),
    [bandwidthUsage],
  );

  const formatBw = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`);

  if (isLoading) return <PageSkeleton variant="detail" rows={7} />;
  if (isError || !customer) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.detail.loadFailed', 'Could not load this customer')}
        description={errorMessage(error, t('admin.customers.detail.notFound', 'The customer was not found or the server did not answer.'))}
        actionLabel={t('admin.customers.detail.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const live = session?.available ? session : null;
  const routerOffline = session?.routerOnline === false;
  const framedIp = live?.address || customer.ipAddress || pppoe?.address;
  const callerMac = live?.callerId || pppoe?.callerId || pppoe?.lastCallerId || customer.macAddress;
  const connected = customer.connStatus === 'conn';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">{t('admin.customers.detail.breadcrumbDashboard', 'Dashboard')}</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <Link href="/admin/customers" className="hover:text-foreground transition-colors">{t('admin.customers.detail.breadcrumbCustomers', 'Customers')}</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-foreground font-medium">{customer.name}</span>
        <Badge variant="outline" className="text-xs font-mono border-border/60 ml-1">
          #{customer.id}
        </Badge>
      </div>

      {/* Main Profile Hero Banner */}
      <PageHero>
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card/95 via-card/70 to-card/40 p-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity & Status */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                  {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center ${
                    customer.online ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                  title={customer.online ? t('admin.customers.detail.subscriberOnline', 'Subscriber is Online') : t('admin.customers.detail.subscriberOffline', 'Subscriber is Offline')}
                >
                  {customer.online && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
                  <StatusBadge status={customer.status} label={customerStatusLabel(t, customer.status)} />
                  {customer.online ? (
                    <Badge variant="outline" tone="success" className="gap-1.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {t('admin.customers.status.online', 'Online')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border/60 gap-1.5 text-xs">
                      <WifiOff className="h-3 w-3" />
                      {t('admin.customers.status.offline', 'Offline')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs uppercase font-mono">
                    {customer.connectionType}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap pt-0.5">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <User className="h-3.5 w-3.5 text-primary" /> {dash(pppoe?.name || customer.username)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {dash(customer.phone)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {dash(customer.areaName)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Ribbon */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs shadow-md shadow-primary/25" render={<Link href={`/admin/customer-payments/new?customerId=${customer.id}`} />}>
                  <Zap className="h-3.5 w-3.5" /> {t('admin.customers.detail.rechargeLine', 'Recharge Line')}
                </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={actions.ping.isPending}
                onClick={() => actions.ping.mutate(customer.id)}
                className="gap-1.5 text-xs border-border/70 hover:border-primary/50 text-foreground"
              >
                <Activity className={`h-3.5 w-3.5 text-primary ${actions.ping.isPending ? 'animate-spin' : ''}`} />
                {actions.ping.isPending ? t('admin.customers.detail.pinging', 'Pinging...') : t('admin.customers.detail.checkPing', 'Check Ping')}
              </Button>

              <Can menu="customer" action="update">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/70 text-foreground" render={<Link href={`/admin/customers/${customer.id}/edit`} />}>
                    <Edit className="h-3.5 w-3.5" /> {t('admin.customers.detail.editProfile', 'Edit Profile')}
                  </Button>
              </Can>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/70 text-foreground">
                      <MoreVertical className="h-3.5 w-3.5" /> {t('admin.customers.detail.actions', 'Actions')}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border border-border/80">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    render={<Link href={`/admin/customers/${customer.id}/mac-bind`} />}
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" /> {t('admin.customers.detail.macBinding', 'MAC Binding')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    render={<Link href={`/admin/customers/${customer.id}/kyc`} />}
                  >
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {t('admin.customers.detail.kycDocs', 'KYC Documents')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    disabled={actions.kick.isPending}
                    onClick={() => actions.kick.mutate(customer.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-amber-400" /> {t('admin.customers.detail.kickSession', 'Kick Session')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    disabled={actions.syncPppoe.isPending}
                    onClick={() => actions.syncPppoe.mutate(customer.id)}
                  >
                    <Key className="h-3.5 w-3.5 text-amber-500" /> {t('admin.customers.detail.syncPppoeId', 'Sync PPPoE ID')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    render={<Link href={`/admin/customers/${customer.id}/audit`} />}
                  >
                    <FileText className="h-3.5 w-3.5" /> {t('admin.customers.detail.viewAudit', 'View Audit Logs')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </PageHero>

      <PageContent className="space-y-6">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Connection & Live Traffic */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.customers.detail.liveBandwidth', 'Live Bandwidth')}</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-xl font-bold font-mono text-foreground">
                {live?.rxMbps !== null && live?.rxMbps !== undefined ? `${live.rxMbps.toFixed(1)} Mbps` : '—'}
              </div>
              {live?.txMbps !== null && live?.txMbps !== undefined && (
                <span className="text-xs text-muted-foreground font-mono">↓ / {live.txMbps.toFixed(1)}M ↑</span>
              )}
            </div>
            <p className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {sessionQuery.isLoading
                ? t('admin.customers.detail.checkingRouter', 'Checking router…')
                : routerOffline
                  ? t('admin.customers.detail.routerOffline', 'Router offline / unreachable')
                  : live
                    ? live.uptime
                      ? t('admin.customers.detail.connectedUptime', 'Connected ({uptime} uptime)', { uptime: live.uptime })
                      : t('admin.customers.detail.connected', 'Connected')
                    : t('admin.customers.detail.noSession', 'No active session')}
            </p>
          </div>

          {/* 2. Package Tier */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.customers.detail.subscribedPackage', 'Subscribed Package')}</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-lg font-bold text-foreground truncate">
              {dash(customer.packageName)}
            </div>
            <p className="mt-1 text-xs font-mono text-primary font-semibold">
              {customer.packagePrice !== null ? <CurrencyDisplay amount={customer.packagePrice} /> : '—'}
              {customer.areaName ? ` · ${customer.areaName}` : ''}
            </p>
          </div>

          {/* 3. Validity & Expiry */}
          <div className={`rounded-xl border p-4 backdrop-blur-md relative overflow-hidden transition-colors ${daysLeftColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.customers.detail.lineValidity', 'Line Validity')}</span>
              <div className="p-2 rounded-lg bg-card/80 border border-border/60">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-xl font-bold font-mono">
              {daysLeft === null
                ? t('admin.customers.detail.noExpiry', 'No expiry set')
                : daysLeft < 0
                  ? t('admin.customers.detail.expiredAgo', 'Expired {n} days ago', { n: Math.abs(daysLeft) })
                  : t('admin.customers.detail.daysLeft', '{n} Days Left', { n: daysLeft })}
            </div>
            <p className="mt-1 text-xs font-mono opacity-90">
              {t('admin.customers.detail.dueDate', 'Due Date')}: {ymd(customer.expiryDate)}
            </p>
          </div>

          {/* 4. Optical RX Signal */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.customers.detail.opticalRx', 'Optical RX Signal (ONU)')}</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Signal className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-xl font-bold font-mono text-foreground flex items-center gap-2">
              <span>
                {customer.connectionType?.toLowerCase() === 'utp'
                  ? t('admin.customers.detail.naUtp', 'N/A (UTP)')
                  : (onu?.rx && onu.rx !== 'Not found' && onu.rx !== '--' ? onu.rx : '--')}
              </span>
              {onu?.status && onu.status !== 'Not found' && onu.status !== '--' && (
                <Badge variant="outline" className="text-xs border-border/60 capitalize">
                  {onu.status}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {customer.connectionType?.toLowerCase() === 'utp'
                  ? t('admin.customers.detail.directUtp', 'Direct UTP Connection')
                  : (onu?.oltName ? t('admin.customers.detail.oltName', 'OLT: {name}', { name: onu.oltName }) : t('admin.customers.detail.noOnu', 'No synchronized ONU'))}
              </p>
              <button
                type="button"
                disabled={actions.refreshOnu.isPending}
                onClick={() => actions.refreshOnu.mutate(customer.id)}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 shrink-0"
              >
                {actions.refreshOnu.isPending ? t('admin.customers.detail.refreshing', 'Refreshing…') : t('admin.customers.detail.refresh', 'Refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Unified 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-6">
            {/* 1. MikroTik PPPoE Interface Card */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary" />
                    {t('admin.customers.detail.pppoeAccount', 'MikroTik PPPoE Account')}
                  </CardTitle>
                  <Can menu="customer" action="update_conn">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{connected ? t('admin.customers.detail.enabled', 'Enabled') : t('admin.customers.detail.disabled', 'Disabled')}</span>
                      <Switch aria-label={connected ? t('admin.customers.detail.enabled', 'Enabled') : t('admin.customers.detail.disabled', 'Disabled')}
                        checked={connected}
                        disabled={actions.setConnStatus.isPending}
                        onCheckedChange={(on) => actions.setConnStatus.mutate({ id: customer.id, status: on ? 'conn' : 'disconn' })}
                      />
                    </div>
                  </Can>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.pppoeUsername', 'PPPoE Username')}</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {dash(pppoe?.name)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.pppoePassword', 'PPPoE Password')}</span>
                      {pppoe?.password && (
                        <button
                          type="button"
                          onClick={() => setShowPppoePassword(!showPppoePassword)}
                          aria-label={showPppoePassword ? t('admin.customers.detail.hidePassword', 'Hide password') : t('admin.customers.detail.showPassword', 'Show password')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showPppoePassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {pppoe?.password ? (showPppoePassword ? pppoe.password : '••••••••') : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.router', 'Router')}</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {dash(customer.routerName)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.bandwidthProfile', 'Bandwidth Profile')}</span>
                    <span className="font-mono font-semibold text-primary text-xs mt-0.5 block truncate">
                      {dash(pppoe?.profile)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.framedIp', 'Framed IP Address')}</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {dash(framedIp)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.callerMac', 'Caller MAC')}</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {dash(callerMac)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">{live ? t('admin.customers.detail.sessionUptime', 'Session Uptime: ') : t('admin.customers.detail.lastLoggedOut', 'Last logged out: ')}</span>
                    <strong className="text-emerald-400 font-mono">
                      {live ? dash(live.uptime) : dash(pppoe?.lastLoggedOut)}
                    </strong>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actions.kick.isPending}
                    onClick={() => actions.kick.mutate(customer.id)}
                    className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> {t('admin.customers.detail.kickSession', 'Kick Session')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 2. OLT / ONU Diagnostic Card (only with a synchronized ONU) */}
            {onu && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Signal className="h-4 w-4 text-primary" />
                      {t('admin.customers.detail.onuDiag', 'OLT / ONU Diagnostic')}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs capitalize border-border/60">
                      {dash(onu.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {(
                      [
                        ['oltName', t('admin.customers.detail.onuOltName', 'OLT Name'), onu.oltName],
                        ['onuId', t('admin.customers.detail.onuId', 'ONU ID'), onu.onuId],
                        ['rx', t('admin.customers.detail.onuRx', 'RX Optical Signal'), onu.rx],
                        ['mac', t('admin.customers.detail.onuMac', 'ONU MAC'), onu.mac],
                        ['reason', t('admin.customers.detail.onuReason', 'Reason'), onu.reason],
                        ['lastSeen', t('admin.customers.detail.onuLastSeen', 'Last Seen'), onu.lastSeen],
                      ] as const
                    ).map(([key, label, value]) => (
                      <div key={key} className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-muted-foreground block text-xs">{label}</span>
                        <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">{dash(value)}</span>
                      </div>
                    ))}
                    {onu.description && (
                      <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 col-span-2">
                        <span className="text-muted-foreground block text-xs">{t('admin.customers.detail.ponDescription', 'PON Description')}</span>
                        <span className="text-xs font-medium text-foreground mt-0.5 block">{onu.description}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Bandwidth Usage History */}
            {bandwidthUsage.length > 0 && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      {t('admin.customers.detail.bwHistory', 'Bandwidth Usage History')}
                    </CardTitle>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-xs">
                      {t('admin.customers.detail.bwTotalBadge', 'Total: {value}', { value: formatBw(totalBw.download + totalBw.upload) })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-xs uppercase text-muted-foreground font-semibold">{t('admin.customers.detail.latestDl', 'Latest DL')}</span>
                      <div className="text-sm font-bold font-mono text-foreground mt-0.5">{formatBw(bwToday.download)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-xs uppercase text-muted-foreground font-semibold">{t('admin.customers.detail.latestUl', 'Latest UL')}</span>
                      <div className="text-sm font-bold font-mono text-foreground mt-0.5">{formatBw(bwToday.upload)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-xs uppercase text-muted-foreground font-semibold">{t('admin.customers.detail.bwTotal', 'Total')}</span>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{formatBw(totalBw.download + totalBw.upload)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-xs uppercase text-muted-foreground font-semibold">{t('admin.customers.detail.peakDay', 'Peak Day')}</span>
                      <div className="text-sm font-bold font-mono text-primary mt-0.5">
                        {formatBw(Math.max(...bandwidthUsage.map((d) => d.downloadMb + d.uploadMb)))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40 max-h-56 overflow-y-auto">
                    {[...bandwidthUsage].reverse().map((bw) => (
                      <div key={bw.date} className="flex items-center justify-between p-2.5 text-xs hover:bg-muted/20 transition-colors">
                        <span className="font-mono text-foreground">{bw.date}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-mono text-emerald-400">
                            <ArrowDown className="h-3 w-3" /> {formatBw(bw.downloadMb)}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-primary">
                            <ArrowUp className="h-3 w-3" /> {formatBw(bw.uploadMb)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-6">
            {/* 1. Account & Master Information */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {t('admin.customers.detail.accountProfile', 'Subscriber Account & Profile')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.fullName', 'Full Name')}</span>
                    <div className="font-semibold text-sm text-foreground">{customer.name}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.mobilePhone', 'Mobile Phone')}</span>
                    <div className="font-semibold text-sm font-mono text-foreground">{dash(customer.phone)}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.email', 'Email Address')}</span>
                    <div className="font-semibold text-sm text-foreground truncate">{dash(customer.email)}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.serviceArea', 'Service Area')}</span>
                    <div className="font-semibold text-sm text-foreground">
                      {dash(customer.areaName)} {customer.subAreaName ? `(${customer.subAreaName})` : ''}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.joined', 'Joined Date')}</span>
                    <div className="font-semibold text-sm font-mono text-foreground">{ymd(customer.createdAt)}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.nid', 'National ID (NID)')}</span>
                    <div className="font-semibold text-sm font-mono text-foreground flex items-center gap-1.5">
                      {dash(customer.nidNumber)}
                      {customer.nidVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" aria-label={t('admin.customers.detail.nidVerified', 'NID verified')} />}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 sm:col-span-2 space-y-0.5">
                    <span className="text-muted-foreground text-xs">{t('admin.customers.detail.address', 'Installation Address')}</span>
                    <div className="font-semibold text-sm text-foreground">{dash(customer.address)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Physical Line & Fiber Specs */}
            {conn && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {t('admin.customers.detail.fiberSpecs', 'Physical Line & Fiber Specs')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {(
                      [
                        ['lineType', t('admin.customers.detail.specLineType', 'Connection Type'), conn.lineType],
                        ['cable', t('admin.customers.detail.specCable', 'Cable (m)'), conn.cableRequirement],
                        ['fiberCode', t('admin.customers.detail.specFiberCode', 'Fiber Code'), conn.fiberCode],
                        ['coreColor', t('admin.customers.detail.specCoreColor', 'Core Color'), conn.coreColor],
                        ['cores', t('admin.customers.detail.specCores', 'Number of Core'), conn.numberOfCore],
                        ['clientType', t('admin.customers.detail.specClientType', 'Client Type'), conn.clientType],
                        ['billing', t('admin.customers.detail.specBilling', 'Billing Status'), conn.billingStatus],
                        ['otc', 'OTC', conn.otc],
                        ['onuMac', t('admin.customers.detail.onuMac', 'ONU MAC'), conn.onuMac],
                        ['vendor', t('admin.customers.detail.specVendor', 'Vendor'), conn.vendorName],
                        ['connectedBy', t('admin.customers.detail.specConnectedBy', 'Connected By'), conn.connectedBy],
                        ['wifiUser', t('admin.customers.detail.specWifiUser', 'WiFi Router User'), conn.routerUsername],
                      ] as const
                    ).map(([key, label, value]) => (
                      <div key={key} className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-xs text-muted-foreground block">{label}</span>
                        <span className="font-semibold text-foreground capitalize break-all">{dash(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Address & Geographical Map */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t('admin.customers.detail.mapTitle', 'Geographical Location & Installation Map')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {customer.latitude !== undefined && customer.longitude !== undefined ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border/70 shadow-sm">
                      <MapboxMap
                        markers={[
                          {
                            id: customer.id,
                            latitude: customer.latitude,
                            longitude: customer.longitude,
                            color: '#f75803',
                            label: customer.name,
                          },
                        ]}
                        height={180}
                        initialZoom={14}
                        showNavigation={false}
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('admin.customers.detail.gps', 'GPS Coordinates:')}</span>
                        <span className="font-mono font-semibold text-foreground">
                          {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 pt-1"
                      >
                        {t('admin.customers.detail.openMaps', 'Open in Google Maps')} <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                    <MapPin className="h-6 w-6 mx-auto text-muted-foreground/40" />
                    <p>{t('admin.customers.detail.noGps', 'No GPS coordinates mapped for this subscriber.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================= BOTTOM FULL-WIDTH PAYMENTS LEDGER ================= */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t('admin.customers.detail.ledger', 'Payment Ledger ({n})', { n: customer.paymentsSummary.totalCount })}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('admin.customers.detail.collected', 'Collected')} <CurrencyDisplay amount={customer.paymentsSummary.successfulAmount} className="inline" />
                  {customer.paymentsSummary.pendingAmount > 0 && (
                    <>
                      {' · '}{t('admin.customers.detail.pendingLower', 'pending')} <CurrencyDisplay amount={customer.paymentsSummary.pendingAmount} className="inline" />
                    </>
                  )}
                  {customer.paymentsSummary.totalCount > payments.length &&
                    ` · ${t('admin.customers.detail.showingLatest', 'showing the latest {n}', { n: payments.length })}`}
                </CardDescription>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold" render={<Link href={`/admin/customer-payments/new?customerId=${customer.id}`} />}>
                  <CreditCard className="h-3.5 w-3.5" /> {t('admin.customers.detail.recordPayment', 'Record Payment')}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {payments.length === 0 ? (
              <EmptyState
                title={t('admin.customers.detail.noReceipts', 'No payment receipts')}
                description={t('admin.customers.detail.noReceiptsHint', 'No payments recorded for this customer yet.')}
              />
            ) : (
              <div className="divide-y divide-border/40">
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                        {p.invoiceNo}
                        {p.method && (
                          <Badge variant="outline" className="text-xs uppercase font-mono border-border/60">
                            {p.method}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {p.month ? `${p.month} · ` : ''}{t('admin.customers.detail.date', 'Date')}: {ymd(p.paidAt)}
                        {p.receivedBy ? ` · ${t('admin.customers.detail.by', 'by {name}', { name: p.receivedBy })}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-foreground">
                          <CurrencyDisplay amount={p.amountBdt} />
                        </div>
                        <StatusBadge status={p.status === 'successful' ? 'paid' : p.status || 'pending'} label={customerStatusLabel(t, p.status || 'pending')} />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-border/70 text-foreground hover:border-primary/50"
                        render={<Link href={`/admin/customer-payments/${p.id}/pos`} />}
                      >
                        <Printer className="mr-1 h-3 w-3 text-primary" /> {t('admin.customers.detail.receipt', 'Receipt')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </div>
  );
}
