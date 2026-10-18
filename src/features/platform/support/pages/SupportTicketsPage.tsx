'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { SupportTicketRow } from '@/features/platform/types';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'border-slate-500/30 text-slate-600 bg-slate-500/10',
  medium: 'border-blue-500/30 text-blue-600 bg-blue-500/10',
  high: 'border-amber-500/30 text-amber-600 bg-amber-500/10',
};

const STATUS_LABEL: Record<SupportTicketRow['status'], string> = {
  opened: 'Open',
  processing: 'Processing',
  closed: 'Closed',
};

const PER_PAGE = 20;

export function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [closeAfter, setCloseAfter] = useState(false);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('ticket');
    if (fromUrl) setSelectedId(fromUrl);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
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
      toast.success(ticket.status === 'closed' ? 'Reply sent — ticket closed' : 'Reply sent');
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
      toast.success(`Ticket marked ${STATUS_LABEL[vars.next].toLowerCase()}`);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'support'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
    },
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load tickets"
        description={error instanceof Error ? error.message : 'Could not retrieve platform support tickets.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;
  const ticket = detail.data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant Support Tickets"
        subtitle="Tickets raised by ISP admins to the platform team"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Support Tickets' },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
          <span className="text-muted-foreground">total tickets</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{summary.opened}</span>{' '}
          <span className="text-muted-foreground">open</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{summary.processing}</span>{' '}
          <span className="text-muted-foreground">processing</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-rose-500">{summary.high}</span>{' '}
          <span className="text-muted-foreground">high priority, not closed</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/60 bg-card lg:col-span-5 shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/40 bg-muted/20">
            <input
              type="search"
              placeholder="Search subject or tenant..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-2.5 text-xs"
            />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
            >
              <option value="">All</option>
              <option value="opened">Open</option>
              <option value="processing">Processing</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <CardContent className="p-0 divide-y divide-border/40 max-h-[620px] overflow-y-auto">
            {data.items.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No tickets match.</p>
            ) : (
              data.items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedId === t.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={`text-sm text-foreground line-clamp-1 ${t.viewed ? 'font-medium' : 'font-bold'}`}>{t.subject}</div>
                    <Badge variant="outline" className={`text-[10px] font-mono capitalize shrink-0 ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                      {t.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t.tenantName ?? t.requesterName ?? 'Unknown'}</span> · {t.category}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {STATUS_LABEL[t.status] ?? t.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{platformDateTime(t.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-muted-foreground">
                {data.page} / {data.totalPages}
              </span>
              <Button size="sm" variant="ghost" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="border-border/60 bg-card lg:col-span-7 shadow-xs">
          <CardContent className="p-5">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                  <MessageSquare className="h-8 w-8 opacity-60 text-primary" />
                </div>
                <p className="font-bold text-sm text-foreground">No Ticket Selected</p>
                <p className="text-xs text-muted-foreground mt-1">Select a ticket to review the thread and respond.</p>
              </div>
            ) : detail.isLoading ? (
              <PageSkeleton variant="table" rows={3} />
            ) : detail.isError || !ticket ? (
              <EmptyState
                title="Could not load this ticket"
                description={detail.error instanceof Error ? detail.error.message : undefined}
                actionLabel="Retry"
                onAction={() => detail.refetch()}
              />
            ) : (
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">{ticket.subject}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs capitalize font-mono ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                        {ticket.priority}
                      </Badge>
                      <select
                        aria-label="Ticket status"
                        value={ticket.status}
                        disabled={statusMutation.isPending}
                        onChange={(e) => statusMutation.mutate({ id: ticket.id, next: e.target.value as SupportTicketRow['status'] })}
                        className="h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                      >
                        <option value="opened">Open</option>
                        <option value="processing">Processing</option>
                        <option value="closed">Closed</option>
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
                    {ticket.requesterPhone ? ` · ${ticket.requesterPhone}` : ''} · Ticket #{ticket.id} · {ticket.category}
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {ticket.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>
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
                          <span className="text-[10px] text-muted-foreground font-mono">{m.sentAt}</span>
                        </div>
                        <p className="whitespace-pre-line">{m.body}</p>
                      </div>
                    ))
                  )}
                </div>

                {ticket.status !== 'closed' ? (
                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <Textarea
                      placeholder="Write a reply to the tenant…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      className="text-xs bg-muted/20"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={closeAfter} onChange={(e) => setCloseAfter(e.target.checked)} />
                        Close ticket after replying
                      </label>
                      <Button
                        size="sm"
                        disabled={!reply.trim() || replyMutation.isPending}
                        onClick={() => replyMutation.mutate({ id: ticket.id, body: reply.trim(), close: closeAfter })}
                        className="bg-primary hover:bg-primary/90 font-semibold text-xs gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {replyMutation.isPending ? 'Sending…' : 'Send reply'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    This ticket is closed. Reopen it with the status menu to reply.
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
