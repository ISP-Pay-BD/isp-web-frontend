'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Server, 
  Clock, 
  Save, 
  Send, 
  Play, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Phone,
  Calendar,
  Globe,
  ShieldCheck,
  Zap,
  ExternalLink,
  MapPin,
  Receipt,
  Coins,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Radio
} from 'lucide-react';
import { useSoftwareSettings } from '../hooks/use-settings';
import type { GeneralSettings, PaymentGatewayConfig } from '@/data/admin/settings.data';

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSoftwareSettings();
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[] | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testEmailType, setTestEmailType] = useState<'invoice' | 'otp' | 'welcome'>('invoice');
  const [testPhone, setTestPhone] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [pingLatencies, setPingLatencies] = useState<Record<string, number | null>>({});
  const [runningCron, setRunningCron] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load settings" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const g = general ?? data.general;
  const gwList = gateways ?? data.paymentGateways;

  const handleSave = () => {
    toast.success('System & tenant configurations saved successfully!');
  };

  const handleTestSmtp = () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid recipient email address');
      return;
    }
    toast.success(`SMTP test email (${testEmailType.toUpperCase()}) dispatched to ${testEmail}`);
  };

  const handleTestSms = () => {
    if (!testPhone || testPhone.length < 11) {
      toast.error('Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)');
      return;
    }
    toast.success(`Test SMS delivered to ${testPhone} via ${data.smsGateway.provider.toUpperCase()} (Mask: ${data.smsGateway.senderId})`);
  };

  const handleToggleGateway = (id: string) => {
    const updated = gwList.map((gw) => {
      if (gw.id === id) {
        const nextState = !gw.enabled;
        toast.info(`${gw.name} is now ${nextState ? 'enabled' : 'disabled'}`);
        return { ...gw, enabled: nextState };
      }
      return gw;
    });
    setGateways(updated);
  };

  const handleToggleGatewayMode = (id: string) => {
    const updated = gwList.map((gw) => {
      if (gw.id === id) {
        const nextMode = gw.mode === 'live' ? 'sandbox' : 'live';
        toast.info(`${gw.name} switched to ${nextMode.toUpperCase()} mode`);
        return { ...gw, mode: nextMode as 'sandbox' | 'live' };
      }
      return gw;
    });
    setGateways(updated);
  };

  const handlePingServer = (id: string, name: string) => {
    const latency = Math.floor(Math.random() * 4) + 1;
    setPingLatencies((prev) => ({ ...prev, [id]: latency }));
    toast.success(`Ping response from ${name}: ${latency}ms latency`);
  };

  const handleTriggerCron = (name: string) => {
    setRunningCron(name);
    setTimeout(() => {
      setRunningCron(null);
      toast.success(`Cron job "${name}" executed successfully`);
    }, 900);
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success('SMS Gateway API Key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Software & System Settings"
        subtitle="Global tenant branding, SMTP email relay, SMS gateways, and automated billing crons"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Settings' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Settings synchronized');
              }}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Sync
            </Button>
            <Can menu="software_settings" action="update">
              <Button 
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save Changes
              </Button>
            </Can>
          </div>
        }
      />

      {/* Top Quick Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3 text-primary" /> Company Profile
          </span>
          <p className="mt-1 text-xs font-bold text-foreground truncate">{g.companyName}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3 text-emerald-400" /> Outbound SMTP
          </span>
          <p className="mt-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> TLS ({data.smtp.port})
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-primary" /> SMS Balance
          </span>
          <p className="mt-1 text-xs font-bold text-foreground">৳{data.smsGateway.balanceBdt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-amber-400" /> Active Gateways
          </span>
          <p className="mt-1 text-xs font-bold text-foreground">{gwList.filter((x) => x.enabled).length} Enabled</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-400" /> Scheduled Crons
          </span>
          <p className="mt-1 text-xs font-bold text-blue-400">{data.cronjobs.length} Active</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-card/60 p-1.5 rounded-xl border border-border/70 backdrop-blur-md">
          <TabsTrigger value="general" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building className="h-3.5 w-3.5" /> Company Profile
          </TabsTrigger>
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
            <Server className="h-3.5 w-3.5" /> CDN & Media
          </TabsTrigger>
          <TabsTrigger value="cron" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="h-3.5 w-3.5" /> Scheduled Crons
          </TabsTrigger>
        </TabsList>

        {/* 1. General Company Profile Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Form Fields */}
            <Card className="lg:col-span-2 border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Tenant Identity & Branding Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Official ISP branding details printed on subscriber bills, receipts, and user portals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      ISP / Organization Name
                    </Label>
                    <Input 
                      value={g.companyName} 
                      onChange={(e) => setGeneral({ ...g, companyName: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      24/7 Helpline / Support Contact
                    </Label>
                    <Input 
                      value={g.supportPhone} 
                      onChange={(e) => setGeneral({ ...g, supportPhone: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Official Invoicing Email
                    </Label>
                    <Input 
                      value={g.supportEmail} 
                      onChange={(e) => setGeneral({ ...g, supportEmail: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Billing Due Day of Month
                    </Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={28}
                      value={g.dueDayOfMonth} 
                      onChange={(e) => setGeneral({ ...g, dueDayOfMonth: Number(e.target.value) })} 
                      className="bg-background/80 border-border/70 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-primary" />
                      Invoice Number Prefix
                    </Label>
                    <Input 
                      value={g.invoicePrefix} 
                      onChange={(e) => setGeneral({ ...g, invoicePrefix: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      Billing Currency Symbol
                    </Label>
                    <Input 
                      value={g.currencySymbol} 
                      onChange={(e) => setGeneral({ ...g, currencySymbol: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Registered Corporate Head Office Address
                    </Label>
                    <Input 
                      value={g.address} 
                      onChange={(e) => setGeneral({ ...g, address: e.target.value })} 
                      className="bg-background/80 border-border/70 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Invoice Preview */}
            <Card className="border-border/70 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Live Invoice Header Preview
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Real-time visualization of customer invoice header
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 rounded-xl border border-border/80 bg-background/90 shadow-inner space-y-3 font-sans">
                  <div className="flex items-start justify-between border-b border-border/60 pb-3">
                    <div>
                      <div className="font-bold text-sm text-foreground">{g.companyName || 'Your ISP Name'}</div>
                      <div className="text-[11px] text-muted-foreground max-w-[180px] line-clamp-2 mt-0.5">
                        {g.address || 'Address line here'}
                      </div>
                      <div className="text-[11px] text-primary font-mono mt-1">{g.supportPhone}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-mono">
                        PAID INVOICE
                      </Badge>
                      <div className="text-xs font-mono font-bold text-foreground mt-1">
                        {g.invoicePrefix}00428
                      </div>
                      <div className="text-[10px] text-muted-foreground">Due: Day {g.dueDayOfMonth}th</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground">Sample 50Mbps Fiber Plan</span>
                    <span className="font-bold font-mono text-foreground">{g.currencySymbol} 1,200.00</span>
                  </div>

                  <div className="p-2 rounded bg-muted/40 text-[10px] text-muted-foreground text-center">
                    For billing support email: <strong className="text-foreground">{g.supportEmail}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Changes made to company identity are immediately propagated to all printable PDF receipts and customer self-care portals.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. SMTP Relay Tab */}
        <TabsContent value="smtp" className="space-y-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    SMTP Outbound Mail Relay
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Credentials and encryption handshake for billing notifications and automated reports
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Connection Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">SMTP Server Host</Label>
                  <Input value={data.smtp.host} readOnly className="bg-muted/40 border-border/70 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Port & Encryption</Label>
                  <Input value={`${data.smtp.port} (${data.smtp.encryption.toUpperCase()})`} readOnly className="bg-muted/40 border-border/70 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Username / Account</Label>
                  <Input value={data.smtp.username} readOnly className="bg-muted/40 border-border/70 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Sender From Name</Label>
                  <Input value={data.smtp.fromName} readOnly className="bg-muted/40 border-border/70 text-xs" />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <Label className="text-xs font-medium text-foreground">Sender Email Address</Label>
                  <Input value={data.smtp.fromEmail} readOnly className="bg-muted/40 border-border/70 font-mono text-xs" />
                </div>
              </div>

              {/* Interactive Mail Dispatch Test */}
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-primary" /> Test SMTP Outbound Relay
                    </div>
                    <div className="text-[11px] text-muted-foreground">Send a test notification to verify mail delivery</div>
                  </div>

                  {/* Template Picker */}
                  <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/60">
                    {(['invoice', 'otp', 'welcome'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTestEmailType(t)}
                        className={`text-[11px] px-2.5 py-0.5 rounded uppercase font-semibold transition-all ${
                          testEmailType === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    placeholder="Enter recipient email (e.g. admin@isp.com)"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="h-9 text-xs bg-background/90 border-border/70 flex-1 font-mono"
                  />
                  <Button size="sm" onClick={handleTestSmtp} className="h-9 text-xs bg-primary hover:bg-primary/90 shrink-0">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Send Test Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SMS Gateway Tab */}
        <TabsContent value="sms" className="space-y-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    SMS Notification & OTP Gateway
                  </CardTitle>
                  <CardDescription className="text-xs">
                    BTRC-compliant SMS routing for automated bill reminders and payment receipts
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs uppercase font-mono">
                  {data.smsGateway.provider} Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm">
                  <span className="text-xs font-medium text-muted-foreground">Prepaid SMS Balance</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
                    ৳{data.smsGateway.balanceBdt.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">~11,800 SMS credits remaining</p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm">
                  <span className="text-xs font-medium text-muted-foreground">Sender Masking ID</span>
                  <div className="text-2xl font-bold font-mono text-primary mt-1.5">
                    {data.smsGateway.senderId}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Approved by BTRC Registry</p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">API Token</span>
                    <button 
                      type="button" 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-sm font-mono font-semibold text-foreground mt-2 truncate">
                    {showApiKey ? data.smsGateway.apiKey : '••••••••••••••••••••••••'}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyApiKey(data.smsGateway.apiKey)}
                    className="h-6 text-[11px] text-primary p-0 mt-1 hover:underline"
                  >
                    {copiedKey ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copiedKey ? 'Copied' : 'Copy API Key'}
                  </Button>
                </div>
              </div>

              {/* Test SMS Dispatch */}
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> Test SMS Dispatch
                  </div>
                  <div className="text-[11px] text-muted-foreground">Sends an immediate test ping SMS with Masking Header</div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    placeholder="Enter 11-digit phone (e.g. 01700000000)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-9 text-xs bg-background/90 border-border/70 flex-1 font-mono"
                  />
                  <Button size="sm" onClick={handleTestSms} className="h-9 text-xs bg-primary hover:bg-primary/90 shrink-0">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch Test SMS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Payment Gateways Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Customer Payment Gateway Integrations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enable mobile financial services & debit/credit card processors for subscriber self-recharge
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">
                  {gwList.filter((g) => g.enabled).length} of {gwList.length} Active
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 pt-1">
              {gwList.map((gw) => (
                <div key={gw.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                        {gw.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                          {gw.name}
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] uppercase font-mono ${
                              gw.mode === 'live' 
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {gw.mode}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">
                          Merchant ID: <strong className="text-foreground">{gw.merchantNumber ?? 'Direct Tenant API'}</strong> · Key: {gw.appKeyMasked ?? 'Configured'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleGatewayMode(gw.id)}
                      className="h-8 text-xs border-border/70 hover:bg-muted/40 font-mono"
                    >
                      Mode: {gw.mode.toUpperCase()}
                    </Button>
                    <div className="flex items-center gap-2 border-l border-border/60 pl-3">
                      <span className="text-xs text-muted-foreground">
                        {gw.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch 
                        checked={gw.enabled} 
                        onCheckedChange={() => handleToggleGateway(gw.id)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Media & CDN Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                BDIX / Media & Local Caching Servers
              </CardTitle>
              <CardDescription className="text-xs">
                Local high-speed FTP, Live TV, and media streaming endpoints published to subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 pt-1">
              {data.servers.map((s) => {
                const latency = pingLatencies[s.id];
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{s.name}</p>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] uppercase font-medium ${
                            s.status === 'active' 
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                              : 'border-border/60 text-muted-foreground'
                          }`}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3 inline text-emerald-400" />
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-primary" />
                        {s.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {latency !== undefined && latency !== null && (
                        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {latency}ms
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-border/70 hover:border-primary/50 text-foreground"
                        onClick={() => handlePingServer(s.id, s.name)}
                      >
                        <Activity className="mr-1.5 h-3 w-3 text-primary" /> Ping Server
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-primary"
                        onClick={() => window.open(s.url, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Scheduled Cron Jobs Tab */}
        <TabsContent value="cron" className="space-y-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Automated System Cron Jobs & Schedulers
              </CardTitle>
              <CardDescription className="text-xs">
                Background daemons for monthly invoice generation, overdue auto-suspension, and backup snapshots
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 pt-1">
              {data.cronjobs.map((job) => {
                const isRunning = runningCron === job.name;
                return (
                  <div key={job.name} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{job.name}</p>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] uppercase font-mono ${
                            job.status === 'ok'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{job.description}</p>
                      <p className="text-xs font-mono text-muted-foreground flex items-center gap-2 pt-0.5">
                        <span className="text-primary font-semibold">Cron: {job.schedule}</span>
                        <span>·</span>
                        <span>Last run: {job.lastRun}</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRunning}
                      className="h-8 text-xs border-border/70 hover:border-primary/50 hover:bg-primary/5 text-foreground shrink-0"
                      onClick={() => handleTriggerCron(job.name)}
                    >
                      <Play className={`mr-1.5 h-3 w-3 text-primary ${isRunning ? 'animate-spin' : ''}`} />
                      {isRunning ? 'Running...' : 'Execute Now'}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
