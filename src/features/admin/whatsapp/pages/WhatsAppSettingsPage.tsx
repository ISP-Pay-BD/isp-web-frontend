'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppSettingsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [settings, setSettings] = useState(data?.settings);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load settings" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const cfg = settings ?? data.settings;

  const handleSave = () => {
    toast.success('WhatsApp settings saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Settings"
        subtitle="Configure Meta Cloud API and WAHA session integration"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'WhatsApp' }, { label: 'Settings' }]}
        actions={
          <Can menu="whatsapp_business" action="update">
            <Button onClick={handleSave}>Save Settings</Button>
          </Can>
        }
      />
      <WhatsAppNavLinks />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Meta Cloud API
              <Badge variant={cfg.meta.enabled ? 'default' : 'secondary'}>{cfg.meta.enabled ? 'Enabled' : 'Disabled'}</Badge>
            </CardTitle>
            <CardDescription>Official WhatsApp Business Platform credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label>App ID</Label><Input value={cfg.meta.appId} readOnly className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label>Phone Number ID</Label><Input value={cfg.meta.phoneNumberId} readOnly className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label>Webhook URL</Label><Input value={cfg.meta.webhookUrl} readOnly className="font-mono text-xs" /></div>
            <p className="text-xs text-muted-foreground">Access token: {cfg.meta.hasAccessToken ? 'Configured' : 'Not set'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              WAHA Session
              <Badge variant={cfg.waha.sessionStatus === 'CONNECTED' ? 'default' : 'secondary'}>{cfg.waha.sessionStatus}</Badge>
            </CardTitle>
            <CardDescription>Self-hosted WhatsApp HTTP API bridge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label>Server URL</Label><Input value={cfg.waha.serverUrl} readOnly className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label>Active Session</Label><Input value={cfg.waha.activeSessionName} readOnly /></div>
            <p className="text-xs text-muted-foreground">API key: {cfg.waha.hasApiKey ? 'Configured' : 'Not set'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Notification Automation</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {[
            { key: 'sendBillAlert' as const, label: 'Send bill alerts via WhatsApp' },
            { key: 'sendPaymentReceipt' as const, label: 'Send payment receipts' },
            { key: 'sendExpiryWarning' as const, label: 'Send expiry warnings' },
            { key: 'autoAiReply' as const, label: 'Enable AI auto-reply (beta)' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <span className="text-sm">{item.label}</span>
              <Switch
                checked={cfg.notifications[item.key]}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...cfg,
                    notifications: { ...cfg.notifications, [item.key]: checked },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
