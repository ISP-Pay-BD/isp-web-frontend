'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { PageHeader } from '@/features/admin/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check, Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { dateLocale } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

/** `text` is what the operator sees in the conversation; `query` is what the backend classifier receives (it matches English keywords). */
interface Prompt {
  text: string;
  query: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  at: string;
  sources?: string[];
  /** the prompt to resend from an error bubble */
  retry?: Prompt;
}

interface ChatReply {
  reply: string;
  intent: string;
  sources: string[];
}

let seq = 0;
const nextId = (p: string) => `${p}_${Date.now()}_${++seq}`;

export function AiChatPage() {
  const t = useTranslations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Errors render as a bubble in the conversation instead of a toast.
  const ask = useMutation({
    meta: { silent: true },
    mutationFn: (message: string) => http.post<ChatReply>('/v1/ai/chat', { message }),
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ask.isPending]);

  // Topics the backend assistant answers from live records (AiChatController::classify).
  const quickPrompts: Prompt[] = [
    { query: 'Which subscribers expire in the next 24 hours?', text: t('admin.aiChat.quick.expiring', 'Which subscribers expire in the next 24 hours?') },
    { query: 'Give me a subscriber summary', text: t('admin.aiChat.quick.summary', 'Give me a subscriber summary') },
    { query: 'How much is collected and pending in billing?', text: t('admin.aiChat.quick.billing', 'How much is collected and pending in billing?') },
    { query: 'Show my top packages', text: t('admin.aiChat.quick.packages', 'Show my top packages') },
    { query: 'How many support tickets are open?', text: t('admin.aiChat.quick.tickets', 'How many support tickets are open?') },
  ];

  const handleSend = (override?: Prompt) => {
    const draftText = draft.trim();
    const prompt = override ?? { text: draftText, query: draftText };
    if (!prompt.query || ask.isPending) return;
    setMessages((prev) => [...prev, { id: nextId('u'), role: 'user', content: prompt.text, at: new Date().toISOString() }]);
    setDraft('');
    ask.mutate(prompt.query, {
      onSuccess: (res) =>
        setMessages((prev) => [
          ...prev,
          { id: nextId('a'), role: 'assistant', content: res.reply, sources: res.sources ?? [], at: new Date().toISOString() },
        ]),
      onError: (err) =>
        setMessages((prev) => [
          ...prev,
          { id: nextId('e'), role: 'error', content: errorMessage(err, t('admin.aiChat.errorFallback', 'The assistant could not answer that.')), retry: prompt, at: new Date().toISOString() },
        ]),
    });
  };

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast.success(t('admin.aiChat.copiedToast', 'Response copied to clipboard'));
      window.setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.aiChat.title', 'Operations Assistant')}
        subtitle={t('admin.aiChat.subtitle', 'Ask about your subscribers, billing, packages and support tickets — answers come from your own records')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('common.crumb.ai_chat', 'AI Chat') },
        ]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={messages.length === 0} onClick={() => setMessages([])}>
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            {t('admin.aiChat.clear', 'Clear Conversation')}
          </Button>
        }
      />

      <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)] min-h-[520px]">
        <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{t('admin.aiChat.title', 'Operations Assistant')}</CardTitle>
              <CardDescription className="text-xs">{t('admin.aiChat.cardDesc', 'Each answer lists the records it was built from.')}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Bot className="h-7 w-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-semibold text-foreground text-sm">{t('admin.aiChat.emptyTitle', 'What would you like to know?')}</h3>
                <p className="text-xs text-muted-foreground">{t('admin.aiChat.emptyHint', 'Try one of these questions or type your own.')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left pt-2">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.query}
                    type="button"
                    onClick={() => handleSend(qp)}
                    className="p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition flex items-start gap-2 shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{qp.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              const isError = m.role === 'error';
              return (
                <div key={m.id} className={cn('flex items-start gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0',
                      isUser
                        ? 'bg-primary text-primary-foreground font-bold'
                        : isError
                          ? 'bg-destructive/10 border border-destructive/30 text-destructive'
                          : 'bg-primary/10 border border-primary/30 text-primary',
                    )}
                  >
                    {isUser ? <User className="h-4 w-4" /> : isError ? <AlertTriangle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-xs',
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : isError
                          ? 'bg-destructive/5 border border-destructive/30 text-foreground rounded-tl-xs'
                          : 'bg-card border border-border/60 text-foreground rounded-tl-xs',
                    )}
                  >
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-xs">{m.content}</div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        {m.sources.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-mono">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex items-center justify-between gap-3 pt-1 text-xs font-mono border-t',
                        isUser ? 'border-primary-foreground/20 text-primary-foreground/80' : 'border-border/40 text-muted-foreground',
                      )}
                    >
                      <span>{new Date(m.at).toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.role === 'assistant' && (
                        <button type="button" onClick={() => handleCopy(m.id, m.content)} className="hover:text-foreground transition-colors flex items-center gap-1">
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500">{t('admin.aiChat.copied', 'Copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>{t('admin.aiChat.copy', 'Copy')}</span>
                            </>
                          )}
                        </button>
                      )}
                      {isError && m.retry && (
                        <button type="button" disabled={ask.isPending} onClick={() => handleSend(m.retry)} className="hover:text-foreground transition-colors">
                          {t('admin.customers.list.retry', 'Retry')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {ask.isPending && (
            <div className="flex items-center gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border/60 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>{t('admin.aiChat.thinking', 'Looking up your records…')}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        {messages.length > 0 && (
          <div className="px-4 py-2 bg-muted/15 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              {t('admin.aiChat.quickLabel', 'Quick:')}
            </span>
            {quickPrompts.map((qp) => (
              <button
                key={qp.query}
                type="button"
                disabled={ask.isPending}
                onClick={() => handleSend(qp)}
                className="text-xs px-2.5 py-1 rounded-full bg-background border border-border/60 hover:bg-muted text-foreground/80 shrink-0 transition-colors truncate max-w-[240px]"
                title={qp.text}
              >
                {qp.text}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-border/50 p-3 bg-card flex items-end gap-2">
          <Textarea
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('admin.aiChat.placeholder', 'Ask about subscribers, billing, packages or tickets… (Enter to send)')}
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
            disabled={!draft.trim() || ask.isPending}
            size="icon"
            className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={t('admin.aiChat.send', 'Send message')}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
