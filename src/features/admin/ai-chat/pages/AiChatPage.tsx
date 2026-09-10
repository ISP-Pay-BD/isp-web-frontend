'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/admin/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { toast } from 'sonner';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Zap,
  Terminal,
  Activity,
  ArrowRight,
} from 'lucide-react';
import type { AiChatMessage } from '@/data/admin/extras.data';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Diagnose high latency and packet drop on Core Router 01 (Uttara)',
  'List all broadband subscribers expiring in the next 24 hours',
  'Generate MikroTik QoS tree queue script for 25 Mbps package',
  'Check optical power (RX dBm) on OLT Port 1/1/4 ONUs',
];

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const list = messages ?? data?.messages ?? [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [list, isGenerating]);

  const handleSend = (overridePrompt?: string) => {
    const text = overridePrompt ?? draft.trim();
    if (!text || isGenerating) return;

    const userMsg: AiChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      at: new Date().toISOString(),
    };

    setMessages((prev) => [...(prev ?? list), userMsg]);
    setDraft('');
    setIsGenerating(true);

    setTimeout(() => {
      let aiResponse = `I have analyzed your ISP operational telemetry regarding: "${text}".\n\n`;
      if (text.toLowerCase().includes('mikrotik') || text.toLowerCase().includes('queue') || text.toLowerCase().includes('script')) {
        aiResponse += `Here is the optimized MikroTik RouterOS v7 queue tree script:\n\`\`\`routeros\n/queue tree\nadd name="ISP_Down_Main" parent=global max-limit=100M\nadd name="Home_25M" parent="ISP_Down_Main" packet-mark="p_home_25m" limit-at=20M max-limit=25M priority=4\n/ip firewall mangle\nadd chain=forward action=mark-packet new-packet-mark=p_home_25m src-address-list=Home_25M_Users passthrough=no\n\`\`\`\nAll bandwidth queues have been verified against RADIUS rate-limit attributes.`;
      } else if (text.toLowerCase().includes('expir') || text.toLowerCase().includes('subscribers') || text.toLowerCase().includes('billing')) {
        aiResponse += `Found 14 active subscribers whose accounts expire within 24 hours:\n• Rahim Uddin (01712-345678) — Home 20M (৳1,200)\n• Sadia Islam (01811-987654) — Home 30M (৳1,500)\n• 12 others in Uttara & Mirpur sectors.\n\nSMS & WhatsApp pre-disconnection payment alerts are already queued for dispatch at 10:00 AM.`;
      } else if (text.toLowerCase().includes('olt') || text.toLowerCase().includes('onu') || text.toLowerCase().includes('optical') || text.toLowerCase().includes('rx')) {
        aiResponse += `OLT Optical Diagnostic Telemetry (Huawei MA5608T):\n• Total Active ONUs on PON 1/1/4: 64 ONUs\n• Normal Range (-18 dBm to -24 dBm): 62 units (96.8%)\n• Critical Weak Signals: 2 units (ONU #18 at -28.4 dBm, ONU #33 at -27.8 dBm).\n\nRecommendation: Dispatch optical maintenance crew to inspect splice tray at Sector 3 Distribution Box.`;
      } else {
        aiResponse += `Router CPU loads are optimal across all MikroTik CCR2004 gateways (Avg: 18%). RADIUS authentication heartbeat is responding with 14ms latency. What specific action would you like me to execute?`;
      }

      const assistantMsg: AiChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        at: new Date().toISOString(),
      };

      setMessages((prev) => [...(prev ?? []), assistantMsg]);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.info('AI assistant conversation cleared');
  };

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load AI chat" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ISP Operations AI Assistant"
        subtitle="Autonomous operations co-pilot for MikroTik queues, RADIUS disconnects, billing ledgers, and ONU diagnostics"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'AI Chat' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleClearChat}
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              Clear Conversation
            </Button>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'AI Co-Pilot Model', value: 'GPT-4o mini (Fine-Tuned ISP)' },
          { label: 'Connected Knowledge Graph', value: 'Live MikroTik + RADIUS + Billing' },
          { label: 'Engine Response Latency', value: '~420ms' },
          { label: 'Context Window', value: '128k Tokens' },
          { label: 'Co-Pilot Status', value: 'ONLINE & READY' },
        ]}
      />

      {/* Main Chat Hub Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-21rem)] min-h-[580px]">
        {/* Chat Header */}
        <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                ISP Operations Autonomous Co-Pilot
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping mr-1" />
                  Live Assistant
                </Badge>
              </CardTitle>
              <CardDescription className="text-[11px]">
                Ask questions regarding network queues, subscriber balances, optical signals, and router scripts
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span>Schema v2.4</span>
          </div>
        </CardHeader>

        {/* Message Stream */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {list.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Bot className="h-7 w-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-semibold text-foreground text-sm">How can I assist your ISP operations today?</h3>
                <p className="text-xs text-muted-foreground">
                  I have direct read access to your subscriber database, MikroTik routers, and OLT optical telemetry.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left pt-2">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(qp)}
                    className="p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-all flex items-start gap-2 shadow-xs group"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{qp}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            list.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={cn('flex items-start gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0',
                      isUser
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-primary/10 border border-primary/30 text-primary'
                    )}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-xs',
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : 'bg-card border border-border/60 text-foreground rounded-tl-xs'
                    )}
                  >
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-xs">
                      {m.content}
                    </div>
                    <div
                      className={cn(
                        'flex items-center justify-between pt-1 text-[10px] font-mono border-t',
                        isUser ? 'border-primary-foreground/20 text-primary-foreground/80' : 'border-border/40 text-muted-foreground'
                      )}
                    >
                      <span>{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.content)}
                          className="hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isGenerating && (
            <div className="flex items-center gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border/60 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Analyzing network queues & operational databases...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        {/* Quick Suggestion Chips (if active conversation) */}
        {list.length > 0 && (
          <div className="px-4 py-2 bg-muted/15 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Quick:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border/60 hover:bg-muted text-foreground/80 shrink-0 transition-colors truncate max-w-[240px]"
                title={qp}
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        {/* Composer Bar */}
        <div className="border-t border-border/50 p-3 bg-card flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about customers, MikroTik queues, ONU optical signals, or payment reconciliation... (Enter to send)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[44px] max-h-32 text-xs font-sans leading-relaxed resize-none bg-muted/20 py-2.5"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!draft.trim() || isGenerating}
            size="icon"
            className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Send Message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
