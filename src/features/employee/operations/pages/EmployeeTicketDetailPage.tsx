'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeEmptyState,
  EmployeeErrorState,
  EmployeeLoadingSkeleton,
} from '@/features/employee/shared';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import {
  useReplyTicket,
  useSupportTicket,
  useTicketStatus,
} from '@/features/admin/support/hooks/use-support';
import type { TicketStatus } from '@/features/admin/support/types';
import { EmployeeAccessGate } from '../components/EmployeeAccessGate';
import { useMyPermissions } from '../hooks/use-my-permissions';

const STATUSES: TicketStatus[] = ['opened', 'processing', 'closed'];

/** One staff ticket: thread + reply (`support_ticket.send_msg`) + status (`support_ticket.update`). */
export function EmployeeTicketDetailPage({ id }: { id: string }) {
  const t = useTranslations();
  const title = t('employee.tickets.detailTitle', 'Ticket #{id}', { id });
  const breadcrumbs = [
    { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/dashboard' },
    { label: t('employee.tickets.title', 'Support tickets'), href: '/employee/tickets' },
    { label: `#${id}` },
  ];
  return (
    <EmployeeAccessGate title={title} breadcrumbs={breadcrumbs} allowed={(p) => p.readTicket}>
      <TicketDetail id={id} title={title} breadcrumbs={breadcrumbs} />
    </EmployeeAccessGate>
  );
}

function TicketDetail({
  id,
  title,
  breadcrumbs,
}: {
  id: string;
  title: string;
  breadcrumbs: { label: string; href?: string }[];
}) {
  const t = useTranslations();
  const ticket = useSupportTicket(id);
  const perms = useMyPermissions();
  const reply = useReplyTicket(id);
  const setStatus = useTicketStatus(id);
  const [message, setMessage] = useState('');

  const back = (
    <Button variant="outline" size="sm" render={<Link href="/employee/tickets" />}>
      <ArrowLeft className="mr-1 h-4 w-4" /> {t('employee.tickets.back', 'All tickets')}
    </Button>
  );

  if (ticket.isLoading) {
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }
  if (ticket.isError || !ticket.data) {
    const status = ticket.error instanceof ApiError ? ticket.error.status : 0;
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs} actions={back}>
        {status === 403 || status === 404 ? (
          <EmployeeEmptyState
            title={
              status === 403
                ? t('employee.quick.deniedTitle', 'You do not have access to this')
                : t('employee.tickets.notFound', 'Ticket not found')
            }
            description={ticket.error?.message ?? ''}
          />
        ) : (
          <EmployeeErrorState message={ticket.error?.message} onRetry={() => ticket.refetch()} />
        )}
      </EmployeePageShell>
    );
  }

  const tk = ticket.data;
  const canReply = perms.allows('support_ticket', 'send_msg') && tk.status !== 'closed';
  const canUpdate = perms.allows('support_ticket', 'update');
  const statusLabel = (s: TicketStatus) =>
    s === 'opened'
      ? t('employee.tickets.filter.opened', 'Open')
      : s === 'processing'
        ? t('employee.tickets.filter.processing', 'In progress')
        : t('employee.tickets.filter.closed', 'Closed');
  const statusItems = Object.fromEntries(STATUSES.map((s) => [s, statusLabel(s)]));

  const send = () => {
    const body = message.trim();
    if (!body) return;
    reply.mutate(body, {
      onSuccess: () => {
        setMessage('');
        toast.success(t('employee.tickets.replySent', 'Reply sent'));
      },
    });
  };

  return (
    <EmployeePageShell
      title={tk.subject || title}
      subtitle={[`#${tk.id}`, tk.customerName].filter(Boolean).join(' · ')}
      breadcrumbs={breadcrumbs}
      actions={back}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex min-h-[420px] flex-col lg:col-span-2">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">
              {t('employee.tickets.thread', 'Conversation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 p-4">
            {tk.messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t('employee.tickets.noMessages', 'No messages yet.')}
              </p>
            ) : (
              tk.messages.map((m) => {
                const staff = !m.fromCustomer;
                return (
                  <div
                    key={m.id}
                    className={cn('flex max-w-[90%] gap-3', staff && 'ml-auto flex-row-reverse')}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        staff ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      <User className="h-4 w-4" />
                    </span>
                    <div
                      className={cn(
                        'space-y-1 rounded-lg px-3 py-2 text-sm',
                        staff ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      <p className="text-xs font-semibold opacity-80">
                        {m.senderName} · {formatDayTime(m.sentAt)}
                      </p>
                      <p className="break-words whitespace-pre-wrap">{m.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          {canReply ? (
            <div className="space-y-2 border-t p-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('employee.tickets.replyPlaceholder', 'Write a reply…')}
                aria-label={t('employee.tickets.replyPlaceholder', 'Write a reply…')}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={send} disabled={!message.trim() || reply.isPending}>
                  {reply.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <Send className="mr-1.5 h-4 w-4" />
                  )}
                  {t('employee.tickets.send', 'Send reply')}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-4 py-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t('employee.tickets.status', 'Status')}
              </span>
              {canUpdate ? (
                <Select
                  value={tk.status}
                  items={statusItems}
                  onValueChange={(v) => {
                    if (!v || v === tk.status) return;
                    setStatus.mutate(v as TicketStatus, {
                      onSuccess: () =>
                        toast.success(
                          t('employee.tickets.statusChanged', 'Ticket marked {status}', {
                            status: statusLabel(v as TicketStatus),
                          }),
                        ),
                    });
                  }}
                >
                  <SelectTrigger
                    className="w-40"
                    aria-label={t('employee.tickets.status', 'Status')}
                    disabled={setStatus.isPending}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusItems[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={tk.status} label={statusLabel(tk.status)} />
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t('employee.tickets.priority', 'Priority')}
              </span>
              <StatusBadge status={tk.priority} />
            </div>
            {tk.customerMobile ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {t('employee.tickets.mobile', 'Mobile')}
                </span>
                <a className="font-mono hover:underline" href={`tel:${tk.customerMobile}`}>
                  {tk.customerMobile}
                </a>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t('employee.tickets.opened', 'Opened')}
              </span>
              <span>{formatDayTime(tk.createdAt)}</span>
            </div>
            {!canReply && !canUpdate && !perms.isLoading ? (
              <p className="text-muted-foreground border-t pt-3 text-xs">
                {t(
                  'employee.tickets.readOnly',
                  'You can read this ticket but not reply to it or change its status.',
                )}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </EmployeePageShell>
  );
}
