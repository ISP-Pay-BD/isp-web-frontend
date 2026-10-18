'use client';

import { useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Bell,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Smartphone,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
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
import { formatDateTime, formatBdtWithSymbol, formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useReminders, useResendReminder, useSendReminderNow } from '@/features/admin/sms/hooks/use-dunning';
import { useSmsRecipients, useSmsTemplateOptions } from '@/features/admin/sms/hooks/use-sms';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { MessageChannel, ReminderRow, SmsRecipient } from '@/features/admin/sms/types';

type ChannelFilter = 'all' | MessageChannel;
type StatusFilter = 'all' | 'queued' | 'sent' | 'failed';

const money = (n: number) => `${formatBdtWithSymbol(n)}`;

export function RemindersPage() {
  const t = useTranslations();
  const channelLabel = (c: MessageChannel) => (c === 'whatsapp' ? 'WhatsApp' : 'SMS');
  const statusFilterItems = {
    all: t('admin.ops.reminders.allStatus', 'All Status'),
    queued: t('status.queued', 'Queued'),
    sent: t('status.sent', 'Sent'),
    failed: t('status.failed', 'Failed'),
  };
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

  const debouncedCustomerQuery = useDebouncedValue(customerQuery);
  const reminders = useReminders({ page, pageSize, search, status: statusFilter, channel: channelFilter });
  const customerResults = useSmsRecipients(
    { page: 1, pageSize: 8, search: debouncedCustomerQuery },
    isNewBroadcastOpen && debouncedCustomerQuery.trim().length > 1,
  );
  const templates = useSmsTemplateOptions();
  const channelItems = {
    sms: t('admin.ops.reminders.channelSms', 'SMS Gateway'),
    whatsapp: 'WhatsApp',
  };
  const templateItems: Record<string, string> = {
    custom: t('admin.ops.reminders.customMessage', 'Custom message'),
    ...Object.fromEntries((templates.data ?? []).map((tpl) => [tpl.id, tpl.templateName])),
  };
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
      toast.error(t('admin.ops.reminders.toast.selectCustomer', 'Select a customer'));
      return;
    }
    if (!newTemplateId && !newMessage.trim()) {
      toast.error(t('admin.ops.reminders.toast.chooseTemplate', 'Choose a template or write a message'));
      return;
    }
    sendNow.mutate(
      { customerId: customer.id, channel: newChannel, templateId: newTemplateId, message: newTemplateId ? '' : newMessage },
      {
        onSuccess: () => {
          toast.success(
            t('admin.ops.reminders.toast.sent', 'Reminder sent to {name} via {channel}', {
              name: customer.name,
              channel: channelLabel(newChannel),
            }),
          );
          setIsNewBroadcastOpen(false);
          resetForm();
        },
      },
    );
  };

  if (reminders.isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (reminders.isError && !reminders.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.reminders.loadFailed', 'Failed to load collection reminders')}
        description={t('admin.ops.reminders.loadFailedHint', 'Could not load the reminder log.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => reminders.refetch()}
      />
    );
  }

  const columns: LegacyColumnDef<ReminderRow, unknown>[] = [
    {
      id: 'subscriber',
      header: t('admin.ops.reminders.colSubscriber', 'Subscriber & Contact'),
      enableSorting: false,
      meta: { mobile: 'title' },
      cell: ({ row: { original: rem } }) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedReminder(rem)}
            className="text-left text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline"
          >
            {rem.customerName || t('admin.ops.reminders.customerNo', 'Customer #{id}', { id: rem.customerId })}
          </button>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="font-mono">{rem.mobile || '—'}</span>
            {rem.area && <span>· {rem.area}</span>}
          </div>
        </div>
      ),
    },
    {
      id: 'channel',
      header: t('admin.ops.reminders.colChannel', 'Channel'),
      enableSorting: false,
      cell: ({ row: { original: rem } }) => (
        <Badge
          variant="outline"
          tone={rem.channel === 'whatsapp' ? 'success' : rem.channel === 'sms' ? 'info' : undefined}
          className="capitalize text-xs font-semibold gap-1.5"
        >
          {rem.channel === 'whatsapp' ? <MessageSquare className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
          {channelLabel(rem.channel)}
        </Badge>
      ),
    },
    {
      id: 'rule',
      header: t('admin.ops.reminders.colRule', 'Rule & Message'),
      enableSorting: false,
      meta: { mobileLabel: t('admin.ops.reminders.colRule', 'Rule & Message') },
      cell: ({ row: { original: rem } }) => (
        <div>
          <div className="font-medium text-foreground text-xs">
            {rem.ruleName ||
              (rem.source === 'manual'
                ? t('admin.ops.reminders.manualReminder', 'Manual reminder')
                : t('admin.ops.reminders.dunningRule', 'Dunning rule'))}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2 md:truncate md:max-w-[260px] mt-0.5">{rem.message}</div>
        </div>
      ),
    },
    {
      id: 'due',
      header: t('admin.ops.reminders.colDue', 'Package Due'),
      enableSorting: false,
      cell: ({ row: { original: rem } }) => (
        <span className="font-mono font-bold text-primary text-sm">{rem.amount !== null ? money(rem.amount) : '—'}</span>
      ),
    },
    {
      id: 'queued',
      header: t('admin.ops.reminders.colQueuedSent', 'Queued / Sent'),
      enableSorting: false,
      cell: ({ row: { original: rem } }) => (
        <div className="font-mono text-xs text-muted-foreground">
          <div>{rem.sentAt ? formatDateTime(rem.sentAt) : rem.queuedAt ? formatDateTime(rem.queuedAt) : '—'}</div>
          <div className="text-xs text-muted-foreground/70">#{rem.id}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      enableSorting: false,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions', 'Action')}</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row: { original: rem } }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedReminder(rem)}
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
            aria-label={t('admin.ops.reminders.view', 'View reminder')}
            title={t('admin.ops.reminders.view', 'View reminder')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const hasFilters = Boolean(search) || channelFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title={t('admin.ops.reminders.title', 'Due Reminders & Broadcasts')}
        subtitle={t('admin.ops.reminders.subtitle', 'Automated dunning reminders and manual collection alerts over SMS and WhatsApp')}
        breadcrumb={[
          { label: t('common.crumb.admin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.collections', 'Collections') },
          { label: t('nav.collections-reminders', 'Reminders') },
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
              <Download className="h-3.5 w-3.5" /> {t('admin.ops.reminders.exportPage', 'Export Page')}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewBroadcastOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> {t('admin.ops.reminders.sendReminder', 'Send Reminder')}
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.reminders.kpiDueAmount', 'Queued Due Amount')}</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">{money(stats?.queuedAmount ?? 0)}</span>
              <span className="text-xs text-muted-foreground">{t('admin.ops.reminders.bdt', 'BDT')}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{t('admin.ops.reminders.kpiDueAmountHint', 'Package amounts of reminders waiting to be sent')}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.reminders.kpiOutbox', 'Queued Outbox')}</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">{formatCount(stats?.queued ?? 0)}</span>
              <span className="text-xs text-muted-foreground">{t('admin.ops.reminders.inQueue', 'in queue')}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{t('admin.ops.reminders.kpiOutboxHint', 'Waiting for the queue worker to dispatch')}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('status.sent', 'Sent')}</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">{formatCount(stats?.sent ?? 0)}</span>
              <span className="text-xs text-emerald-500 font-medium">{t('admin.ops.reminders.acceptedByGateway', 'accepted by gateway')}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{t('admin.ops.reminders.ofLogged', 'Of {n} reminders logged', { n: formatCount(stats?.total ?? 0) })}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.reminders.kpiFailed', 'Delivery Failed')}</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-rose-400 font-mono">{formatCount(stats?.failed ?? 0)}</span>
              <span className="text-xs text-rose-500 font-medium">{t('admin.ops.reminders.rejected', 'rejected')}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{t('admin.ops.reminders.kpiFailedHint', 'See the gateway response in each reminder')}</div>
          </CardContent>
        </Card>
      </div>

      {rows.length === 0 && !hasFilters ? (
        <EmptyState
          title={t('admin.ops.reminders.emptyTitle', 'No reminders found')}
          description={t('admin.ops.reminders.emptyNone', 'Automated reminders appear here once a dunning rule fires; you can also send one manually.')}
          actionLabel={t('admin.ops.reminders.sendNew', 'Send New Reminder')}
          onAction={() => setIsNewBroadcastOpen(true)}
        />
      ) : (
        <DataTable
          urlState
          className={cn(reminders.isFetching && 'opacity-80')}
          columns={columns}
          data={rows}
          getRowId={(rem) => rem.id}
          enableColumnVisibility={false}
          searchPlaceholder={t('admin.ops.reminders.searchPlaceholder', 'Search by subscriber, phone or message...')}
          emptyTitle={t('admin.ops.reminders.emptyTitle', 'No reminders found')}
          emptyDescription={t('admin.ops.reminders.emptyFiltered', 'Nothing matches the current search or filters.')}
          toolbarActions={
            <>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
                {(
                  [
                    { key: 'all', label: t('admin.ops.reminders.pillAll', 'All') },
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
                      'text-xs h-7 px-2.5 font-medium transition',
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
                items={statusFilterItems}
                onValueChange={(v) => {
                  if (v) {
                    setStatusFilter(v as StatusFilter);
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger aria-label={t('common.status', 'Status')} className="h-9 text-xs min-w-[120px] bg-background/80">
                  <SelectValue placeholder={t('common.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{statusFilterItems.all}</SelectItem>
                  <SelectItem value="queued">{statusFilterItems.queued}</SelectItem>
                  <SelectItem value="sent">{statusFilterItems.sent}</SelectItem>
                  <SelectItem value="failed">{statusFilterItems.failed}</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
          server={{
            page,
            pageSize,
            total: reminders.data?.meta.total ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            search,
            onSearchChange: (value) => {
              setSearch(value);
              setPage(1);
            },
          }}
        />
      )}

      {/* Reminder inspector */}
      <Sheet open={Boolean(selectedReminder)} onOpenChange={(open) => !open && setSelectedReminder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedReminder && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                    {t('admin.ops.reminders.channelBadge', '{channel} Channel', { channel: channelLabel(selectedReminder.channel) })}
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {t(`status.${selectedReminder.status}`, selectedReminder.status)}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedReminder.customerName ||
                    t('admin.ops.reminders.customerNo', 'Customer #{id}', { id: selectedReminder.customerId })}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  #{selectedReminder.id}
                  {selectedReminder.amount !== null
                    ? ` · ${t('admin.ops.reminders.dueAmount', 'Due: {amount}', { amount: money(selectedReminder.amount) })}`
                    : ''}
                </SheetDescription>
              </SheetHeader>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>{t('admin.ops.reminders.messageSent', 'Message Sent')}</span>
                  <span className="text-xs font-mono">{selectedReminder.ruleName ||
                      t(`admin.ops.reminders.source.${selectedReminder.source}`, selectedReminder.source)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/50 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReminder.message}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-xs">{t('admin.ops.reminders.delivery', 'Delivery')}</h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">{t('admin.ops.reminders.recipientMobile', 'Recipient Mobile')}</span>
                  <span className="font-mono font-bold text-foreground">{selectedReminder.mobile || '—'}</span>
                </div>
                {selectedReminder.dueDate && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-muted-foreground">{t('admin.ops.reminders.expiryDate', 'Expiry Date')}</span>
                    <span className="font-mono text-foreground">{selectedReminder.dueDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">{t('status.queued', 'Queued')}</span>
                  <span className="font-mono text-foreground">
                    {selectedReminder.queuedAt ? formatDateTime(selectedReminder.queuedAt) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">{t('admin.ops.reminders.gatewayResponse', 'Gateway Response')}</span>
                  <span className={cn('font-mono text-xs', selectedReminder.status === 'failed' ? 'text-rose-400' : 'text-emerald-400')}>
                    {selectedReminder.status === 'failed'
                      ? selectedReminder.error || t('status.failed', 'Failed')
                      : selectedReminder.status === 'sent'
                        ? t('admin.ops.reminders.sentAt', 'Sent {date}', {
                            date: selectedReminder.sentAt ? formatDateTime(selectedReminder.sentAt) : '',
                          }).trim()
                        : t('admin.ops.reminders.waiting', 'Waiting in queue')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/60">
                <Button
                  disabled={resend.isPending}
                  onClick={() =>
                    resend.mutate(selectedReminder.id, {
                      onSuccess: () => {
                        toast.success(
                          t('admin.ops.reminders.toast.resent', 'Reminder re-sent to {name}', {
                            name: selectedReminder.customerName || selectedReminder.mobile,
                          }),
                        );
                        setSelectedReminder(null);
                      },
                    })
                  }
                  className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> {resend.isPending ? t('admin.ops.reminders.sending', 'Sending…') : t('admin.ops.reminders.resend', 'Resend Notification Now')}
                </Button>
                <Button variant="outline" onClick={() => setSelectedReminder(null)} className="w-full text-xs h-9">
                  {t('common.close', 'Close')}
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
              {t('admin.ops.reminders.dialogTitle', 'Send Manual Due Reminder')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t(
                'admin.ops.reminders.dialogDesc',
                'Sends immediately; variables like {name} and {amount} are filled from the customer record.',
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendNow} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">{t('admin.ops.reminders.fieldSubscriber', 'Subscriber')}</label>
              {customer ? (
                <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-xs">
                  <span>
                    <span className="font-semibold">{customer.name}</span>{' '}
                    <span className="font-mono text-muted-foreground">({customer.mobile || t('admin.ops.reminders.noMobile', 'no mobile')})</span>
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setCustomer(null)}>
                    {t('admin.ops.reminders.change', 'Change')}
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder={t('admin.ops.reminders.customerSearch', 'Search by name or phone (min 2 characters)')}
                    aria-label={t('admin.ops.reminders.customerSearch', 'Search by name or phone (min 2 characters)')}
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="text-xs h-9"
                  />
                  {debouncedCustomerQuery.trim().length > 1 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/40">
                      {customerResults.isFetching && !customerResults.data ? (
                        <p className="p-2 text-xs text-muted-foreground">{t('admin.ops.reminders.searching', 'Searching…')}</p>
                      ) : (customerResults.data?.items ?? []).length === 0 ? (
                        <p className="p-2 text-xs text-muted-foreground">{t('admin.ops.reminders.noCustomers', 'No customers found.')}</p>
                      ) : (
                        (customerResults.data?.items ?? []).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCustomer(c)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50"
                          >
                            <span className="font-semibold">{c.name}</span>{' '}
                            <span className="font-mono text-muted-foreground">({c.mobile || t('admin.ops.reminders.noMobile', 'no mobile')})</span>
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
                <label className="text-xs font-semibold">{t('admin.ops.reminders.colChannel', 'Channel')}</label>
                <Select value={newChannel} items={channelItems} onValueChange={(v) => v && setNewChannel(v as MessageChannel)}>
                  <SelectTrigger aria-label={t('admin.ops.reminders.colChannel', 'Channel')} className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">{channelItems.sms}</SelectItem>
                    <SelectItem value="whatsapp">{channelItems.whatsapp}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t('admin.ops.reminders.fieldTemplate', 'Template')}</label>
                <Select value={newTemplateId || 'custom'} items={templateItems} onValueChange={(v) => setNewTemplateId(v && v !== 'custom' ? v : '')}>
                  <SelectTrigger aria-label={t('admin.ops.reminders.fieldTemplate', 'Template')} className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{templateItems.custom}</SelectItem>
                    {(templates.data ?? []).map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.templateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!newTemplateId && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{t('admin.ops.reminders.fieldMessage', 'Message')}</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('admin.ops.reminders.messagePlaceholder', 'Dear {name}, your bill of {amount} is due on {expire_date}.')}
                  aria-label={t('admin.ops.reminders.fieldMessage', 'Message')}
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
                {sendNow.isPending ? t('admin.ops.reminders.sending', 'Sending…') : t('admin.ops.reminders.sendNow', 'Send Reminder Now')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
