'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import {
  Mail,
  MessageSquare,
  CreditCard,
  Server,
  Save,
  Send,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building,
  Phone,
  Globe,
  ExternalLink,
  MapPin,
  Receipt,
  RotateCw,
  Upload,
  Wallet,
  BellRing,
  Quote,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import {
  sameGeneralText,
  useCheckSmsBalance,
  useSendTestEmail,
  useSendTestSms,
  useSettingsGroup,
  useSoftwareSettings,
  useUpdateGeneralSettings,
  useUploadBrandingImage,
} from '../hooks/use-settings';
import { SettingsGroupForm } from '../components/SettingsGroupForm';
import type { GeneralSettings, SettingsGroup, SettingsGroupId } from '../types';
import { useMovieServers, useTestMovieServer, type ProbeResult } from '@/features/admin/movie-servers/hooks/use-movie-servers';

function fieldValue(group: SettingsGroup | undefined, key: string): string | boolean | undefined {
  for (const section of group?.sections ?? []) {
    const f = section.fields.find((x) => x.key === key);
    if (f) return f.value;
  }
  return undefined;
}

export function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isTenantAdmin = role === 'admin' || role === 'super_admin';
  const general = useSoftwareSettings();
  const smtp = useSettingsGroup('smtp', isTenantAdmin);
  const sms = useSettingsGroup('sms', isTenantAdmin);
  const payment = useSettingsGroup('payment', isTenantAdmin);

  if (general.isLoading) return <PageSkeleton variant="form" />;
  if (general.isError || !general.data) {
    return (
      <EmptyState
        title="Failed to load settings"
        description={errorMessage(general.error)}
        actionLabel="Retry"
        onAction={() => general.refetch()}
      />
    );
  }

  const g = general.data;
  const smtpHost = String(fieldValue(smtp.data, 'smtp_host') ?? '');
  const smsGatewayKey = String(fieldValue(sms.data, 'default_sms_gateway') ?? '');
  const smsGatewayLabel =
    sms.data?.sections
      .flatMap((s) => s.fields)
      .find((f) => f.key === 'default_sms_gateway')
      ?.options?.find((o) => o.value === smsGatewayKey)?.label ?? '';
  const enabledGateways = payment.data?.sections.filter((s) => s.enableKey && fieldValue(payment.data, s.enableKey) === true) ?? [];

  const refreshAll = () => {
    void general.refetch();
    if (isTenantAdmin) {
      void smtp.refetch();
      void sms.refetch();
      void payment.refetch();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Software & System Settings"
        subtitle="Company profile, outbound email, SMS gateways and payment gateways for your ISP"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Settings' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
          >
            <RotateCw className={cn('mr-1.5 h-3.5 w-3.5', general.isFetching && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* Quick status ribbon — every value is read from the saved settings */}
      <div className={cn('grid grid-cols-2 gap-3', isTenantAdmin ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2')}>
        <RibbonCard icon={<Building className="h-3 w-3 text-primary" />} label="Company Profile" value={g.appName || 'Not set'} />
        <RibbonCard icon={<Phone className="h-3 w-3 text-primary" />} label="Helpline" value={g.companyCell || 'Not set'} />
        {isTenantAdmin && (
          <>
            <RibbonCard
              icon={<Mail className="h-3 w-3 text-emerald-400" />}
              label="Outbound SMTP"
              value={smtp.isLoading ? '…' : smtpHost ? 'Configured' : 'Not configured'}
              tone={smtpHost ? 'ok' : 'warn'}
            />
            <RibbonCard
              icon={<MessageSquare className="h-3 w-3 text-primary" />}
              label="SMS Gateway"
              value={sms.isLoading ? '…' : smsGatewayKey ? smsGatewayLabel || smsGatewayKey : 'Not configured'}
              tone={smsGatewayKey ? 'ok' : 'warn'}
            />
            <RibbonCard
              icon={<CreditCard className="h-3 w-3 text-amber-400" />}
              label="Payment Gateways"
              value={payment.isLoading ? '…' : `${enabledGateways.length} enabled`}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-card/60 p-1.5 rounded-xl border border-border/70 backdrop-blur-md">
          <TabsTrigger value="general" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building className="h-3.5 w-3.5" /> Company Profile
          </TabsTrigger>
          {isTenantAdmin && (
            <>
              <TabsTrigger value="smtp" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mail className="h-3.5 w-3.5" /> SMTP Relay
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> SMS Gateway
              </TabsTrigger>
              <TabsTrigger value="payment" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="h-3.5 w-3.5" /> Payment Gateways
              </TabsTrigger>
              <TabsTrigger value="servers" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Server className="h-3.5 w-3.5" /> Media Servers
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralTab initial={g} />
        </TabsContent>

        {isTenantAdmin && (
          <>
            <TabsContent value="smtp" className="space-y-4">
              <GroupTab group="smtp" query={smtp} />
              <TestEmailCard />
            </TabsContent>
            <TabsContent value="sms" className="space-y-4">
              <SmsToolsCard />
              <GroupTab group="sms" query={sms} />
            </TabsContent>
            <TabsContent value="payment" className="space-y-4">
              <GroupTab group="payment" query={payment} />
            </TabsContent>
            <TabsContent value="servers" className="space-y-4">
              <MediaServersPanel />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function RibbonCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'ok' | 'warn';
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </span>
      <p
        className={cn(
          'mt-1 text-xs font-bold truncate flex items-center gap-1',
          tone === 'ok' ? 'text-emerald-400' : tone === 'warn' ? 'text-amber-400' : 'text-foreground',
        )}
      >
        {tone === 'ok' && <CheckCircle2 className="h-3 w-3" />}
        {tone === 'warn' && <AlertTriangle className="h-3 w-3" />}
        {value}
      </p>
    </div>
  );
}

function GroupTab({
  group,
  query,
}: {
  group: SettingsGroupId;
  query: ReturnType<typeof useSettingsGroup>;
}) {
  if (query.isLoading) return <PageSkeleton variant="form" />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title={`Could not load ${group.toUpperCase()} settings`}
        description={errorMessage(query.error)}
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }
  return <SettingsGroupForm key={query.dataUpdatedAt} data={query.data} />;
}

/* ------------------------------ Company profile ------------------------------ */

function GeneralTab({ initial }: { initial: GeneralSettings }) {
  const [g, setG] = useState<GeneralSettings>(initial);
  const update = useUpdateGeneralSettings();
  const upload = useUploadBrandingImage();
  const logoInput = useRef<HTMLInputElement>(null);
  const dirty = !sameGeneralText(g, initial);

  const handleSave = () => {
    if (g.webmasterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.webmasterEmail)) {
      toast.error('Enter a valid support email address');
      return;
    }
    update.mutate(g, { onSuccess: () => toast.success('Company profile saved') });
  };

  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(
      { file, kind: 'logo' },
      {
        onSuccess: (res) => {
          setG((prev) => ({ ...prev, logoUrl: res.url }));
          toast.success('Logo updated');
        },
      },
    );
    if (logoInput.current) logoInput.current.value = '';
  };

  const field = (key: keyof GeneralSettings, label: string, icon: React.ReactNode, mono = false, span = false) => (
    <div className={cn('space-y-1.5', span && 'sm:col-span-2')}>
      <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <Input
        value={(g[key] as string | null) ?? ''}
        onChange={(e) => setG({ ...g, [key]: e.target.value })}
        className={cn('bg-background/80 border-border/70 text-xs focus-visible:ring-primary', mono && 'font-mono')}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2 border-border/70 bg-card/60 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Company Identity & Branding
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Printed on subscriber bills and receipts and shown in the customer portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('appName', 'ISP / Organization Name', <Building className="h-3.5 w-3.5 text-primary" />)}
            {field('appSlogan', 'Slogan', <Quote className="h-3.5 w-3.5 text-primary" />)}
            {field('companyCell', 'Helpline / Support Phone', <Phone className="h-3.5 w-3.5 text-primary" />, true)}
            {field('webmasterEmail', 'Support / Sender Email', <Mail className="h-3.5 w-3.5 text-primary" />, true)}
            {field('companyAddress', 'Head Office Address', <MapPin className="h-3.5 w-3.5 text-primary" />, false, true)}
            {g.expiryReminderDays !== null &&
              field('expiryReminderDays', 'Expiry Reminder (days before expiry)', <BellRing className="h-3.5 w-3.5 text-primary" />, true)}
          </div>
          <Can menu="software_settings" action="update">
            <div className="flex justify-end pt-2">
              <Button size="sm" disabled={!dirty || update.isPending} onClick={handleSave} className="text-xs">
                <Save className="mr-1.5 h-3.5 w-3.5" /> {update.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </Can>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Invoice Header Preview
          </CardTitle>
          <CardDescription className="text-[11px]">How your details appear on printed receipts</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-border/80 bg-background/90 shadow-inner space-y-3 font-sans">
            <div className="flex items-start gap-3 border-b border-border/60 pb-3">
              {g.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.logoUrl} alt="Logo" className="h-10 w-10 rounded object-contain border border-border/60 bg-white" />
              ) : null}
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground">{g.appName || 'Your ISP name'}</div>
                {g.appSlogan && <div className="text-[11px] text-muted-foreground">{g.appSlogan}</div>}
                <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{g.companyAddress || 'Address not set'}</div>
                {g.companyCell && <div className="text-[11px] text-primary font-mono mt-1">{g.companyCell}</div>}
              </div>
            </div>
            {g.webmasterEmail && (
              <div className="p-2 rounded bg-muted/40 text-[10px] text-muted-foreground text-center">
                Billing support: <strong className="text-foreground">{g.webmasterEmail}</strong>
              </div>
            )}
          </div>

          <Can menu="software_settings" action="update">
            <div className="space-y-2">
              <input
                ref={logoInput}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg"
                className="hidden"
                onChange={(e) => handleLogo(e.target.files?.[0])}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={upload.isPending}
                onClick={() => logoInput.current?.click()}
                className="w-full text-xs"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" /> {upload.isPending ? 'Uploading…' : g.logoUrl ? 'Replace logo' : 'Upload logo'}
              </Button>
              <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP or SVG, up to 2 MB.</p>
            </div>
          </Can>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------ SMTP / SMS tools ------------------------------ */

function TestEmailCard() {
  const [to, setTo] = useState('');
  const send = useSendTestEmail();
  const handle = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      toast.error('Enter a valid recipient email address');
      return;
    }
    send.mutate(to.trim(), { onSuccess: (res) => toast.success(`Test email accepted by your SMTP server for ${res.to}`) });
  };
  return (
    <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
      <div className="space-y-0.5">
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5 text-primary" /> Send a test email
        </div>
        <div className="text-[11px] text-muted-foreground">Uses the saved SMTP settings above — save first if you changed them.</div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          type="email"
          placeholder="Recipient email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9 text-xs bg-background/90 border-border/70 flex-1 font-mono"
        />
        <Button size="sm" onClick={handle} disabled={send.isPending} className="h-9 text-xs shrink-0">
          <Send className="mr-1.5 h-3.5 w-3.5" /> {send.isPending ? 'Sending…' : 'Send Test Email'}
        </Button>
      </div>
    </div>
  );
}

function SmsToolsCard() {
  const [phone, setPhone] = useState('');
  const send = useSendTestSms();
  const balance = useCheckSmsBalance();
  const handleSend = () => {
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      toast.error('Enter a valid Bangladeshi mobile number');
      return;
    }
    send.mutate(phone, { onSuccess: (res) => toast.success(`Test SMS accepted by ${res.gateway}`) });
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-2">
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-primary" /> Gateway balance
        </div>
        {balance.data ? (
          balance.data.ok ? (
            <div className="text-xl font-bold font-mono text-emerald-400">{balance.data.balance}</div>
          ) : (
            <div className="text-xs text-amber-400">{balance.data.message}</div>
          )
        ) : (
          <div className="text-[11px] text-muted-foreground">Asks your default gateway for the live balance.</div>
        )}
        <Button size="sm" variant="outline" disabled={balance.isPending} onClick={() => balance.mutate()} className="h-8 text-xs">
          <RotateCw className={cn('mr-1.5 h-3.5 w-3.5', balance.isPending && 'animate-spin')} /> Check balance
        </Button>
      </div>
      <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> Send a test SMS
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9 text-xs bg-background/90 border-border/70 flex-1 font-mono"
          />
          <Button size="sm" onClick={handleSend} disabled={send.isPending} className="h-9 text-xs shrink-0">
            <Send className="mr-1.5 h-3.5 w-3.5" /> {send.isPending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Media servers ------------------------------ */

function MediaServersPanel() {
  const { data, isLoading, isError, error, refetch } = useMovieServers({ page: 1, pageSize: 10 });
  const test = useTestMovieServer();
  const [probes, setProbes] = useState<Record<string, ProbeResult>>({});
  const [testing, setTesting] = useState<string | null>(null);

  if (isLoading) return <PageSkeleton variant="table" rows={3} />;
  if (isError || !data) {
    return <EmptyState title="Could not load media servers" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <Card className="border-border/70 bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Media & FTP Servers
          </CardTitle>
          <CardDescription className="text-xs">Endpoints published to subscribers ({data.meta.total} total)</CardDescription>
        </div>
        <Link href="/admin/movie-servers" className="text-xs text-primary hover:underline">
          Manage servers
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-border/40 pt-1">
        {data.items.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No media servers added yet.</p>
        ) : (
          data.items.map((s) => {
            const probe = probes[s.id];
            return (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                  <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                    <Globe className="h-3 w-3 text-primary shrink-0" />
                    {s.url}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {probe && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-mono',
                        probe.reachable ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30',
                      )}
                    >
                      {probe.reachable ? `${probe.durationMs ?? 0} ms` : 'unreachable'}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-border/70"
                    disabled={testing === s.id}
                    onClick={() => {
                      setTesting(s.id);
                      test.mutate(s.id, {
                        onSuccess: (res) => {
                          setProbes((p) => ({ ...p, [s.id]: res }));
                          if (!res.reachable) toast.error(`${s.name}: ${res.error ?? 'no response'}`);
                        },
                        onSettled: () => setTesting(null),
                      });
                    }}
                  >
                    <Activity className="mr-1.5 h-3 w-3 text-primary" /> {testing === s.id ? 'Testing…' : 'Test'}
                  </Button>
                  {/^(https?|ftp):\/\//i.test(s.url) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-primary"
                      onClick={() => window.open(s.url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
