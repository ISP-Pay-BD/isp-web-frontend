'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState, CustomerEmptyState } from '@/features/customer/shared';
import { useCustomerSupportTickets } from '../hooks/use-customer-support';
import { formatDate } from '@/lib/format';

export function CustomerSupportPage() {
  const { data, isLoading, isError, refetch } = useCustomerSupportTickets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tickets = data?.tickets;
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter((t) => {
      const matchSearch =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  if (isLoading) {
    return (
      <CustomerPageShell title="Customer Support" subtitle="Loading support tickets...">
        <CustomerLoadingSkeleton variant="support" />
      </CustomerPageShell>
    );
  }

  if (isError || !data || !tickets) {
    return (
      <CustomerPageShell title="Customer Support" subtitle="Helpdesk & NOC Tickets">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;

  return (
    <CustomerPageShell
      title="Support Tickets"
      subtitle="Open technical issues, report line degradation, or request fiber technician visits."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Support' },
      ]}
      actions={
        <Link href="/customer/support/new">
          <Button className="font-semibold gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Open New Ticket
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{openCount}</span>{' '}
            <span className="text-muted-foreground">open</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{pendingCount}</span>{' '}
            <span className="text-muted-foreground">pending</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{closedCount}</span>{' '}
            <span className="text-muted-foreground">closed</span>
          </p>
          <p className="text-muted-foreground">Avg resolution ~2.4 hrs</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border bg-card">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ticket subject or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
              <SelectTrigger className="w-full sm:w-44 text-xs h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ticket List */}
        {filteredTickets.length === 0 ? (
          <CustomerEmptyState
            icon={<LifeBuoy className="h-10 w-10 text-muted-foreground/60" />}
            title="No support tickets found"
            description="You currently have no open or past support issues matching this filter."
            action={
              <Link href="/customer/support/new">
                <Button size="sm" className="gap-2 font-bold">
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3">
            {filteredTickets.map((ticket) => {
              const msgCount = ticket.messages?.length ?? 1;
              const lastMsg = ticket.messages?.[ticket.messages.length - 1];

              return (
                <Link key={ticket.id} href={`/customer/support/${ticket.id}`}>
                  <Card className="hover:border-primary/50 transition-all cursor-pointer p-4 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                          <Badge
                            variant={
                              ticket.status === 'open'
                                ? 'default'
                                : ticket.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-[11px] capitalize"
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize font-semibold ${
                              ticket.priority === 'high'
                                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                                : ticket.priority === 'medium'
                                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {ticket.priority} priority
                          </Badge>
                        </div>

                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {ticket.subject}
                        </h3>

                        {lastMsg && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-medium text-foreground">
                              {lastMsg.sender === 'admin' ? 'Support Agent' : 'You'}:
                            </span>{' '}
                            {lastMsg.body}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDate(ticket.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{msgCount} messages</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Emergency contact box */}
        <div className="rounded-xl border bg-muted/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
            <span>
              Fiber cut or complete outage? For immediate NOC dispatch, call{' '}
              <strong className="font-mono">01700-000000</strong> or message WhatsApp{' '}
              <strong className="font-mono">01700000000</strong>.
            </span>
          </div>
          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline shrink-0"
          >
            Live Chat NOC →
          </a>
        </div>
      </div>
    </CustomerPageShell>
  );
}
