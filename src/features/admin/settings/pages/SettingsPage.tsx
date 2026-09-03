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
import { Settings, Mail, MessageSquare, CreditCard, Server, Clock } from 'lucide-react';
import { useSoftwareSettings } from '../hooks/use-settings';

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSoftwareSettings();
  const [general, setGeneral] = useState(data?.general);

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load settings" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const g = general ?? data.general;

  const handleSave = () => {
    toast.success('Software settings saved (mock)');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Software Settings"
        subtitle="Configure company profile, gateways, servers, and cron jobs"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Settings' }]}
        actions={
          <Can menu="software_settings" action="update">
            <Button onClick={handleSave}>Save Changes</Button>
          </Can>
        }
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1.5"><Settings className="h-3.5 w-3.5" />General</TabsTrigger>
          <TabsTrigger value="smtp" className="gap-1.5"><Mail className="h-3.5 w-3.5" />SMTP</TabsTrigger>
          <TabsTrigger value="sms" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" />SMS Gateway</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Payment</TabsTrigger>
          <TabsTrigger value="servers" className="gap-1.5"><Server className="h-3.5 w-3.5" />Servers</TabsTrigger>
          <TabsTrigger value="cron" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Cron Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name</Label><Input value={g.companyName} onChange={(e) => setGeneral({ ...g, companyName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Support Phone</Label><Input value={g.supportPhone} onChange={(e) => setGeneral({ ...g, supportPhone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Support Email</Label><Input value={g.supportEmail} onChange={(e) => setGeneral({ ...g, supportEmail: e.target.value })} /></div>
              <div className="space-y-2"><Label>Invoice Due Day</Label><Input type="number" value={g.dueDayOfMonth} onChange={(e) => setGeneral({ ...g, dueDayOfMonth: Number(e.target.value) })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={g.address} onChange={(e) => setGeneral({ ...g, address: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card>
            <CardHeader><CardTitle className="text-base">SMTP Configuration</CardTitle><CardDescription>Outbound email for invoices and notifications</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Host</Label><Input value={data.smtp.host} readOnly /></div>
              <div className="space-y-2"><Label>Port</Label><Input value={data.smtp.port} readOnly /></div>
              <div className="space-y-2"><Label>From Name</Label><Input value={data.smtp.fromName} readOnly /></div>
              <div className="space-y-2"><Label>From Email</Label><Input value={data.smtp.fromEmail} readOnly /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader><CardTitle className="text-base">SMS Gateway</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center"><span>Provider</span><Badge>{data.smsGateway.provider}</Badge></div>
              <div className="flex justify-between items-center"><span>Sender ID</span><span className="font-mono">{data.smsGateway.senderId}</span></div>
              <div className="flex justify-between items-center"><span>Balance</span><span className="font-bold text-primary">৳{data.smsGateway.balanceBdt.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Gateways</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {data.paymentGateways.map((gw) => (
                <div key={gw.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{gw.name}</p>
                    <p className="text-xs text-muted-foreground">{gw.mode} · {gw.merchantNumber ?? 'N/A'}</p>
                  </div>
                  <Switch checked={gw.enabled} onCheckedChange={() => toast.success(`${gw.name} toggled`)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers">
          <Card>
            <CardHeader><CardTitle className="text-base">CDN / Media Servers</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {data.servers.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{s.url}</p>
                  </div>
                  <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron">
          <Card>
            <CardHeader><CardTitle className="text-base">Scheduled Cron Jobs</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {data.cronjobs.map((job) => (
                <div key={job.name} className="py-3 flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.description}</p>
                    <p className="text-xs font-mono mt-1">{job.schedule} · Last: {job.lastRun}</p>
                  </div>
                  <Badge variant={job.status === 'ok' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>{job.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
