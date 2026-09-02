'use client';

import Link from 'next/link';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Send,
  User,
  Headphones,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerTicketDetail } from '../hooks/use-customer-support';
import { ticketReplySchema, type TicketReplyInput } from '@/features/customer/shared';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function CustomerTicketDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const { data: ticket, isLoading, isError, refetch, replyMutation } = useCustomerTicketDetail(ticketId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketReplyInput>({
    resolver: zodResolver(ticketReplySchema),
    defaultValues: { message: '' },
  });

  if (isLoading) {
    return (
      <CustomerPageShell title="Ticket Details" subtitle="Loading conversation thread...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !ticket) {
    return (
      <CustomerPageShell title="Ticket Details" subtitle="Support Ticket Inquiry">
        <CustomerErrorState message="Support ticket not found." onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const onSubmit = async (data: TicketReplyInput) => {
    try {
      await replyMutation.mutateAsync({
        ticketId,
        message: data.message,
      });
      toast.success('Reply submitted to support team!');
      reset();
    } catch {
      toast.error('Failed to submit reply. Please try again.');
    }
  };

  return (
    <CustomerPageShell
      title={`Ticket ${ticket.id}`}
      subtitle={`Created on ${formatDate(ticket.createdAt)} · Subject: ${ticket.subject}`}
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Support', href: '/customer/support' },
        { label: ticket.id },
      ]}
      actions={
        <Link href="/customer/support">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Ticket Header Card matching PHP /tickets/partials/thread.php */}
        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant={
                      ticket.status === 'open'
                        ? 'default'
                        : ticket.status === 'pending'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="capitalize"
                  >
                    {ticket.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize font-semibold ${
                      ticket.priority === 'high'
                        ? 'border-rose-500 text-rose-600'
                        : ticket.priority === 'medium'
                        ? 'border-amber-500 text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {ticket.priority} priority
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">{ticket.subject}</CardTitle>
              </div>

              <div className="text-xs text-muted-foreground sm:text-right space-y-1">
                <div className="flex items-center sm:justify-end gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last updated: {formatDate(ticket.updatedAt)}</span>
                </div>
                <div>Customer: {ticket.customerName}</div>
              </div>
            </div>
          </CardHeader>

          {/* Conversation Thread */}
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              {ticket.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${isCustomer ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCustomer
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {isCustomer ? <User className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 shadow-sm ${
                        isCustomer
                          ? 'bg-muted/70 border text-foreground rounded-tl-none'
                          : 'bg-primary text-primary-foreground rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                        <span>{msg.senderName}</span>
                        <span className="opacity-70 font-mono text-[10px]">
                          {formatDate(msg.sentAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            <div className="pt-6 border-t">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="reply" className="text-xs font-bold text-muted-foreground uppercase">
                    Post a Reply
                  </label>
                  <Textarea
                    id="reply"
                    rows={4}
                    placeholder="Type your message or follow-up details here..."
                    {...register('message')}
                    className="resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Support team responds within 2 hours during active shifts.
                  </span>
                  <Button
                    type="submit"
                    disabled={replyMutation.isPending}
                    className="font-bold gap-2 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}
