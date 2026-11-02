'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Apple,
  Globe,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  History,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  pushService,
  type PushStatus,
  type PushCampaign,
  type CreateCampaignPayload,
} from '@/lib/api/services/push.service';

export function PushCampaignPage() {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Campaign Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'customers' | 'resellers' | 'employees'>('all');
  const [actionUrl, setActionUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [st, camps] = await Promise.all([
        pushService.getStatus(),
        pushService.getCampaigns(1, 20),
      ]);
      setStatus(st);
      setCampaigns(camps || []);
    } catch {
      toast.error('Failed to load push notification metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendCampaign = async () => {
    if (!title.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Notification message body is required');
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this push notification to audience "${audience}"?`)) {
      return;
    }

    setSending(true);
    try {
      const payload: CreateCampaignPayload = {
        title: title.trim(),
        body: body.trim(),
        audience_type: audience,
        action_url: actionUrl.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      };
      await pushService.sendCampaign(payload);
      toast.success('Push campaign broadcasted successfully!');
      setTitle('');
      setBody('');
      setActionUrl('');
      setImageUrl('');
      const camps = await pushService.getCampaigns(1, 20);
      setCampaigns(camps || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to broadcast campaign';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!title.trim() && !body.trim()) {
      toast.error('Please enter a title and message body for test');
      return;
    }

    setTesting(true);
    try {
      const res = await pushService.sendTestPush({
        title: title.trim() || 'Test Push Notification',
        body: body.trim() || 'This is a test notification from ISP Billing system.',
      });
      toast.success(res.message || 'Test push notification queued!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send test push';
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-primary" />
            FCM Push Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Dispatch instant push notifications to mobile and web app users for billing alerts, offers, and outages.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Users className="h-4 w-4 text-primary" />
            Total Devices
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{status?.total_devices ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Registered tokens</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Smartphone className="h-4 w-4 text-emerald-500" />
            Android
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{status?.android_devices ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Google FCM tokens</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Apple className="h-4 w-4 text-blue-500" />
            iOS
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{status?.ios_devices ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Apple APNs devices</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Globe className="h-4 w-4 text-amber-500" />
            Web Browser
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{status?.web_devices ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Web push subscribers</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Building2 className="h-4 w-4 text-indigo-500" />
            Active Tenants
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{status?.active_tenants ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">ISPs with active tokens</p>
        </Card>
      </div>

      {/* Campaign Sender & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Compose Push Broadcast
            </CardTitle>
            <CardDescription>
              Deliver real-time message to subscriber screens via Firebase Cloud Messaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                placeholder="e.g. Scheduled Network Maintenance Tonight"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notification Message *</Label>
              <Textarea
                placeholder="e.g. Dear customer, our upstream provider will undergo routine fiber maintenance from 2:00 AM to 5:00 AM."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="text-xs h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Audience</Label>
                <Select value={audience} onValueChange={(v) => v && setAudience(v as typeof audience)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users (Broad Reach)</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                    <SelectItem value="resellers">Resellers Only</SelectItem>
                    <SelectItem value="employees">Employees & Technicians</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Action Deep-link / URL (Optional)</Label>
                <Input
                  placeholder="/customer/payments or https://..."
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Banner Image URL (Optional)</Label>
              <Input
                placeholder="https://example.com/banner.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTest}
              disabled={testing || sending}
              className="text-xs"
            >
              {testing ? 'Sending Test...' : 'Send Test to My Device'}
            </Button>
            <Button
              size="sm"
              onClick={handleSendCampaign}
              disabled={sending || testing}
              className="gap-2 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Broadcasting...' : 'Broadcast Push Notification'}
            </Button>
          </CardFooter>
        </Card>

        {/* Live Mobile Mockup Preview */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              Device Lockscreen Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[280px] rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded bg-primary flex items-center justify-center">
                    <Bell className="h-2 w-2 text-white" />
                  </div>
                  <span className="font-semibold uppercase tracking-wider text-xs text-slate-300">ISP Billing</span>
                </div>
                <span>Just now</span>
              </div>

              <div>
                <h5 className="font-bold text-xs text-slate-100">
                  {title.trim() || 'Notification Title'}
                </h5>
                <p className="text-xs text-slate-300 mt-1 line-clamp-3">
                  {body.trim() || 'Your notification message preview will render here just as it appears on customer phones.'}
                </p>
              </div>

              {imageUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-700/60 aspect-video bg-slate-800">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Dispatch History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Campaign Dispatch History
          </CardTitle>
          <CardDescription>
            Audit log of sent push campaigns and delivery metrics.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                  No push campaigns recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{c.body}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {c.audience_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{c.total_targets}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {c.successful_deliveries}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-red-500 font-semibold">
                    {c.failed_deliveries}
                  </TableCell>
                  <TableCell>
                    <Badge tone="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {c.sent_at || c.created_at || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
