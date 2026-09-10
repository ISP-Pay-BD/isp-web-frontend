'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  Search,
  Plus,
  Send,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Filter,
  X,
  ChevronRight,
  Sparkles,
  Smartphone,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ReminderRow } from '@/data/admin/isp-ops.data';

type ChannelFilter = 'all' | 'sms' | 'whatsapp' | 'email' | 'voice';
type StatusFilter = 'all' | 'queued' | 'sent' | 'delivered' | 'failed';

export function RemindersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedReminder, setSelectedReminder] = useState<ReminderRow | null>(null);
  const [isNewBroadcastOpen, setIsNewBroadcastOpen] = useState(false);

  // Broadcast state
  const [newCustomer, setNewCustomer] = useState('');
  const [newChannel, setNewChannel] = useState<'sms' | 'whatsapp' | 'email' | 'voice'>('whatsapp');
  const [newDue, setNewDue] = useState('1200');
  const [newTemplate, setNewTemplate] = useState('Due Date Alert (Day 0)');

  const rawReminders = useMemo(() => data?.reminders ?? [], [data?.reminders]);

  // Aggregate Metrics
  const totalDueBdt = useMemo(
    () => rawReminders.reduce((s, r) => s + r.dueBdt, 0),
    [rawReminders]
  );
  const queuedCount = useMemo(
    () => rawReminders.filter((r) => r.status === 'queued').length,
    [rawReminders]
  );
  const sentCount = useMemo(
    () => rawReminders.filter((r) => r.status === 'sent' || r.status === 'delivered').length,
    [rawReminders]
  );
  const failedCount = useMemo(
    () => rawReminders.filter((r) => r.status === 'failed').length,
    [rawReminders]
  );

  const filteredReminders = useMemo(() => {
    return rawReminders.filter((rem) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          rem.customerName.toLowerCase().includes(q) ||
          (rem.reminderNo && rem.reminderNo.toLowerCase().includes(q)) ||
          (rem.customerPhone && rem.customerPhone.toLowerCase().includes(q)) ||
          rem.template.toLowerCase().includes(q) ||
          (rem.area && rem.area.toLowerCase().includes(q)) ||
          String(rem.dueBdt).includes(q);
        if (!match) return false;
      }
      if (channelFilter !== 'all' && rem.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && rem.status !== statusFilter) return false;
      return true;
    });
  }, [rawReminders, search, channelFilter, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Reminder ID',
      'Customer Name',
      'Phone',
      'Area',
      'Channel',
      'Template',
      'Due (BDT)',
      'Scheduled / Sent',
      'Status',
      'Delivery Info',
    ];
    const rows = filteredReminders.map((r) => [
      r.reminderNo ?? r.id,
      r.customerName,
      r.customerPhone ?? 'N/A',
      r.area ?? 'N/A',
      r.channel.toUpperCase(),
      r.template,
      r.dueBdt,
      r.sentAt ?? r.scheduledAt,
      r.status.toUpperCase(),
      r.deliveryResponse ?? 'N/A',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `reminders_log_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reminders log exported to CSV');
  };

  const handleTriggerBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer) {
      toast.error('Please enter customer name');
      return;
    }
    toast.success(`Reminder queued for ${newCustomer} via ${newChannel.toUpperCase()}`);
    setIsNewBroadcastOpen(false);
    setNewCustomer('');
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load collection reminders"
        description="Could not connect to notification dispatch service."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Due Reminders & Broadcasts"
        subtitle="Automated collection reminders across WhatsApp, SMS, IVR Voice, and Email"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Collections' },
          { label: 'Reminders' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Log
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewBroadcastOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Send Reminder
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Due Target
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ৳{totalDueBdt.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Total outstanding balance targeted for recovery
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Queued Outbox
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">
                {queuedCount}
              </span>
              <span className="text-xs text-muted-foreground">in schedule</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Awaiting automatic batch dispatcher trigger
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivered Today
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                {sentCount}
              </span>
              <span className="text-xs text-emerald-500 font-medium">delivered</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              WhatsApp, SMS & Push confirmations verified
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivery Failed
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-rose-400 font-mono">
                {failedCount}
              </span>
              <span className="text-xs text-rose-500 font-medium">unreachable</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Invalid MSISDN or voice busy signals
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subscriber, phone, area, or template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'whatsapp', label: 'WhatsApp' },
                { key: 'sms', label: 'SMS' },
                { key: 'voice', label: 'Voice IVR' },
                { key: 'email', label: 'Email' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={channelFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setChannelFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  channelFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 text-xs w-[120px] bg-background/80">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {filteredReminders.length === 0 ? (
        <EmptyState
          title="No reminders found"
          description="No reminder logs match the current search criteria."
          actionLabel="Send New Reminder"
          onAction={() => setIsNewBroadcastOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Subscriber & Contact</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Notification Template</th>
                  <th className="py-3 px-4">Outstanding Due</th>
                  <th className="py-3 px-4">Scheduled / Sent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredReminders.map((rem) => {
                  const isQueued = rem.status === 'queued';
                  const isDelivered = rem.status === 'delivered' || rem.status === 'sent';
                  const isFailed = rem.status === 'failed';

                  return (
                    <tr
                      key={rem.id}
                      onClick={() => setSelectedReminder(rem)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {rem.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{rem.customerPhone ?? '+880 1700-000000'}</span>
                          {rem.area && <span>· {rem.area}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold gap-1.5',
                            rem.channel === 'whatsapp' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            rem.channel === 'sms' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            rem.channel === 'voice' && 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                            rem.channel === 'email' && 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          )}
                        >
                          {rem.channel === 'whatsapp' && <MessageSquare className="h-3 w-3" />}
                          {rem.channel === 'sms' && <Smartphone className="h-3 w-3" />}
                          {rem.channel === 'voice' && <Phone className="h-3 w-3" />}
                          {rem.channel === 'email' && <Mail className="h-3 w-3" />}
                          {rem.channel}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{rem.template}</div>
                        {rem.messagePreview && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-[260px] mt-0.5">
                            {rem.messagePreview}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        ৳{rem.dueBdt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        <div>{rem.sentAt ?? rem.scheduledAt}</div>
                        <div className="text-[10px] text-muted-foreground/70">{rem.reminderNo ?? rem.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold',
                            isDelivered && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            isQueued && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                            isFailed && 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}
                        >
                          {rem.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReminder(rem)}
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reminder Deep-Dive Inspector Sheet */}
      <Sheet open={Boolean(selectedReminder)} onOpenChange={(open) => !open && setSelectedReminder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedReminder && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20"
                  >
                    {selectedReminder.channel} Channel
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize text-[10px]',
                      selectedReminder.status === 'delivered' || selectedReminder.status === 'sent'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : selectedReminder.status === 'queued'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    )}
                  >
                    {selectedReminder.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedReminder.customerName}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  {selectedReminder.reminderNo ?? selectedReminder.id} · Due: ৳{selectedReminder.dueBdt.toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              {/* Message Payload Preview */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Dispatch Payload Content</span>
                  <span className="text-[10px] font-mono">{selectedReminder.template}</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/50 text-xs text-foreground leading-relaxed italic">
                  "{selectedReminder.messagePreview ?? 'Official due warning informing customer of outstanding balance.'}"
                </div>
              </div>

              {/* Delivery Diagnostics */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Carrier & Gateway Telemetry
                </h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Recipient Mobile</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedReminder.customerPhone ?? '+880 1700-000000'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Scheduled Dispatch</span>
                  <span className="font-mono text-foreground">{selectedReminder.scheduledAt}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Gateway Response</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {selectedReminder.deliveryResponse ?? 'Delivered via Telecommunication API'}
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2 pt-4 border-t border-border/60">
                <Button
                  onClick={() => {
                    toast.success(`Resent reminder to ${selectedReminder.customerName} via ${selectedReminder.channel.toUpperCase()}`);
                    setSelectedReminder(null);
                  }}
                  className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Resend Notification Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReminder(null)}
                  className="w-full text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New Reminder Dispatch Dialog */}
      <Dialog open={isNewBroadcastOpen} onOpenChange={setIsNewBroadcastOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Send className="h-4 w-4" />
              </div>
              Send Manual Due Reminder
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch an instant collection alert or payment link to subscriber.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTriggerBroadcast} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Subscriber Name / Username</label>
              <Input
                placeholder="e.g. Rahim Uddin"
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Channel</label>
                <Select value={newChannel} onValueChange={(v) => v && setNewChannel(v as typeof newChannel)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp Direct</SelectItem>
                    <SelectItem value="sms">SMS Gateway</SelectItem>
                    <SelectItem value="voice">IVR Voice Call</SelectItem>
                    <SelectItem value="email">Email Mushak 6.3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Due Amount (৳ BDT)</label>
                <Input
                  type="number"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notification Template</label>
              <Select value={newTemplate} onValueChange={(v) => v && setNewTemplate(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Friendly Due Warning (Day -3)">Friendly Due Warning (Day -3)</SelectItem>
                  <SelectItem value="Due Date Alert (Day 0)">Due Date Alert (Day 0)</SelectItem>
                  <SelectItem value="Pre-Cutoff Notice (Day +5)">Pre-Cutoff Notice (Day +5)</SelectItem>
                  <SelectItem value="Emergency Suspension Warning">Emergency Suspension Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 shadow-xs"
              >
                Send Reminder Now
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
