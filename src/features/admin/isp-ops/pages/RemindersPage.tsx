'use client';

import { useState } from 'react';
import {
  Bell,
  Search,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  X,
  Smartphone,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { useReminders, useResendReminder, useSendReminderNow } from '@/features/admin/sms/hooks/use-dunning';
import { useSmsRecipients, useSmsTemplateOptions } from '@/features/admin/sms/hooks/use-sms';
import { useDebouncedValue } from '@/features/admin/sms/hooks/use-debounced-value';
import type { MessageChannel, ReminderRow, SmsRecipient } from '@/features/admin/sms/types';

type ChannelFilter = 'all' | MessageChannel;
type StatusFilter = 'all' | 'queued' | 'sent' | 'failed';

const money = (n: number) => `৳${n.toLocaleString()}`;

export function RemindersPage() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedReminder, setSelectedReminder] = useState<ReminderRow | null>(null);
  const [isNewBroadcastOpen, setIsNewBroadcastOpen] = useState(false);

  // Send-now form
  const [customerQuery, setCustomerQuery] = useState('');
  const [customer, setCustomer] = useState<SmsRecipient | null>(null);
  const [newChannel, setNewChannel] = useState<MessageChannel>('sms');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const debouncedSearch = useDebouncedValue(search);
  const debouncedCustomerQuery = useDebouncedValue(customerQuery);
  const reminders = useReminders({ page, pageSize, search: debouncedSearch, status: statusFilter, channel: channelFilter });
  const customerResults = useSmsRecipients(
    { page: 1, pageSize: 8, search: debouncedCustomerQuery },
    isNewBroadcastOpen && debouncedCustomerQuery.trim().length > 1,
  );
  const templates = useSmsTemplateOptions();
  const sendNow = useSendReminderNow();
  const resend = useResendReminder();

  const rows = reminders.data?.items ?? [];
  const stats = reminders.data?.stats;

  const resetForm = () => {
    setCustomer(null);
    setCustomerQuery('');
    setNewTemplateId('');
    setNewMessage('');
    setNewChannel('sms');
  };

  const handleExportCsv = () => {
    const headers = ['Reminder ID', 'Customer Name', 'Phone', 'Area', 'Channel', 'Rule', 'Due (BDT)', 'Queued', 'Sent', 'Status', 'Error'];
    const csvRows = rows.map((r) => [
      r.id,
      r.customerName,
      r.mobile,
      r.area,
      r.channel.toUpperCase(),
      r.ruleName || (r.source === 'manual' ? 'Manual' : ''),
      r.amount ?? '',
      r.queuedAt,
      r.sentAt,
      r.status.toUpperCase(),
      r.error,
    ]);
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...csvRows].map((line) => line.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `reminders_page_${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSendNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Select a customer');
      return;
    }
    if (!newTemplateId && !newMessage.trim()) {
      toast.error('Choose a template or write a message');
      return;
    }
    sendNow.mutate(
      { customerId: customer.id, channel: newChannel, templateId: newTemplateId, message: newTemplateId ? '' : newMessage },
      {
        onSuccess: () => {
          toast.success(`Reminder sent to ${customer.name} via ${newChannel.toUpperCase()}`);
          setIsNewBroadcastOpen(false);
          resetForm();
        },
      },
    );
  };

  if (reminders.isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (reminders.isError && !reminders.data) {
    return (
      <EmptyState
        title="Failed to load collection reminders"
        description="Could not load the reminder log."
        actionLabel="Retry"
        onAction={() => reminders.refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Due Reminders & Broadcasts"
        subtitle="Automated dunning reminders and manual collection alerts over SMS and WhatsApp"
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
              disabled={rows.length === 0}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Page
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Queued Due Amount</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">{money(stats?.queuedAmount ?? 0)}</span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Package amounts of reminders waiting to be sent</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Queued Outbox</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">{stats?.queued ?? 0}</span>
              <span className="text-xs text-muted-foreground">in queue</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Waiting for the queue worker to dispatch</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">{stats?.sent ?? 0}</span>
              <span className="text-xs text-emerald-500 font-medium">accepted by gateway</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Of {stats?.total ?? 0} reminders logged</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Failed</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-rose-400 font-mono">{stats?.failed ?? 0}</span>
              <span className="text-xs text-rose-500 font-medium">rejected</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">See the gateway response in each reminder</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subscriber, phone or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'whatsapp', label: 'WhatsApp' },
                { key: 'sms', label: 'SMS' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={channelFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => {
                  setChannelFilter(pill.key);
                  setPage(1);
                }}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  channelFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              if (v) {
                setStatusFilter(v as StatusFilter);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[120px] bg-background/80">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No reminders found"
          description="Automated reminders appear here once a dunning rule fires; you can also send one manually."
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
                  <th className="py-3 px-4">Rule & Message</th>
                  <th className="py-3 px-4">Package Due</th>
                  <th className="py-3 px-4">Queued / Sent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((rem) => (
                  <tr
                    key={rem.id}
                    onClick={() => setSelectedReminder(rem)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {rem.customerName || `Customer #${rem.customerId}`}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{rem.mobile || '—'}</span>
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
                        )}
                      >
                        {rem.channel === 'whatsapp' ? <MessageSquare className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                        {rem.channel}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground text-xs">
                        {rem.ruleName || (rem.source === 'manual' ? 'Manual reminder' : 'Dunning rule')}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[260px] mt-0.5">{rem.message}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                      {rem.amount !== null ? money(rem.amount) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      <div>{rem.sentAt ? formatDateTime(rem.sentAt) : rem.queuedAt ? formatDateTime(rem.queuedAt) : '—'}</div>
                      <div className="text-[10px] text-muted-foreground/70">#{rem.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold',
                          rem.status === 'sent' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                          rem.status === 'queued' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                          rem.status === 'failed' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/60 px-4 py-2">
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={reminders.data?.meta.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Reminder inspector */}
      <Sheet open={Boolean(selectedReminder)} onOpenChange={(open) => !open && setSelectedReminder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedReminder && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                    {selectedReminder.channel} Channel
                  </Badge>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {selectedReminder.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedReminder.customerName || `Customer #${selectedReminder.customerId}`}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  #{selectedReminder.id}
                  {selectedReminder.amount !== null ? ` · Due: ${money(selectedReminder.amount)}` : ''}
                </SheetDescription>
              </SheetHeader>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Message Sent</span>
                  <span className="text-[10px] font-mono">{selectedReminder.ruleName || selectedReminder.source}</span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/50 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReminder.message}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Delivery</h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Recipient Mobile</span>
                  <span className="font-mono font-bold text-foreground">{selectedReminder.mobile || '—'}</span>
                </div>
                {selectedReminder.dueDate && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className="font-mono text-foreground">{selectedReminder.dueDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Queued</span>
                  <span className="font-mono text-foreground">
                    {selectedReminder.queuedAt ? formatDateTime(selectedReminder.queuedAt) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Gateway Response</span>
                  <span className={cn('font-mono text-[11px]', selectedReminder.status === 'failed' ? 'text-rose-400' : 'text-emerald-400')}>
                    {selectedReminder.status === 'failed'
                      ? selectedReminder.error || 'Failed'
                      : selectedReminder.status === 'sent'
                        ? `Sent ${selectedReminder.sentAt ? formatDateTime(selectedReminder.sentAt) : ''}`
                        : 'Waiting in queue'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/60">
                <Button
                  disabled={resend.isPending}
                  onClick={() =>
                    resend.mutate(selectedReminder.id, {
                      onSuccess: () => {
                        toast.success(`Reminder re-sent to ${selectedReminder.customerName || selectedReminder.mobile}`);
                        setSelectedReminder(null);
                      },
                    })
                  }
                  className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> {resend.isPending ? 'Sending…' : 'Resend Notification Now'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedReminder(null)} className="w-full text-xs h-9">
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Send-now dialog */}
      <Dialog
        open={isNewBroadcastOpen}
        onOpenChange={(open) => {
          setIsNewBroadcastOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Send className="h-4 w-4" />
              </div>
              Send Manual Due Reminder
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sends immediately; variables like {'{name}'} and {'{amount}'} are filled from the customer record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendNow} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Subscriber</label>
              {customer ? (
                <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-xs">
                  <span>
                    <span className="font-semibold">{customer.name}</span>{' '}
                    <span className="font-mono text-muted-foreground">({customer.mobile || 'no mobile'})</span>
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setCustomer(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Search by name or phone (min 2 characters)"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="text-xs h-9"
                  />
                  {debouncedCustomerQuery.trim().length > 1 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/40">
                      {customerResults.isFetching && !customerResults.data ? (
                        <p className="p-2 text-[11px] text-muted-foreground">Searching…</p>
                      ) : (customerResults.data?.items ?? []).length === 0 ? (
                        <p className="p-2 text-[11px] text-muted-foreground">No customers found.</p>
                      ) : (
                        (customerResults.data?.items ?? []).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCustomer(c)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50"
                          >
                            <span className="font-semibold">{c.name}</span>{' '}
                            <span className="font-mono text-muted-foreground">({c.mobile || 'no mobile'})</span>
                            {c.areaName && <span className="text-muted-foreground"> · {c.areaName}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Channel</label>
                <Select value={newChannel} onValueChange={(v) => v && setNewChannel(v as MessageChannel)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Gateway</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Template</label>
                <Select value={newTemplateId || 'custom'} onValueChange={(v) => setNewTemplateId(v && v !== 'custom' ? v : '')}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom message</SelectItem>
                    {(templates.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.templateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!newTemplateId && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Message</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Dear {name}, your bill of {amount} is due on {expire_date}."
                  className="text-xs h-20 font-mono"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={sendNow.isPending}
                className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 shadow-xs"
              >
                {sendNow.isPending ? 'Sending…' : 'Send Reminder Now'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
