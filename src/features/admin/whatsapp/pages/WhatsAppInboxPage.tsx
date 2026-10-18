'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { toast } from 'sonner';
import {
  Search,
  Send,
  MessageCircle,
  MessageSquare,
  FileText,
  History,
  UserCheck,
  Megaphone,
  Settings,
  RefreshCw,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format';
import {
  useSendWhatsApp,
  useWhatsAppConversation,
  useWhatsAppConversations,
  useWhatsAppSettings,
} from '../hooks/use-whatsapp';

type ThreadFilter = 'all' | 'customers' | 'leads' | 'escalated';

const timeOf = (iso: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

export function WhatsAppInboxPage() {
  const conversations = useWhatsAppConversations();
  const settings = useWhatsAppSettings();
  const sendMessage = useSendWhatsApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ThreadFilter>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [providerChoice, setProviderChoice] = useState<'meta' | 'waha' | null>(null);

  const list = useMemo(() => conversations.data ?? [], [conversations.data]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
      const matchFilter =
        filter === 'all' ||
        (filter === 'leads' && c.isLead) ||
        (filter === 'customers' && !c.isLead) ||
        (filter === 'escalated' && c.escalated);
      return matchSearch && matchFilter;
    });
  }, [list, search, filter]);

  const active = useMemo(() => filtered.find((c) => c.id === activeId) ?? filtered[0] ?? null, [filtered, activeId]);
  const thread = useWhatsAppConversation(active?.id ?? null);

  const providers = useMemo(() => {
    const out: Array<'meta' | 'waha'> = [];
    if (settings.data?.waha?.isActive) out.push('waha');
    if (settings.data?.meta?.isActive) out.push('meta');
    return out;
  }, [settings.data]);
  const provider = providerChoice && providers.includes(providerChoice) ? providerChoice : (providers[0] ?? null);

  const handleSendReply = () => {
    const text = reply.trim();
    if (!text || !active) return;
    if (!provider) {
      toast.error('No active WhatsApp provider — configure Meta or WAHA in Settings');
      return;
    }
    sendMessage.mutate(
      { to: thread.data?.phone || active.phone, text, provider },
      {
        onSuccess: () => {
          toast.success(`Message sent to ${active.name} via ${provider.toUpperCase()}`);
          setReply('');
        },
      },
    );
  };

  if (conversations.isLoading) return <PageSkeleton variant="table" />;
  if (conversations.isError) {
    return (
      <EmptyState
        title="Failed to load inbox"
        description={errorMessage(conversations.error, 'Could not fetch WhatsApp conversations.')}
        actionLabel="Retry"
        onAction={() => conversations.refetch()}
      />
    );
  }

  const meta = settings.data?.meta;
  const waha = settings.data?.waha;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Business Inbox"
        subtitle="Conversations handled by the AI assistant over Meta Cloud API and the WAHA bridge"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Inbox' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={conversations.isFetching}
            onClick={() => {
              conversations.refetch();
              thread.refetch();
            }}
          >
            <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', conversations.isFetching && 'animate-spin')} />
            Sync
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Conversations', value: list.length },
          { label: 'Escalated (AI paused)', value: list.filter((c) => c.escalated).length },
          { label: 'Leads', value: list.filter((c) => c.isLead).length },
          { label: 'WAHA Session', value: waha ? `${waha.sessionStatus}${waha.isActive ? '' : ' (inactive)'}` : 'Not configured' },
          { label: 'Meta Cloud API', value: meta ? (meta.isActive ? 'Active' : 'Inactive') : 'Not configured' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-21rem)] min-h-[560px]">
        <Card className="lg:col-span-4 flex flex-col overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="p-3 border-b border-border/50 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-muted/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(['all', 'customers', 'leads', 'escalated'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilter(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    filter === p
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {p === 'all' ? 'All Threads' : p}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <EmptyState
                  title={list.length === 0 ? 'No conversations yet' : 'No conversations found'}
                  description={list.length === 0 ? 'Customer WhatsApp chats appear here once they message you.' : 'Try adjusting your search or filter.'}
                  actionLabel={list.length === 0 ? undefined : 'Reset Filter'}
                  onAction={
                    list.length === 0
                      ? undefined
                      : () => {
                          setSearch('');
                          setFilter('all');
                        }
                  }
                />
              </div>
            ) : (
              filtered.map((conv) => {
                const isSelected = active?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      'w-full text-left p-3.5 hover:bg-muted/40 transition relative block',
                      isSelected && 'bg-primary/5 border-l-3 border-l-primary',
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {conv.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-xs text-foreground block truncate">{conv.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{conv.phone}</span>
                        </div>
                      </div>
                      {conv.escalated ? (
                        <Badge className="h-5 px-1.5 text-[9px] bg-amber-500 text-white">Escalated</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0">
                          {conv.isLead ? 'lead' : 'customer'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
                      <span>{conv.totalMessages} messages</span>
                      <span>{conv.updatedAt ? formatDateTime(conv.updatedAt) : ''}</span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 flex flex-col overflow-hidden border-border/60 shadow-sm">
          {active ? (
            <>
              <CardHeader className="border-b border-border/50 py-3 px-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold text-sm">
                      {active.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                        {active.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        <span>{thread.data?.phone || active.phone}</span>
                        <span>·</span>
                        <span className="font-sans">{active.escalated ? 'AI paused — staff handling' : 'AI assistant active'}</span>
                      </div>
                    </div>
                  </div>
                  {active.userId && (
                    <Link
                      href={`/admin/customers/${active.userId}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 text-xs gap-1')}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="hidden sm:inline">Customer Profile</span>
                    </Link>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
                {thread.isLoading ? (
                  <p className="text-xs text-muted-foreground text-center">Loading conversation…</p>
                ) : thread.isError ? (
                  <EmptyState
                    title="Could not load this conversation"
                    description={errorMessage(thread.error)}
                    actionLabel="Retry"
                    onAction={() => thread.refetch()}
                  />
                ) : (thread.data?.messages ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center">No messages in this conversation.</p>
                ) : (
                  (thread.data?.messages ?? []).map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1',
                        msg.fromCustomer
                          ? 'bg-muted/80 text-foreground mr-auto border border-border/60 rounded-tl-xs'
                          : 'bg-primary text-primary-foreground ml-auto rounded-tr-xs',
                      )}
                    >
                      {!msg.fromCustomer && (
                        <p className="text-[10px] font-semibold opacity-80 flex items-center gap-1">
                          {msg.sender === 'AI assistant' && <Bot className="h-3 w-3" />}
                          {msg.sender}
                        </p>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">{msg.text}</p>
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 text-[10px] font-mono',
                          msg.fromCustomer ? 'text-muted-foreground' : 'text-primary-foreground/80',
                        )}
                      >
                        <span>{timeOf(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              <div className="border-t border-border/50 p-3 bg-card flex items-center gap-2">
                {providers.length > 1 && (
                  <Select value={provider ?? undefined} onValueChange={(v) => v && setProviderChoice(v as 'meta' | 'waha')}>
                    <SelectTrigger className="h-10 w-[100px] text-xs shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs uppercase">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  placeholder={provider ? 'Type a reply and press Enter...' : 'No active WhatsApp provider configured'}
                  value={reply}
                  disabled={!provider}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  className="h-10 text-xs bg-muted/20"
                />
                <Button
                  size="icon"
                  onClick={handleSendReply}
                  disabled={!reply.trim() || !provider || sendMessage.isPending}
                  className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <EmptyState title="Select a conversation" description="Choose a thread from the left panel to read and reply." />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export function WhatsAppNavLinks() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/whatsapp/inbox', label: 'Inbox', icon: MessageSquare },
    { href: '/admin/whatsapp/templates', label: 'Templates', icon: FileText },
    { href: '/admin/whatsapp/message-log', label: 'Message Log', icon: History },
    { href: '/admin/whatsapp/opt-ins', label: 'Opt-ins', icon: UserCheck },
    { href: '/admin/whatsapp/campaigns', label: 'Campaigns', icon: Megaphone },
    { href: '/admin/whatsapp/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/30 border border-border/50 rounded-xl mb-4">
      {links.map((l) => {
        const Icon = l.icon;
        const isActive = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
              'gap-1.5 text-xs h-8 rounded-lg font-medium transition',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
