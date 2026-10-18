'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUrlParam } from '@/hooks/use-url-state';
import { useTranslations } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import type { Tone } from '@/components/shared/status-tones';
import type { SupportTicketRow } from '@/features/platform/types';

const PRIORITY_TONE: Record<string, Tone> = { low: 'neutral', medium: 'info', high: 'warning' };

type Translate = ReturnType<typeof useTranslations>;

const statusLabel = (t: Translate, status: SupportTicketRow['status']): string => {
  if (status === 'opened') return t('admin.support.status.opened', 'Open');
  if (status === 'processing') return t('admin.support.status.processing', 'Processing');
  if (status === 'closed') return t('admin.support.status.closed', 'Closed');
  return status;
};

const priorityLabel = (t: Translate, priority: string): string => {
  if (priority === 'low') return t('admin.support.priority.low', 'Low');
  if (priority === 'medium') return t('admin.support.priority.medium', 'Medium');
  if (priority === 'high') return t('admin.support.priority.high', 'High');
  return priority;
};

const PER_PAGE = 20;

export function SupportTicketsPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  // The open ticket lives in the URL (?ticket=12): tenant pages link straight to it, and Back returns to the list.
  const [ticketParam, setTicketParam] = useUrlParam('ticket');
  const selectedId = ticketParam || null;
  const setSelectedId = (id: string | null) => setTicketParam(id ?? '');
  const [reply, setReply] = useState('');
  const [closeAfter, setCloseAfter] = useState(false);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'support', 'list', { status, search, page }],
    queryFn: () => platformService.getSupportTickets({ status, search, page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
  });

  const detail = useQuery({
    queryKey: ['platform', 'support', 'detail', selectedId],
    queryFn: () => platformService.getSupportTicketDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body, close }: { id: string; body: string; close: boolean }) =>
      platformService.replySupportTicket(id, body, close ? 'closed' : undefined),
    onSuccess: (ticket) => {
      toast.success(
        ticket.status === 'closed'
          ? t('platform.support.tickets.replySentClosed', 'Reply sent — ticket closed')
          : t('platform.support.tickets.replySent', 'Reply sent'),
      );
      setReply('');
      setCloseAfter(false);
      queryClient.setQueryData(['platform', 'support', 'detail', ticket.id], ticket);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'support', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: SupportTicketRow['status'] }) => platformService.setSupportTicketStatus(id, next),
    onSuccess: (_, vars) => {
      toast.success(t('platform.support.tickets.marked', 'Ticket marked {status}', { status: statusLabel(t, vars.next).toLowerCase() }));
      void queryClient.invalidateQueries({ queryKey: ['platform', 'support'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
    },
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.support.tickets.loadFailed', 'Failed to load tickets')}
        description={error instanceof Error ? error.message : t('platform.support.tickets.loadFailedDesc', 'Could not retrieve platform support tickets.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;
  const ticket = detail.data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.support.tickets.title', 'Tenant Support Tickets')}
        subtitle={t('platform.support.tickets.subtitle', 'Tickets raised by ISP admins to the platform team')}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.support_tickets', 'Support Tickets') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
          <span className="text-muted-foreground">{t('platform.support.tickets.statTotal', 'total tickets')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{summary.opened}</span>{' '}
          <span className="text-muted-foreground">{t('platform.support.tickets.statOpen', 'open')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{summary.processing}</span>{' '}
          <span className="text-muted-foreground">{t('platform.support.tickets.statProcessing', 'processing')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-rose-500">{summary.high}</span>{' '}
          <span className="text-muted-foreground">{t('platform.support.tickets.statHigh', 'high priority, not closed')}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className={cn('border-border/60 bg-card lg:col-span-5 shadow-xs overflow-hidden', selectedId && 'hidden lg:block')}>
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/40 bg-muted/20">
            <input
              type="search"
              placeholder={t('platform.support.tickets.search', 'Search subject or tenant...')}
              aria-label={t('platform.support.tickets.search', 'Search subject or tenant...')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 text-sm"
            />
            <select
              aria-label={t('platform.support.tickets.filterStatus', 'Filter by status')}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-border/70 bg-background px-2 text-sm"
            >
              <option value="">{t('platform.support.tickets.all', 'All')}</option>
              <option value="opened">{statusLabel(t, 'opened')}</option>
              <option value="processing">{statusLabel(t, 'processing')}</option>
              <option value="closed">{statusLabel(t, 'closed')}</option>
            </select>
          </div>
          <CardContent className="p-0 divide-y divide-border/40 max-h-[620px] overflow-y-auto">
            {data.items.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">{t('platform.support.tickets.noMatch', 'No tickets match.')}</p>
            ) : (
              data.items.map((tk) => (
                <button
                  key={tk.id}
                  type="button"
                  onClick={() => setSelectedId(tk.id)}
                  className={`min-h-16 w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedId === tk.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={`text-sm text-foreground line-clamp-1 ${tk.viewed ? 'font-medium' : 'font-bold'}`}>{tk.subject}</div>
                    <Badge variant="outline" tone={PRIORITY_TONE[tk.priority]} className="text-xs font-mono capitalize shrink-0">
                      {priorityLabel(t, tk.priority)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{tk.tenantName ?? tk.requesterName ?? t('platform.support.tickets.unknown', 'Unknown')}</span> · {tk.category}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {statusLabel(t, tk.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{platformDateTime(tk.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t('common.previous', 'Previous')}
              </Button>
              <span className="text-muted-foreground">
                {data.page} / {data.totalPages}
              </span>
              <Button size="sm" variant="ghost" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                {t('common.next', 'Next')}
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className={cn('border-border/60 bg-card lg:col-span-7 shadow-xs', !selectedId && 'hidden lg:block')}>
          <CardContent className="p-5">
            {selectedId ? (
              <Button variant="ghost" size="sm" className="-ml-2 mb-3 h-10 gap-1.5 lg:hidden" onClick={() => setSelectedId(null)}>
                <ArrowLeft className="h-4 w-4" /> {t('platform.support.tickets.allTickets', 'All tickets')}
              </Button>
            ) : null}
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                  <MessageSquare className="h-8 w-8 opacity-60 text-primary" />
                </div>
                <p className="font-bold text-sm text-foreground">{t('platform.support.tickets.noneSelected', 'No Ticket Selected')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('platform.support.tickets.noneSelectedHint', 'Select a ticket to review the thread and respond.')}</p>
              </div>
            ) : detail.isLoading ? (
              <PageSkeleton variant="table" rows={3} />
            ) : detail.isError || !ticket ? (
              <EmptyState variant="error"
                title={t('platform.support.tickets.detailLoadFailed', 'Could not load this ticket')}
                description={detail.error instanceof Error ? detail.error.message : undefined}
                actionLabel={t('admin.customers.list.retry', 'Retry')}
                onAction={() => detail.refetch()}
              />
            ) : (
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">{ticket.subject}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" tone={PRIORITY_TONE[ticket.priority]} className="text-xs capitalize font-mono">
                        {priorityLabel(t, ticket.priority)}
                      </Badge>
                      <select
                        aria-label={t('platform.support.tickets.ticketStatus', 'Ticket status')}
                        value={ticket.status}
                        disabled={statusMutation.isPending}
                        onChange={(e) => statusMutation.mutate({ id: ticket.id, next: e.target.value as SupportTicketRow['status'] })}
                        className="h-10 rounded-md border border-border/70 bg-background px-2 text-sm"
                      >
                        <option value="opened">{statusLabel(t, 'opened')}</option>
                        <option value="processing">{statusLabel(t, 'processing')}</option>
                        <option value="closed">{statusLabel(t, 'closed')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {ticket.tenantId ? (
                      <Link href={`/platform/tenants/${ticket.tenantId}`} className="font-semibold text-foreground hover:underline">
                        {ticket.tenantName}
                      </Link>
                    ) : (
                      <strong className="text-foreground">{ticket.tenantName ?? ticket.requesterName}</strong>
                    )}
                    {ticket.requesterEmail ? ` · ${ticket.requesterEmail}` : ''}
                    {ticket.requesterPhone ? ` · ${ticket.requesterPhone}` : ''} · {t('platform.support.tickets.ticketNo', 'Ticket #{id}', { id: ticket.id })} · {ticket.category}
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {ticket.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('platform.support.tickets.noMessages', 'No messages in this thread yet.')}</p>
                  ) : (
                    ticket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-xl p-3.5 text-xs space-y-1.5 border leading-relaxed ${
                          m.senderRole === 'platform'
                            ? 'bg-primary/10 border-primary/20 ml-8 text-foreground'
                            : 'bg-muted/40 border-border/60 mr-8 text-foreground'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className={m.senderRole === 'platform' ? 'text-primary' : 'text-foreground'}>{m.senderName}</span>
                          <span className="text-xs text-muted-foreground font-mono">{m.sentAt}</span>
                        </div>
                        <p className="whitespace-pre-line">{m.body}</p>
                      </div>
                    ))
                  )}
                </div>

                {ticket.status !== 'closed' ? (
                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <Textarea
                      placeholder={t('platform.support.tickets.replyPlaceholder', 'Write a reply to the tenant…')}
                      aria-label={t('platform.support.tickets.replyPlaceholder', 'Write a reply to the tenant…')}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      className="text-xs bg-muted/20"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={closeAfter} onChange={(e) => setCloseAfter(e.target.checked)} />
                        {t('platform.support.tickets.closeAfter', 'Close ticket after replying')}
                      </label>
                      <Button
                        size="sm"
                        disabled={!reply.trim() || replyMutation.isPending}
                        onClick={() => replyMutation.mutate({ id: ticket.id, body: reply.trim(), close: closeAfter })}
                        className="bg-primary hover:bg-primary/90 font-semibold text-xs gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {replyMutation.isPending ? t('platform.support.tickets.sending', 'Sending…') : t('platform.support.tickets.send', 'Send reply')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    {t('platform.support.tickets.closedNote', 'This ticket is closed. Reopen it with the status menu to reply.')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
