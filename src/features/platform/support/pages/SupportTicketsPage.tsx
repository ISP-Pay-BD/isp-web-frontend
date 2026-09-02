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

  if (isLoading) return <PageSkeleton rows={5} />;
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

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Support Tickets"
        subtitle="Tenant inquiries escalated to platform super-admin support"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-0 divide-y divide-border/40 max-h-[600px] overflow-y-auto">
            {data.items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                  selectedId === t.id ? 'bg-muted/60 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="font-medium text-sm line-clamp-1">{t.subject}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.tenantName} · {t.category}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs capitalize ${PRIORITY_COLORS[t.priority]}`}>
                    {t.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {t.status}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-3">
          <CardContent className="p-4">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Select a ticket to view conversation</p>
              </div>
            ) : detailLoading ? (
              <PageSkeleton rows={3} />
            ) : ticketDetail ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{ticketDetail.subject}</h3>
                  <div className="text-xs text-muted-foreground mt-1">
                    {ticketDetail.tenantSlug}.isppaybd.com · Opened {ticketDetail.createdAt}
                  </div>
                </div>
                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {ticketDetail.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 text-sm ${
                        m.sender === 'platform_support'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-muted/60 mr-8'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1">{m.senderName}</div>
                      <p>{m.body}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">{m.sentAt}</div>
                    </div>
                  ))}
                </div>
                {ticketDetail.status !== 'closed' && ticketDetail.status !== 'resolved' ? (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <Textarea
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      disabled={!reply.trim() || replyMutation.isPending}
                      onClick={() => replyMutation.mutate({ id: selectedId, body: reply })}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="mr-1.5 h-4 w-4" />
                      Send Reply
                    </Button>
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
