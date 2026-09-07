'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { Send, Sparkles } from 'lucide-react';
import type { AiChatMessage } from '@/data/admin/extras.data';
import { cn } from '@/lib/utils';

export function AiChatPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'aiChat'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'aiChat');
      return res as { messages: AiChatMessage[] };
    },
  });
  const [messages, setMessages] = useState<AiChatMessage[] | null>(null);
  const [draft, setDraft] = useState('');

  const list = messages ?? data?.messages ?? [];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: AiChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      at: new Date().toISOString(),
    };
    const reply: AiChatMessage = {
      id: `a_${Date.now()}`,
      role: 'assistant',
      content:
        'Mock assistant: I would look up live tenants, MikroTik queues, and payment ledgers here. Connect the real LLM in Phase 8.',
      at: new Date().toISOString(),
    };
    setMessages([...list, userMsg, reply]);
    setDraft('');
    toast.success('Message sent (mock)');
  };

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load AI chat" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chat Assistant"
        subtitle="Ask about expiries, sync failures, billing, and ops playbooks"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'AI Chat' }]}
      />

      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">ISP Pay BD Copilot</span>
            <BadgeLike />
          </div>
          <div className="flex max-h-[480px] min-h-[360px] flex-col gap-3 overflow-y-auto p-4">
            {list.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted/80 text-foreground',
                )}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border/60 p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about customers, routers, payments…"
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <Button onClick={send} size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeLike() {
  return (
    <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
      Demo
    </span>
  );
}
