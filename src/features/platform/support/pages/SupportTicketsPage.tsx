'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'border-slate-500/30 text-slate-600 bg-slate-500/10',
  medium: 'border-blue-500/30 text-blue-600 bg-blue-500/10',
  high: 'border-amber-500/30 text-amber-600 bg-amber-500/10',
  urgent: 'border-red-500/30 text-red-600 bg-red-500/10',
};

export function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'support'],
    queryFn: () => mockFetch('platform.support'),
  });

  const { data: ticketDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['platform', 'support', selectedId],
    queryFn: () => mockFetch('platform.support.get', selectedId!),
    enabled: Boolean(selectedId),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => mockFetch('platform.support.reply', id, body),
    onSuccess: () => {
      toast.success('Reply sent — ticket marked resolved');
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['platform', 'support'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load tickets"
        description="Could not retrieve platform support tickets."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const openCount = data.items.filter((t) => t.status === 'open').length;
  const pendingCount = data.items.filter((t) => t.status === 'pending').length;
  const urgentCount = data.items.filter((t) => t.priority === 'urgent' || t.priority === 'high').length;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Escalated Support Tickets"
        subtitle="Multi-tenant escalated incident threads, gateway troubleshooting, and platform helpdesk"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Support Tickets' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">total tickets</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{openCount}</span>{' '}
          <span className="text-muted-foreground">open</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{pendingCount}</span>{' '}
          <span className="text-muted-foreground">pending investigation</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-rose-500">{urgentCount}</span>{' '}
          <span className="text-muted-foreground">high priority / urgent</span>
        </p>
        <p className="text-muted-foreground">SLA response ~18 mins</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/60 bg-card lg:col-span-5 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-border/40 bg-muted/20 font-bold text-xs text-muted-foreground uppercase tracking-wider">
            Ticket Feed ({data.items.length})
          </div>
          <CardContent className="p-0 divide-y divide-border/40 max-h-[620px] overflow-y-auto">
            {data.items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                  selectedId === t.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold text-sm text-foreground line-clamp-1">{t.subject}</div>
                  <Badge variant="outline" className={`text-[10px] font-mono capitalize shrink-0 ${PRIORITY_COLORS[t.priority]}`}>
                    {t.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.tenantName}</span> · {t.category}
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                  <Badge variant="secondary" className="text-[10px] font-mono capitalize">
                    {t.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{t.createdAt}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card lg:col-span-7 shadow-xs">
          <CardContent className="p-5">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                  <MessageSquare className="h-8 w-8 opacity-60 text-primary" />
                </div>
                <p className="font-bold text-sm text-foreground">No Ticket Selected</p>
                <p className="text-xs text-muted-foreground mt-1">Select a ticket from the left panel to review history and respond.</p>
              </div>
            ) : detailLoading ? (
              <PageSkeleton variant="table" rows={3} />
            ) : ticketDetail ? (
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">{ticketDetail.subject}</h3>
                    <Badge variant="outline" className={`text-xs capitalize font-mono ${PRIORITY_COLORS[ticketDetail.priority]}`}>
                      {ticketDetail.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    Tenant: <strong className="text-foreground">{ticketDetail.tenantSlug}.isppaybd.com</strong> · Ticket #{ticketDetail.id}
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {ticketDetail.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl p-3.5 text-xs space-y-1.5 border leading-relaxed ${
                        m.sender === 'platform_support'
                          ? 'bg-primary/10 border-primary/20 ml-8 text-foreground'
                          : 'bg-muted/40 border-border/60 mr-8 text-foreground'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className={m.sender === 'platform_support' ? 'text-primary' : 'text-foreground'}>
                          {m.senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{m.sentAt}</span>
                      </div>
                      <p>{m.body}</p>
                    </div>
                  ))}
                </div>

                {ticketDetail.status !== 'closed' && ticketDetail.status !== 'resolved' ? (
                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <Textarea
                      placeholder="Type official platform resolution or response..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      className="text-xs bg-muted/20"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={!reply.trim() || replyMutation.isPending}
                        onClick={() => replyMutation.mutate({ id: selectedId, body: reply })}
                        className="bg-primary hover:bg-primary/90 font-semibold text-xs gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Resolution
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
