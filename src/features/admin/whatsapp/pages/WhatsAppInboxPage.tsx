'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { Search, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppInboxPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState title="Failed to load inbox" description="Could not fetch WhatsApp conversations." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  const list = data.conversations;
  const filtered = list.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );
  const active = filtered.find((c) => c.id === activeId) ?? filtered[0];

  const handleSendReply = () => {
    if (!reply.trim() || !active) return;
    toast.success('Reply sent via WAHA session');
    setReply('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Inbox"
        subtitle="Unified inbox for Meta Cloud API and WAHA session messages"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Inbox' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-16rem)] min-h-[480px]">
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 divide-y">
            {filtered.length === 0 ? (
              <div className="p-6"><EmptyState title="No conversations" description="Inbox is empty." /></div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    'w-full text-left p-3 hover:bg-muted/50 transition-colors',
                    active?.id === conv.id && 'bg-muted/60 border-l-2 border-l-primary'
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-sm truncate">{conv.customerName}</span>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 px-1.5 text-[10px]">{conv.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{conv.lastMessage}</p>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                    <span>{conv.provider.toUpperCase()}</span>
                    <span>{new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {active ? (
            <>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  {active.customerName}
                  <span className="text-xs font-mono text-muted-foreground font-normal">{active.phone}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {active.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.sender === 'user' ? 'bg-muted mr-auto' : 'bg-primary text-primary-foreground ml-auto'
                    )}
                  >
                    <p>{msg.text}</p>
                    <p className="text-[10px] opacity-70 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-3 flex gap-2">
                <Input placeholder="Type a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} />
                <Button size="icon" onClick={handleSendReply}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <EmptyState title="Select a conversation" description="Choose a thread from the left panel." />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export function WhatsAppNavLinks() {
  const links = [
    { href: '/admin/whatsapp/inbox', label: 'Inbox' },
    { href: '/admin/whatsapp/templates', label: 'Templates' },
    { href: '/admin/whatsapp/message-log', label: 'Message Log' },
    { href: '/admin/whatsapp/opt-ins', label: 'Opt-ins' },
    { href: '/admin/whatsapp/campaigns', label: 'Campaigns' },
    { href: '/admin/whatsapp/settings', label: 'Settings' },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
