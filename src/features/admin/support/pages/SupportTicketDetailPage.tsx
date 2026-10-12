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
import { useReplyTicket, useSupportTicket, useTicketStatus, useTransferTicket } from '../hooks/use-support';
import { TICKET_CATEGORIES, TICKET_STATUS_LABEL, type TicketStatus } from '../types';

export function SupportTicketDetailPage() {
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
        title="Ticket not found"
        description={ticket.isError ? errorMessage(ticket.error, 'This support ticket may have been deleted.') : 'This support ticket may have been deleted.'}
        actionLabel="Back to tickets"
        onAction={() => router.push('/admin/support')}
      />
    );
  }

  const t = ticket.data;
  const categoryLabel = TICKET_CATEGORIES.find((c) => c.value === t.category)?.label ?? (t.category || '—');

  const handleSendReply = () => {
    if (!reply.trim()) return;
    replyTicket.mutate(reply.trim(), {
      onSuccess: () => {
        setReply('');
        toast.success('Reply sent');
      },
    });
  };

  const handleStatusChange = (v: string | null) => {
    if (!v || v === t.status) return;
    setStatus.mutate(v as TicketStatus, { onSuccess: () => toast.success(`Ticket marked ${TICKET_STATUS_LABEL[v as TicketStatus]}`) });
  };

  const handleAssign = () => {
    if (!assignTo) return;
    transfer.mutate([assignTo], {
      onSuccess: () => {
        toast.success('Ticket assigned');
        setAssignTo('');
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.subject}
        subtitle={`Ticket #${t.id} · ${t.customerName}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Support', url: '/admin/support' },
          { label: `#${t.id}` },
        ]}
        actions={
          <Link href="/admin/support" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col min-h-[480px]">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">Message Thread</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {t.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              t.messages.map((msg) => {
                const staff = !msg.fromCustomer;
                return (
                  <div key={msg.id} className={cn('flex gap-3 max-w-[90%]', staff ? 'ml-auto flex-row-reverse' : '')}>
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', staff ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className={cn('rounded-lg px-3 py-2 text-sm space-y-1', staff ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <p className="text-xs font-semibold opacity-80">
                        {msg.senderName}
                        {msg.mine ? ' (you)' : ''}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-[10px] opacity-70">{msg.sentAt ? formatDateTime(msg.sentAt) : ''}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <Can menu="support" action="send_msg">
            <div className="border-t p-4 space-y-2">
              <Textarea placeholder="Write your reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[80px]" />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!reply.trim() || replyTicket.isPending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {replyTicket.isPending ? 'Sending…' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </Can>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened by</span>
              <span className="font-medium text-right">
                {t.customerName}
                {t.customerMobile && <span className="block text-xs font-mono text-muted-foreground">{t.customerMobile}</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{categoryLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <Badge className="capitalize">{t.priority}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Select value={t.status} onValueChange={handleStatusChange} disabled={setStatus.isPending}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {TICKET_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{t.createdAt ? formatDateTime(t.createdAt) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last activity</span>
              <span>{t.lastActivityAt ? formatDateTime(t.lastActivityAt) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">First response</span>
              <span>{t.firstResponseMinutes === null ? 'Awaiting reply' : `${t.firstResponseMinutes} min`}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Assigned</span>
              <span className="text-right">{t.assigneeNames.length ? t.assigneeNames.join(', ') : '—'}</span>
            </div>
            {t.remarks && (
              <div className="space-y-1">
                <span className="text-muted-foreground">Remarks</span>
                <p className="text-xs bg-muted/40 rounded p-2">{t.remarks}</p>
              </div>
            )}
            {t.employees.length > 0 && (
              <Can menu="support" action="update">
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-muted-foreground text-xs font-semibold">Assign to employee</span>
                  <div className="flex gap-2">
                    <Select value={assignTo} onValueChange={(v) => setAssignTo(v ?? '')}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Choose employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {t.employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-8 gap-1" disabled={!assignTo || transfer.isPending} onClick={handleAssign}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign
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
