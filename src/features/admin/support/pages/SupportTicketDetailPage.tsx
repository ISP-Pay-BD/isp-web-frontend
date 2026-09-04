'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { ArrowLeft, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { SupportTicket, TicketMessage } from '@/data/shared/types';
import { useSupportTicket } from '../hooks/use-support';

export function SupportTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;
  const { data: ticket, isLoading, isError } = useSupportTicket(ticketId);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<SupportTicket['status']>('open');
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const displayTicket = ticket as SupportTicket | undefined;
  const thread = messages.length > 0 ? messages : displayTicket?.messages ?? [];

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError || !displayTicket) {
    return (
      <EmptyState
        title="Ticket not found"
        description="This support ticket may have been deleted."
        actionLabel="Back to tickets"
        onAction={() => router.push('/admin/support')}
      />
    );
  }

  const currentStatus = status || displayTicket.status;

  const handleSendReply = () => {
    if (!reply.trim()) return;
    const newMsg: TicketMessage = {
      id: `msg_${Date.now()}`,
      sender: 'admin',
      senderName: 'Support Admin',
      body: reply.trim(),
      sentAt: new Date().toISOString(),
    };
    setMessages([...thread, newMsg]);
    setReply('');
    toast.success('Reply sent to customer');
  };

  const handleStatusChange = (v: string | null) => {
    if (!v) return;
    setStatus(v as SupportTicket['status']);
    toast.success(`Ticket status updated to ${v}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayTicket.subject}
        subtitle={`Ticket ${displayTicket.id} · ${displayTicket.customerName}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Support', url: '/admin/support' },
          { label: displayTicket.id },
        ]}
        actions={
          <Link href="/admin/support" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col min-h-[480px]">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base">Message Thread</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {thread.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[90%]',
                  msg.sender === 'admin' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                  msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <User className="h-4 w-4" />
                </div>
                <div className={cn(
                  'rounded-lg px-3 py-2 text-sm space-y-1',
                  msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <p className="text-xs font-semibold opacity-80">{msg.senderName}</p>
                  <p>{msg.body}</p>
                  <p className="text-[10px] opacity-70">{formatDate(msg.sentAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <Can menu="support" action="send_msg">
            <div className="border-t p-4 space-y-2">
              <Textarea
                placeholder="Write your reply to the customer..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          </Can>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Ticket Details</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{displayTicket.customerName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge>{displayTicket.priority}</Badge></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(displayTicket.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span>{formatDate(displayTicket.updatedAt)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
