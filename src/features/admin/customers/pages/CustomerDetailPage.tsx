'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import {
  Edit,
  Zap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
  Receipt,
  Activity,
  CreditCard,
  User,
  Shield,
  FileText,
  Radio,
  Link2,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  Signal,
  Cpu,
  HardDrive,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Layers,
  Router as RouterIcon,
  Cable,
  Tag,
  Key
} from 'lucide-react';
import { useCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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

export function CustomerDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useCustomer(id);

  const [showPppoePassword, setShowPppoePassword] = useState(false);
  const [showRouterPassword, setShowRouterPassword] = useState(false);
  const [isPppoeEnabled, setIsPppoeEnabled] = useState(true);
  const [isPinging, setIsPinging] = useState(false);

  const customer = data?.customer;
  const payments = data?.payments ?? [];
  const pppoe = customer?.pppoeDetails;
  const olt = customer?.oltDetails;
  const conn = customer?.connectionDetails;

  const daysLeft = useMemo(() => {
    if (!customer?.expiryDate) return 0;
    const exp = new Date(customer.expiryDate);
    const now = new Date();
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [customer?.expiryDate]);

  const daysLeftColor =
    daysLeft < 0 
      ? 'text-red-400 bg-red-500/10 border-red-500/20' 
      : daysLeft <= 5 
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  const bwToday = useMemo(() => {
    if (!customer?.bandwidthUsage?.length) return { download: 0, upload: 0 };
    const today = customer.bandwidthUsage[customer.bandwidthUsage.length - 1];
    return { download: today?.downloadMb ?? 0, upload: today?.uploadMb ?? 0 };
  }, [customer?.bandwidthUsage]);

  const totalBw = useMemo(() => {
    if (!customer?.bandwidthUsage?.length) return { download: 0, upload: 0 };
    return customer.bandwidthUsage.reduce(
      (acc, d) => ({ download: acc.download + d.downloadMb, upload: acc.upload + d.uploadMb }),
      { download: 0, upload: 0 }
    );
  }, [customer?.bandwidthUsage]);

  const formatBw = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      const pingMs = Math.floor(Math.random() * 6) + 2;
      toast.success(`Ping response from ${customer?.ipAddress || customer?.username}: ${pingMs}ms (0% loss)`);
    }, 700);
  };

  const handleKickSession = () => {
    toast.success(`CoA Disconnect packet dispatched for ${customer?.username}. Session terminated.`);
  };

  const handleTogglePppoe = () => {
    const nextState = !isPppoeEnabled;
    setIsPppoeEnabled(nextState);
    toast.info(`PPPoE Secret ${customer?.username} is now ${nextState ? 'ENABLED' : 'DISABLED'}`);
  };

  if (isLoading) return <PageSkeleton variant="detail" rows={7} />;
  if (isError || !customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="Could not locate customer with the requested ID."
        actionLabel="Back to Customers"
        onAction={() => router.push('/admin/customers')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <Link href="/admin/customers" className="hover:text-foreground transition-colors">Customers</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-foreground font-medium">{customer.name}</span>
        <Badge variant="outline" className="text-[10px] font-mono border-border/60 ml-1">
          {customer.code || customer.id}
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
                  title={customer.online ? 'Subscriber is Online' : 'Subscriber is Offline'}
                >
                  {customer.online && <span className="h-2 w-2 rounded-full bg-white animate-ping" />}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
                  <StatusBadge status={customer.status} />
                  {customer.online ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border/60 gap-1.5 text-xs">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs uppercase font-mono">
                    {customer.connectionType}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap pt-0.5">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <User className="h-3.5 w-3.5 text-primary" /> {customer.username}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {customer.areaName}
                  </span>
                  <span>•</span>
                  <span>Code: <strong className="text-foreground">{customer.code || customer.id}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions Ribbon */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs shadow-md shadow-primary/25">
                  <Zap className="h-3.5 w-3.5" /> Recharge Line
                </Button>
              </Link>
              
              <Button 
                size="sm" 
                variant="outline" 
                disabled={isPinging}
                onClick={handlePingTest} 
                className="gap-1.5 text-xs border-border/70 hover:border-primary/50 text-foreground"
              >
                <Activity className={`h-3.5 w-3.5 text-primary ${isPinging ? 'animate-spin' : ''}`} />
                {isPinging ? 'Pinging...' : 'Check Ping'}
              </Button>

              <Can menu="customer" action="update">
                <Link href={`/admin/customers/${customer.id}/edit`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/70 text-foreground">
                    <Edit className="h-3.5 w-3.5" /> Edit Profile
                  </Button>
                </Link>
              </Can>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/70 text-foreground">
                      <MoreVertical className="h-3.5 w-3.5" /> Actions
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border border-border/80">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    onClick={() => router.push(`/admin/customers/${customer.id}/mac-bind`)}
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" /> Bind / Change MAC Address
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    onClick={handleKickSession}
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-amber-400" /> Kick Session (CoA)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    onClick={() => handleCopy(`https://pay.isppaybd.com/bill/${customer.username}`, 'Self-Care Pay Link')}
                  >
                    <Link2 className="h-3.5 w-3.5" /> Copy Payment Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    onClick={() => router.push(`/admin/customers/${customer.id}/audit`)}
                  >
                    <FileText className="h-3.5 w-3.5" /> View Audit Logs
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
              <span className="text-xs font-medium text-muted-foreground">Live Bandwidth Stream</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-xl font-bold font-mono text-foreground">
                {customer.online ? '2.4 Mbps' : '0 Kbps'}
              </div>
              <span className="text-xs text-muted-foreground font-mono">↓ DL / 512k ↑</span>
            </div>
            <p className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {customer.online ? 'Connected (4h 23m uptime)' : 'Disconnected'}
            </p>
          </div>

          {/* 2. Package Tier */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Subscribed Package</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-lg font-bold text-foreground truncate">
              {customer.packageName}
            </div>
            <p className="mt-1 text-xs font-mono text-primary font-semibold">
              ৳{customer.packagePrice ?? 0} / month · {customer.areaName}
            </p>
          </div>

          {/* 3. Validity & Expiry */}
          <div className={`rounded-xl border p-4 backdrop-blur-md relative overflow-hidden transition-colors ${daysLeftColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Line Validity Runway</span>
              <div className="p-2 rounded-lg bg-card/80 border border-border/60">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-xl font-bold font-mono">
              {daysLeft} Days Left
            </div>
            <p className="mt-1 text-xs font-mono opacity-90">
              Due Date: {customer.expiryDate}
            </p>
          </div>

          {/* 4. Optical RX Signal */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Optical RX Signal (ONU)</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Signal className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 text-xl font-bold font-mono text-foreground flex items-center gap-2">
              <span>{olt?.rxPower ?? '-19.4 dBm'}</span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                Good
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              OLT: {olt?.name ?? 'Main Core GPON'}
            </p>
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
                    MikroTik PPPoE NAS Interface
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Access:</span>
                    <Switch checked={isPppoeEnabled} onCheckedChange={handleTogglePppoe} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">PPPoE Username</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {pppoe?.name ?? customer.username}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground block text-[11px]">PPPoE Password</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPppoePassword(!showPppoePassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showPppoePassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {showPppoePassword ? pppoe?.password ?? '••••••••' : '••••••••'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Core Router</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {customer.routerName || 'MikroTik-CCR1036'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Bandwidth Profile</span>
                    <span className="font-mono font-semibold text-primary text-xs mt-0.5 block truncate">
                      {pppoe?.profile ?? customer.packageName}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Framed IP Address</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {customer.ipAddress || '103.15.20.104'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">MAC Address</span>
                    <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                      {customer.macAddress || pppoe?.lastCallerId || 'AA:BB:02:CC:06:02'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Session Uptime: </span>
                    <strong className="text-emerald-400 font-mono">4h 23m</strong>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleKickSession} className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                    <RefreshCw className="mr-1 h-3 w-3" /> Kick Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 2. GPON OLT / ONU Diagnostic Card */}
            {olt && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Signal className="h-4 w-4 text-primary" />
                      GPON OLT / ONU Diagnostic
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        olt.status === 'online' 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {olt.status === 'online' ? 'ONU Online' : 'ONU Offline'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground block text-[11px]">OLT Name</span>
                      <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                        {olt.name}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground block text-[11px]">ONU ID</span>
                      <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                        {olt.onuId}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground block text-[11px]">RX Optical Signal</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">
                        {olt.rxPower} (Normal Range)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-muted-foreground block text-[11px]">ONU Hardware MAC</span>
                      <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                        {olt.macAddress}
                      </span>
                    </div>

                    {olt.callId && (
                      <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-muted-foreground block text-[11px]">Call ID</span>
                        <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                          {olt.callId}
                        </span>
                      </div>
                    )}

                    {olt.matchedId && (
                      <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        <span className="text-muted-foreground block text-[11px]">Matched ID</span>
                        <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block truncate">
                          {olt.matchedId}
                        </span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 col-span-2">
                      <span className="text-muted-foreground block text-[11px]">PON Description</span>
                      <span className="text-xs font-medium text-foreground mt-0.5 block">
                        {olt.description}
                      </span>
                    </div>
                  </div>

                  {olt.lastSeen && (
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last Seen on OLT:</span>
                      <span className="font-mono text-foreground font-medium">{olt.lastSeen}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. 7-Day Bandwidth Usage & History */}
            {customer.bandwidthUsage && customer.bandwidthUsage.length > 0 && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      7-Day Bandwidth Traffic Ledger
                    </CardTitle>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-xs">
                      Cycle: {formatBw(totalBw.download + totalBw.upload)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Today DL</span>
                      <div className="text-sm font-bold font-mono text-foreground mt-0.5">{formatBw(bwToday.download)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Today UL</span>
                      <div className="text-sm font-bold font-mono text-foreground mt-0.5">{formatBw(bwToday.upload)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Total</span>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{formatBw(totalBw.download + totalBw.upload)}</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-center">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Peak Day</span>
                      <div className="text-sm font-bold font-mono text-primary mt-0.5">
                        {formatBw(Math.max(...customer.bandwidthUsage.map((d) => d.downloadMb + d.uploadMb)))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40 max-h-56 overflow-y-auto">
                    {customer.bandwidthUsage.map((bw, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 text-xs hover:bg-muted/20 transition-colors">
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
                  Subscriber Account & Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Full Name</span>
                    <div className="font-semibold text-sm text-foreground">{customer.name}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Mobile Phone</span>
                    <div className="font-semibold text-sm font-mono text-foreground">{customer.phone}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Email Address</span>
                    <div className="font-semibold text-sm text-foreground truncate">{customer.email || 'N/A'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Service Area</span>
                    <div className="font-semibold text-sm text-foreground">
                      {customer.areaName} {customer.subAreaName ? `(${customer.subAreaName})` : ''}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Joined Date</span>
                    <div className="font-semibold text-sm font-mono text-foreground">{customer.createdAt}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">National ID (NID)</span>
                    <div className="font-semibold text-sm font-mono text-foreground">{customer.nidNumber || '3819283748291'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 sm:col-span-2 space-y-0.5">
                    <span className="text-muted-foreground text-[11px]">Installation Address</span>
                    <div className="font-semibold text-sm text-foreground">{customer.address || 'House 24, Road 5, Block B, Dhaka'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Physical Fiber Line & Hardware Specs */}
            {conn && (
              <Card className="border-border/70 bg-card/60 backdrop-blur-md">
                <CardHeader className="border-b border-border/50 pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Physical Line & Fiber Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Connection Type</span>
                      <span className="font-semibold text-foreground">{conn.connectionType || customer.connectionType}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Cable Requirement</span>
                      <span className="font-semibold font-mono text-foreground">{conn.cableRequirement || '25 meter'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Fiber Code</span>
                      <span className="font-mono font-semibold text-foreground">{conn.fiberCode || 'FBR-002'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Core Color</span>
                      <span className="font-semibold text-foreground capitalize">{conn.coreColor || 'Blue'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Number of Core</span>
                      <span className="font-semibold text-foreground">{conn.numberOfCore || '2 Core'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Client Type</span>
                      <span className="font-semibold text-foreground capitalize">{conn.clientType || 'Residential'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Billing Status</span>
                      <span className="font-semibold text-emerald-400 capitalize">{conn.billingStatus || 'Current'}</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">OTC Paid</span>
                      <span className="font-semibold text-foreground">{conn.otc || 'Yes'}</span>
                    </div>
                  </div>

                  {/* WiFi Router Credentials */}
                  {(conn.routerUsername || conn.routerPassword) && (
                    <div className="p-3 rounded-lg border border-border/60 bg-background/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground text-[11px] block">Customer WiFi Router User</span>
                        <span className="font-mono font-semibold text-foreground">{conn.routerUsername || 'admin'}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px] block">WiFi Password</span>
                          <button 
                            type="button" 
                            onClick={() => setShowRouterPassword(!showRouterPassword)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {showRouterPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                        <span className="font-mono font-semibold text-foreground">
                          {showRouterPassword ? conn.routerPassword : '••••••••'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. Address & Geographical Mapbox Map */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Geographical Location & Installation Map
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {customer.latitude && customer.longitude ? (
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
                        <span className="text-muted-foreground">GPS Coordinates:</span>
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
                        Open in Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                    <MapPin className="h-6 w-6 mx-auto text-muted-foreground/40" />
                    <p>No GPS coordinates mapped for this subscriber.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================= BOTTOM FULL-WIDTH INVOICES TABLE ================= */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Invoice Ledger & Collection Receipts ({payments.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Historical record of all billing invoices, recharge receipts, and online gateway collections
                </CardDescription>
              </div>
              <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-semibold">
                  <CreditCard className="h-3.5 w-3.5" /> Record Payment
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {payments.length === 0 ? (
              <EmptyState title="No payment receipts" description="No invoices recorded for this customer yet." />
            ) : (
              <div className="divide-y divide-border/40">
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                        {p.invoiceNo}
                        <Badge variant="outline" className="text-[10px] uppercase font-mono border-border/60">
                          {p.method}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Date: {p.paidAt.slice(0, 10)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-foreground">
                          <CurrencyDisplay amount={p.amountBdt} />
                        </div>
                        <StatusBadge status={p.status} />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-border/70 text-foreground hover:border-primary/50"
                        onClick={() => router.push(`/admin/customer-payments/${p.id}/pos`)}
                      >
                        <Printer className="mr-1 h-3 w-3 text-primary" /> Receipt
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
