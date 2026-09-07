'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronDown,
  Signal,
  Cpu,
  HardDrive,
  ArrowUpRight,
} from 'lucide-react';
import { useCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CustomerDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useCustomer(id);

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
    daysLeft < 0 ? 'text-destructive' : daysLeft <= 5 ? 'text-amber-500' : 'text-emerald-500';

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronDown className="h-3 w-3 -rotate-90" />
        <Link href="/admin/customers" className="hover:text-foreground transition-colors">Customers</Link>
        <ChevronDown className="h-3 w-3 -rotate-90" />
        <span className="text-foreground font-medium">Customer Details</span>
      </div>

      {/* Hero Section */}
      <PageHero>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${customer.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
                    <StatusBadge status={customer.status} />
                    {customer.online ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
                        <Wifi className="h-3 w-3" /> Online
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-500/10 text-muted-foreground border-slate-500/20 gap-1">
                        <WifiOff className="h-3 w-3" /> Offline
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-mono flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {customer.username}</span>
                    <span>•</span>
                    <span>ID: {customer.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm font-semibold gap-1.5">
                    <Zap className="h-4 w-4" /> Recharge Line
                  </Button>
                </Link>
                <Can menu="customer" action="update">
                  <Link href={`/admin/customers/${customer.id}/edit`}>
                    <Button size="sm" variant="outline" className="gap-1.5 font-semibold">
                      <Edit className="h-4 w-4" /> Edit Profile
                    </Button>
                  </Link>
                </Can>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <MoreVertical className="h-4 w-4" /> More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Link2 className="h-3.5 w-3.5" /> Copy Subscription Link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <RefreshCw className="h-3.5 w-3.5" /> Refresh Session
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <FileText className="h-3.5 w-3.5" /> Audit Logs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className={cn('font-semibold', customer.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
            {customer.online ? 'Online' : 'Offline'}
          </span>{' '}
          <span className="text-muted-foreground">connection</span>
        </p>
        <p>
          <span className="font-semibold">{customer.packageName}</span>{' '}
          <span className="text-muted-foreground">{customer.areaName}</span>
        </p>
        <p>
          <span className={cn('font-semibold tabular-nums', daysLeftColor)}>{daysLeft}d</span>{' '}
          <span className="text-muted-foreground">left · {customer.expiryDate}</span>
        </p>
        <p>
          <span className={cn('font-semibold', customer.macAddress ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
            {customer.macAddress ? 'MAC bound' : 'MAC unbound'}
          </span>
          {customer.macAddress ? (
            <span className="text-muted-foreground font-mono text-xs ml-1">{customer.macAddress}</span>
          ) : null}
        </p>
      </div>

      {/* Main Layout: Two Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Account, Connection, Traffic */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Card */}
          <div >
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Full name" value={customer.name} icon={<User className="h-3.5 w-3.5" />} />
                <Row label="Mobile" value={customer.phone} icon={<Phone className="h-3.5 w-3.5" />} mono />
                <Row label="Email" value={customer.email || 'N/A'} icon={<Mail className="h-3.5 w-3.5" />} />
                <Row label="Service area" value={customer.areaName} icon={<MapPin className="h-3.5 w-3.5" />} />
                <Row label="Sub-area" value={customer.subAreaName ? `${customer.subAreaName} (${customer.subAreaCode})` : 'N/A'} icon={<MapPin className="h-3.5 w-3.5" />} />
                <Row label="Joined" value={customer.createdAt} icon={<Calendar className="h-3.5 w-3.5" />} mono />
                {customer.nidNumber && <Row label="NID" value={customer.nidNumber} icon={<Shield className="h-3.5 w-3.5" />} mono />}
                {customer.code && <Row label="Code" value={customer.code} icon={<FileText className="h-3.5 w-3.5" />} mono />}

                {/* Address & GPS */}
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address & GPS</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary hover:bg-primary/10">
                      <RefreshCw className="h-3 w-3" /> Refresh Location
                    </Button>
                  </div>
                  {customer.address && (
                    <p className="text-sm mb-2">{customer.address}</p>
                  )}
                  {customer.latitude && customer.longitude && (
                    <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-indigo-500" /> Registration:
                        </span>
                        <a href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1">
                          {customer.latitude.toFixed(5)}, {customer.longitude.toFixed(5)}
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                        <span className="text-muted-foreground flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-emerald-500" /> Current:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          {customer.latitude.toFixed(5)}, {customer.longitude.toFixed(5)}
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Details Card */}
          {conn && (
            <div >
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" /> Connection Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    {conn.connectionType && <Row label="Connection Type" value={conn.connectionType} />}
                    {conn.cableRequirement && <Row label="Cable Requirement" value={conn.cableRequirement} />}
                    {conn.fiberCode && <Row label="Fiber Code" value={conn.fiberCode} mono />}
                    {conn.numberOfCore && <Row label="Number of Core" value={conn.numberOfCore} />}
                    {conn.coreColor && <Row label="Core Color" value={conn.coreColor} />}
                    {conn.clientType && <Row label="Client Type" value={conn.clientType} />}
                    {conn.billingStatus && <Row label="Billing Status" value={conn.billingStatus} />}
                    {conn.otc && <Row label="OTC" value={conn.otc} />}
                    {conn.routerUsername && <Row label="WiFi Router Username" value={conn.routerUsername} mono />}
                    {conn.routerPassword && <Row label="WiFi Router Password" value={conn.routerPassword} mono />}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Live Traffic Card */}
          <div >
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Live Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/40 p-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <ArrowDown className="h-3 w-3 text-emerald-500" /> Download
                    </div>
                    <div className="text-lg font-bold font-mono">{customer.online ? '2.4 Mbps' : '0 Kbps'}</div>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <ArrowUp className="h-3 w-3 text-primary" /> Upload
                    </div>
                    <div className="text-lg font-bold font-mono">{customer.online ? '512 Kbps' : '0 Kbps'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bandwidth Usage Card */}
          {customer.bandwidthUsage && customer.bandwidthUsage.length > 0 && (
            <div >
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-primary" /> Bandwidth Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Download Today</div>
                      <div className="text-sm font-bold mt-0.5">{formatBw(bwToday.download)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Upload Today</div>
                      <div className="text-sm font-bold mt-0.5">{formatBw(bwToday.upload)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Total Usage</div>
                      <div className="text-sm font-bold mt-0.5">{formatBw(totalBw.download + totalBw.upload)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Peak</div>
                      <div className="text-sm font-bold mt-0.5">{formatBw(Math.max(...customer.bandwidthUsage.map(d => d.downloadMb + d.uploadMb)))}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {customer.bandwidthUsage.map((bw, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                        <span className="text-muted-foreground font-mono">{bw.date}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><ArrowDown className="h-2.5 w-2.5 text-emerald-500" /> {formatBw(bw.downloadMb)}</span>
                          <span className="flex items-center gap-1"><ArrowUp className="h-2.5 w-2.5 text-primary" /> {formatBw(bw.uploadMb)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: Session, Plan, PPPoE, OLT */}
        <div className="space-y-6">
          {/* Live Session Card */}
          <div >
            <Card className={`border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden ${customer.online ? 'ring-emerald-500/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Signal className="h-4 w-4 text-primary" /> Live Session
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
                    <RefreshCw className="h-3 w-3" /> Kick
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`rounded-lg p-3 ${customer.online ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-muted/30 border border-border/40'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-semibold text-sm ${customer.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {customer.online ? 'Session active' : 'No active session'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {customer.online ? 'Customer is connected on PPPoE right now.' : 'Customer is not connected.'}
                      </div>
                    </div>
                    <Badge variant={customer.online ? 'default' : 'secondary'} className={customer.online ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                      {customer.online ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Duration</div>
                    <div className="font-semibold font-mono text-xs mt-0.5">{customer.online ? '4h 23m' : '--'}</div>
                  </div>
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Optical Signal</div>
                    <div className="font-semibold font-mono text-xs mt-0.5">{olt?.rxPower || '--'}</div>
                  </div>
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Last Logout</div>
                    <div className="font-semibold font-mono text-xs mt-0.5">{pppoe?.lastLoggedOut || '--'}</div>
                  </div>
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Last MAC</div>
                    <div className="font-semibold font-mono text-xs mt-0.5 truncate">{pppoe?.lastCallerId || '--'}</div>
                  </div>
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">OLT Last Seen</div>
                    <div className="font-semibold font-mono text-xs mt-0.5">{olt?.lastSeen || '--'}</div>
                  </div>
                  <div className="rounded border border-border/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Disconnect Reason</div>
                    <div className="font-semibold font-mono text-xs mt-0.5">{olt?.reason || '--'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Plan Card */}
          <div >
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" /> Active Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/40 p-3 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Package</div>
                  <div className="text-sm font-bold mt-1">{customer.packageName}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{customer.packagePrice ? `${customer.packagePrice}৳ / month` : '--'}</div>
                </div>
                <div className={`rounded-lg border p-3 text-center ${daysLeft < 0 ? 'border-destructive/30 bg-destructive/5' : daysLeft <= 5 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/40'}`}>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Expires In</div>
                  <div className={`text-sm font-bold mt-1 ${daysLeftColor}`}>{daysLeft} days</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Due {customer.expiryDate}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MikroTik PPPoE Card */}
          {pppoe && (
            <div >
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Radio className="h-4 w-4 text-primary" /> MikroTik PPPoE
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
                      Check Ping
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded border border-border/40 p-2">
                      <div className="text-[10px] text-muted-foreground">Router</div>
                      <div className="font-semibold text-xs mt-0.5 font-mono truncate">{customer.routerName || '--'}</div>
                    </div>
                    <div className="rounded border border-border/40 p-2">
                      <div className="text-[10px] text-muted-foreground">PPPoE Secret</div>
                      <div className="font-semibold text-xs mt-0.5 font-mono">{pppoe.name}</div>
                    </div>
                    <div className="rounded border border-border/40 p-2">
                      <div className="text-[10px] text-muted-foreground">Password</div>
                      <div className="font-semibold text-xs mt-0.5 font-mono">{pppoe.password}</div>
                    </div>
                    <div className="rounded border border-border/40 p-2">
                      <div className="text-[10px] text-muted-foreground">Profile</div>
                      <div className="font-semibold text-xs mt-0.5 font-mono">{pppoe.profile}</div>
                    </div>
                    <div className="rounded border border-border/40 p-2 col-span-2">
                      <div className="text-[10px] text-muted-foreground">Service</div>
                      <div className="font-semibold text-xs mt-0.5 font-mono">{pppoe.service}</div>
                    </div>
                  </div>

                  {/* Connection Control */}
                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">Connection Control</div>
                        <div className="text-[10px] text-muted-foreground">Enable / disable internet access</div>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pppoe.disabled ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                            pppoe.disabled ? 'translate-x-1' : 'translate-x-4.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* OLT / ONU Card */}
          {olt && (
            <div >
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Signal className="h-4 w-4 text-primary" /> OLT / ONU
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
                      <RefreshCw className="h-3 w-3" /> Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="OLT name" value={olt.name} mono />
                  <Row label="ONU ID" value={olt.onuId} mono />
                  <Row label="Status" value={olt.status} />
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground text-xs">RX Power</span>
                    <span className={`font-mono text-xs font-semibold ${olt.rxPower.includes('-') && parseInt(olt.rxPower) < -25 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {olt.rxPower}
                    </span>
                  </div>
                  <Row label="MAC address" value={olt.macAddress} mono />
                  {olt.callId && <Row label="Call ID" value={olt.callId} mono />}
                  {olt.matchedId && <Row label="Matched ID" value={olt.matchedId} mono />}
                  <div className="flex justify-between items-start py-1.5">
                    <span className="text-muted-foreground text-xs">Description</span>
                    <span className={`text-xs font-medium text-right max-w-[180px] ${olt.description.includes('Not Found') ? 'text-amber-500' : ''}`}>
                      {olt.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Payments Tab */}
      <div >
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Payment History ({payments.length})
              </CardTitle>
              <CardDescription>All invoices and renewal collections</CardDescription>
            </div>
            <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
              <Button size="sm" className="gap-1.5 font-semibold">
                <CreditCard className="h-4 w-4" /> Record Payment
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptyState title="No payment records" description="No previous receipts recorded yet." />
            ) : (
              <div className="divide-y text-sm">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium font-mono">{p.invoiceNo}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.paidAt.slice(0, 10)} • Method: <span className="uppercase font-mono">{p.method}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        <CurrencyDisplay amount={p.amountBdt} />
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
      </PageContent>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function Row({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground text-xs flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className={`text-xs font-medium text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
    </svg>
  );
}
