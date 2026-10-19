'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { ArrowLeft, Send, User, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { useReplyTicket, useSupportTicket, useTicketStatus, useTransferTicket } from '../hooks/use-support';
import { TICKET_CATEGORIES, TICKET_STATUS_LABEL, type TicketStatus } from '../types';

export function SupportTicketDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const ticketId = String(params?.id ?? '');
  const ticket = useSupportTicket(ticketId);
  const replyTicket = useReplyTicket(ticketId);
  const setStatus = useTicketStatus(ticketId);
  const transfer = useTransferTicket(ticketId);
  const [reply, setReply] = useState('');
  const [assignTo, setAssignTo] = useState('');

  if (ticket.isLoading) return <PageSkeleton variant="detail" />;
  if (ticket.isError || !ticket.data) {
    return (
      <EmptyState
        title={t('admin.support.detail.notFound', 'Ticket not found')}
        description={
          ticket.isError
            ? errorMessage(ticket.error, t('admin.support.detail.notFoundHint', 'This support ticket may have been deleted.'))
            : t('admin.support.detail.notFoundHint', 'This support ticket may have been deleted.')
        }
        actionLabel={t('admin.support.detail.backToTickets', 'Back to tickets')}
        onAction={() => router.push('/admin/support')}
      />
    );
  }

  const tk = ticket.data;
  const knownCategory = TICKET_CATEGORIES.find((c) => c.value === tk.category);
  const categoryLabel = knownCategory ? t(`admin.support.category.${knownCategory.value}`, knownCategory.label) : tk.category || '—';
  const statusLabel = (s: TicketStatus) => t(`admin.support.status.${s}`, TICKET_STATUS_LABEL[s]);
  const statusItems = Object.fromEntries((Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => [s, statusLabel(s)]));

  const handleSendReply = () => {
    if (!reply.trim()) return;
    replyTicket.mutate(reply.trim(), {
      onSuccess: () => {
        setReply('');
        toast.success(t('admin.support.detail.replySent', 'Reply sent'));
      },
    });
  };

  const handleStatusChange = (v: string | null) => {
    if (!v || v === tk.status) return;
    setStatus.mutate(v as TicketStatus, {
      onSuccess: () => toast.success(t('admin.support.detail.statusChanged', 'Ticket marked {status}', { status: statusLabel(v as TicketStatus) })),
    });
  };

  const handleAssign = () => {
    if (!assignTo) return;
    transfer.mutate([assignTo], {
      onSuccess: () => {
        toast.success(t('admin.support.detail.assigned', 'Ticket assigned'));
        setAssignTo('');
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={tk.subject}
        subtitle={t('admin.support.detail.subtitle', 'Ticket #{id} · {name}', { id: tk.id, name: tk.customerName })}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Support', url: '/admin/support' },
          { label: `#${tk.id}` },
        ]}
        actions={
          <Link href="/admin/support" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back', 'Back')}
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col min-h-[480px]">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">{t('admin.support.detail.thread', 'Message Thread')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {tk.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.support.detail.noMessages', 'No messages yet.')}</p>
            ) : (
              tk.messages.map((msg) => {
                const staff = !msg.fromCustomer;
                return (
                  <div key={msg.id} className={cn('flex gap-3 max-w-[90%]', staff ? 'ml-auto flex-row-reverse' : '')}>
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', staff ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className={cn('rounded-lg px-3 py-2 text-sm space-y-1', staff ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <p className="text-xs font-semibold opacity-80">
                        {msg.senderName}
                        {msg.mine ? ` ${t('admin.support.detail.you', '(you)')}` : ''}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-xs opacity-70">{msg.sentAt ? formatDateTime(msg.sentAt) : ''}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <Can menu="support" action="send_msg">
            <div className="border-t p-4 space-y-2">
              <Textarea placeholder={t('admin.support.detail.replyPlaceholder', 'Write your reply...')} value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[80px]" />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!reply.trim() || replyTicket.isPending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {replyTicket.isPending ? t('admin.support.detail.sending', 'Sending…') : t('admin.support.detail.sendReply', 'Send Reply')}
                </Button>
              </div>
            </div>
          </Can>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.support.detail.details', 'Ticket Details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.detail.openedBy', 'Opened by')}</span>
              <span className="font-medium text-right">
                {tk.customerName}
                {tk.customerMobile && <span className="block text-xs font-mono text-muted-foreground">{tk.customerMobile}</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.dialog.category', 'Category')}</span>
              <span>{categoryLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.col.priority', 'Priority')}</span>
              <Badge className="capitalize">{t(`admin.support.priority.${tk.priority}`, tk.priority)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('admin.support.col.status', 'Status')}</span>
              <Select value={tk.status} items={statusItems} onValueChange={handleStatusChange} disabled={setStatus.isPending}>
                <SelectTrigger aria-label={t('admin.support.ticketStatus', 'Ticket status')} className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusItems[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.detail.created', 'Created')}</span>
              <span>{tk.createdAt ? formatDateTime(tk.createdAt) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.detail.lastActivity', 'Last activity')}</span>
              <span>{tk.lastActivityAt ? formatDateTime(tk.lastActivityAt) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.support.detail.firstResponse', 'First response')}</span>
              <span>
                {tk.firstResponseMinutes === null
                  ? t('admin.support.detail.awaitingReply', 'Awaiting reply')
                  : t('admin.support.detail.minutes', '{n} min', { n: tk.firstResponseMinutes })}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">{t('admin.support.detail.assignedTo', 'Assigned')}</span>
              <span className="text-right">{tk.assigneeNames.length ? tk.assigneeNames.join(', ') : '—'}</span>
            </div>
            {tk.remarks && (
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('admin.support.detail.remarks', 'Remarks')}</span>
                <p className="text-xs bg-muted/40 rounded p-2">{tk.remarks}</p>
              </div>
            )}
            {tk.employees.length > 0 && (
              <Can menu="support" action="update">
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-muted-foreground text-xs font-semibold">{t('admin.support.detail.assignToEmployee', 'Assign to employee')}</span>
                  <div className="flex gap-2">
                    <Select value={assignTo} onValueChange={(v) => setAssignTo(v ?? '')}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder={t('admin.support.detail.chooseEmployee', 'Choose employee...')} />
                      </SelectTrigger>
                      <SelectContent>
                        {tk.employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-8 gap-1" disabled={!assignTo || transfer.isPending} onClick={handleAssign}>
                      <UserPlus className="h-3.5 w-3.5" />
                      {t('admin.support.detail.assign', 'Assign')}
                    </Button>
                  </div>
                </div>
              </Can>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
