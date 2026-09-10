'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Phone,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppConversation, WhatsAppMessage } from '@/data/admin/comms.data';

const CANNED_REPLIES = [
  'Dear subscriber, we have verified your payment. Thank you!',
  'Please power off your ONU device for 30 seconds and restart.',
  'Our optical fiber team is en route to your area to restore connectivity.',
  'Your monthly invoice has been generated. Pay online via bKash.',
];

export function WhatsAppInboxPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'waha' | 'meta'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);

  // Sync initial conversations
  useMemo(() => {
    if (data?.conversations && conversations.length === 0) {
      setConversations(data.conversations);
    }
  }, [data?.conversations, conversations.length]);

  const list = conversations.length > 0 ? conversations : (data?.conversations ?? []);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      const matchSearch =
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase());
      const matchProvider = providerFilter === 'all' || c.provider === providerFilter;
      return matchSearch && matchProvider;
    });
  }, [list, search, providerFilter]);

  const active = useMemo(() => {
    return filtered.find((c) => c.id === activeId) ?? filtered[0] ?? null;
  }, [filtered, activeId]);

  const handleSendReply = (textToSend?: string) => {
    const text = textToSend ?? reply;
    if (!text.trim() || !active) return;

    const newMsg: WhatsAppMessage = {
      id: `wam_${Date.now()}`,
      sender: 'agent',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      provider: active.provider,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              unreadCount: 0,
              lastMessage: text.trim(),
              lastTimestamp: new Date().toISOString(),
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    toast.success(`Message sent to ${active.customerName} via ${active.provider.toUpperCase()}`);
    setReply('');
  };

  const handleSimulateInbound = () => {
    if (!active) return;
    const incoming: WhatsAppMessage = {
      id: `wam_in_${Date.now()}`,
      sender: 'user',
      text: 'Thank you! The connection is running at full speed now.',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      provider: active.provider,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              lastMessage: incoming.text,
              lastTimestamp: incoming.timestamp,
              messages: [...c.messages, incoming],
            }
          : c
      )
    );
    toast.info(`New incoming message received from ${active.customerName}`);
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load inbox"
        description="Could not fetch WhatsApp conversations."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const totalUnread = list.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Business Inbox"
        subtitle="Unified omnichannel messaging hub for Meta Cloud API and self-hosted WAHA bridge"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Inbox' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleSimulateInbound}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Simulate Inbound Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                refetch();
                toast.success('Synced with WhatsApp Webhook queue');
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              Sync
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Active Conversations', value: list.length },
          { label: 'Unread Messages', value: totalUnread },
          { label: 'WAHA Gateway', value: 'CONNECTED (Session: default)' },
          { label: 'Meta Cloud API', value: 'Active (Webhooks 200 OK)' },
          { label: 'Avg Response Time', value: '< 2.4 min' },
        ]}
      />

      {/* Main 2-Pane Chat Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-21rem)] min-h-[560px]">
        {/* Left Sidebar: Thread List (4 Cols) */}
        <Card className="lg:col-span-4 flex flex-col overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="p-3 border-b border-border/50 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, phone or text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-muted/20"
              />
            </div>
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              {(['all', 'waha', 'meta'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProviderFilter(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    providerFilter === p
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {p === 'all' ? 'All Threads' : p.toUpperCase()}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <EmptyState
                  title="No conversations found"
                  description="Try adjusting your search or provider filter."
                  actionLabel="Reset Filter"
                  onAction={() => {
                    setSearch('');
                    setProviderFilter('all');
                  }}
                />
              </div>
            ) : (
              filtered.map((conv) => {
                const isSelected = active?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveId(conv.id);
                      if (conv.unreadCount > 0) {
                        setConversations((prev) =>
                          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                        );
                      }
                    }}
                    className={cn(
                      'w-full text-left p-3.5 hover:bg-muted/40 transition-all relative block',
                      isSelected && 'bg-primary/5 border-l-3 border-l-primary'
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {conv.customerName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-xs text-foreground block truncate">
                            {conv.customerName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {conv.phone}
                          </span>
                        </div>
                      </div>
                      {conv.unreadCount > 0 ? (
                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                          {conv.unreadCount}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-mono px-1 py-0 ${
                            conv.provider === 'meta' ? 'text-blue-500 border-blue-300' : 'text-emerald-500 border-emerald-300'
                          }`}
                        >
                          {conv.provider}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1.5 font-mono">
                      {conv.lastMessage}
                    </p>
                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                      <span>{conv.provider === 'meta' ? 'Meta Cloud API' : 'WAHA Session'}</span>
                      <span>
                        {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Chat Stream & Composer (8 Cols) */}
        <Card className="lg:col-span-8 flex flex-col overflow-hidden border-border/60 shadow-sm">
          {active ? (
            <>
              {/* Active Conversation Top Bar */}
              <CardHeader className="border-b border-border/50 py-3 px-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold text-sm">
                      {active.customerName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                        {active.customerName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        <span>{active.phone}</span>
                        <span>·</span>
                        <span className="text-emerald-500 font-sans font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                          Online ({active.provider.toUpperCase()})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => toast.info(`Viewing customer billing profile for ${active.customerName}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="hidden sm:inline">CRM Profile</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Message Stream */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
                <div className="text-center my-1">
                  <span className="text-[10px] text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/40 font-mono">
                    End-to-End Encrypted via {active.provider === 'meta' ? 'WhatsApp Business Platform' : 'WAHA Local Bridge'}
                  </span>
                </div>

                {active.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent' || msg.sender === 'system';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1',
                        isAgent
                          ? 'bg-primary text-primary-foreground ml-auto rounded-tr-xs'
                          : 'bg-muted/80 text-foreground mr-auto border border-border/60 rounded-tl-xs'
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">{msg.text}</p>
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 text-[10px] font-mono',
                          isAgent ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                      >
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isAgent && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="h-3.5 w-3.5 text-sky-200 inline" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="h-3.5 w-3.5 opacity-70 inline" />
                            ) : (
                              <Check className="h-3.5 w-3.5 opacity-70 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>

              {/* Quick Canned Replies */}
              <div className="px-4 py-2 bg-muted/15 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Quick:
                </span>
                {CANNED_REPLIES.map((cr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(cr)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border/60 hover:bg-muted text-foreground/80 shrink-0 transition-colors truncate max-w-[220px]"
                    title={cr}
                  >
                    {cr}
                  </button>
                ))}
              </div>

              {/* Message Composer Bar */}
              <div className="border-t border-border/50 p-3 bg-card flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => toast.info('Media attachment selected (.pdf / .png / .jpg)')}
                  title="Attach Media or Invoice"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message reply or press Enter..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  className="h-10 text-xs bg-muted/20"
                />
                <Button
                  size="icon"
                  onClick={() => handleSendReply()}
                  disabled={!reply.trim()}
                  className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Select a conversation"
                description="Choose a subscriber thread from the left panel to begin two-way communication."
              />
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
              'gap-1.5 text-xs h-8 rounded-lg font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
