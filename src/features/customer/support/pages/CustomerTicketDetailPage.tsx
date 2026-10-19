'use client';

import Link from 'next/link';
import { use, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerTicketDetail } from '../hooks/use-customer-support';
import { ticketReplySchema, type TicketReplyInput } from '@/features/customer/shared';
import {
  ticketCategoryLabel,
  ticketPriorityLabel,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
} from '../lib/ticket-labels';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocale } from '@/i18n/locale-context';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function CustomerTicketDetailPage({ params }: PageProps) {
  const { t, te } = useLocale();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const { data: ticket, isLoading, isError, error, refetch, replyMutation } = useCustomerTicketDetail(ticketId);
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketReplyInput>({
    resolver: zodResolver(ticketReplySchema),
    defaultValues: { message: '' },
  });

  // Chat behaviour: when a new message arrives after the first load, bring it into view above the reply bar.
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenMessages = useRef<number | null>(null);
  const messageCount = ticket?.messages.length ?? null;
  useEffect(() => {
    if (messageCount !== null && seenMessages.current !== null && messageCount > seenMessages.current) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
    seenMessages.current = messageCount;
  }, [messageCount]);

  const shellTitle = t('customer.ticket.title', 'Ticket #{id}', { id: ticketId });
  const crumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.support.crumb', 'Support'), href: '/customer/support' },
    { label: `#${ticketId}` },
  ];

  if (isLoading) {
    return (
      <CustomerPageShell title={shellTitle} subtitle={t('customer.ticket.loading', 'Loading the conversation…')} breadcrumbs={crumbs}>
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !ticket) {
    return (
      <CustomerPageShell title={shellTitle} breadcrumbs={crumbs}>
        <CustomerErrorState message={error?.message || t('customer.ticket.notFound', 'Support ticket not found.')} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const onSubmit = async (data: TicketReplyInput) => {
    try {
      await replyMutation.mutateAsync(data.message);
      toast.success(t('customer.ticket.sent', 'Reply sent.'));
      reset();
    } catch {
      // the backend message is toasted by the query client
    }
  };

  const replyForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {ticket.status === 'closed' ? (
        <p className="text-muted-foreground text-sm">
          {t('customer.ticket.closedNote', 'This ticket is closed — replying adds to the thread.')}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="reply" className="sr-only">
            {t('customer.ticket.replyLabel', 'Your reply')}
          </label>
          <Textarea
            id="reply"
            rows={1}
            placeholder={t('customer.ticket.replyPlaceholder', 'Type your message…')}
            aria-invalid={Boolean(errors.message)}
            className="max-h-40 min-h-11 resize-none md:min-h-20"
            {...register('message')}
          />
        </div>
        <Button type="submit" disabled={replyMutation.isPending} className="h-11 shrink-0 gap-2 px-3 font-semibold md:px-4">
          {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only md:not-sr-only">
            {replyMutation.isPending ? t('customer.ticket.sending', 'Sending…') : t('customer.ticket.send', 'Send reply')}
          </span>
        </Button>
      </div>
      {errors.message && <p className="text-destructive text-sm">{te(errors.message.message ?? '')}</p>}
    </form>
  );

  return (
    <CustomerPageShell
      title={shellTitle}
      subtitle={ticket.subject || t('customer.support.untitled', 'Untitled ticket')}
      breadcrumbs={crumbs}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/support" />}>
          <ArrowLeft className="h-4 w-4" />
          {t('customer.ticket.back', 'Back to tickets')}
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl pb-24 md:pb-0">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={ticket.status}
                tone={ticketStatusTone(ticket.status)}
                label={ticketStatusLabel(t, ticket.status)}
              />
              {ticket.priority ? (
                <Badge variant="outline" tone={ticketPriorityTone(ticket.priority)} className="font-semibold">
                  {t('customer.ticket.priorityBadge', '{priority} priority', {
                    priority: ticketPriorityLabel(t, ticket.priority),
                  })}
                </Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('customer.ticket.opened', 'Opened {date}', { date: formatDate(ticket.createdAt) })}
              {ticket.category
                ? ` · ${t('customer.ticket.categoryLine', 'Category: {category}', { category: ticketCategoryLabel(t, ticket.category) })}`
                : ''}
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {ticket.messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('customer.ticket.noMessages', 'No messages on this ticket yet.')}</p>
            ) : (
              <ol className="space-y-4">
                {ticket.messages.map((msg) => (
                  <li key={msg.id} className={cn('flex flex-col gap-1', msg.fromMe ? 'items-end' : 'items-start')}>
                    <div className="text-muted-foreground flex items-center gap-2 px-1 text-xs">
                      <span className="text-foreground font-semibold">
                        {msg.fromMe
                          ? t('customer.ticket.you', 'You')
                          : msg.senderName === 'Support team'
                            ? t('customer.ticket.supportTeam', 'Support team')
                            : msg.senderName}
                      </span>
                      <span>{msg.sentAt}</span>
                    </div>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap shadow-sm',
                        msg.fromMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md',
                      )}
                    >
                      {msg.body}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div ref={bottomRef} className="scroll-mb-44 md:scroll-mb-4" />
          </CardContent>

          {isMobile ? null : <div className="border-t p-4">{replyForm}</div>}
        </Card>
      </div>

      {isMobile
        ? createPortal(
            <div className="bg-background/95 border-border/70 fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 border-t px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-md">
              {replyForm}
            </div>,
            document.body,
          )
        : null}
    </CustomerPageShell>
  );
}
