'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { LifeBuoy, Plus, Search, Filter, ArrowRight, MessageSquare, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  CustomerEmptyState,
  useSupportContact,
} from '@/features/customer/shared';
import { useCustomerSupportTickets } from '../hooks/use-customer-support';
import { whatsappHref } from '@/lib/api/adapters/customer.adapter';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 20;

const STATUS_FILTERS = { all: 'All Tickets', open: 'Open', pending: 'In progress', closed: 'Closed' };

export function CustomerSupportPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerSupportTickets({
    page,
    perPage: PAGE_SIZE,
  });
  const contact = useSupportContact();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tickets = data?.items;
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    const q = search.toLowerCase().trim();
    return tickets.filter((t) => {
      const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.id.includes(q);
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
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;
  const totalPages = data.meta.totalPages;
  const support = contact.data;
  const whatsapp = support?.whatsapp ? whatsappHref(support.whatsapp) : '';

  return (
    <CustomerPageShell
      title="Support Tickets"
      subtitle="Open technical issues, report line problems, or request a technician visit."
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
            <span className="font-semibold tabular-nums">{data.meta.total}</span>{' '}
            <span className="text-muted-foreground">tickets</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{openCount}</span>{' '}
            <span className="text-muted-foreground">open</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{pendingCount}</span>{' '}
            <span className="text-muted-foreground">in progress</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{closedCount}</span>{' '}
            <span className="text-muted-foreground">closed</span>
          </p>
          {totalPages > 1 && <p className="text-muted-foreground">counts for this page</p>}
        </div>

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
            <Select items={STATUS_FILTERS} value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
              <SelectTrigger className="w-full sm:w-44 text-xs h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_FILTERS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <CustomerEmptyState
            icon={<LifeBuoy className="h-10 w-10 text-muted-foreground/60" />}
            title="No support tickets found"
            description={
              tickets.length === 0
                ? 'You have not opened any support tickets yet.'
                : 'No tickets on this page match your search or filter.'
            }
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
              const lastMsg = ticket.messages[ticket.messages.length - 1];
              return (
                <Link key={ticket.id} href={`/customer/support/${ticket.id}`}>
                  <Card className="hover:border-primary/50 transition-all cursor-pointer p-4 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                          <Badge
                            variant={ticket.status === 'open' ? 'default' : ticket.status === 'pending' ? 'secondary' : 'outline'}
                            className="text-[11px] capitalize"
                          >
                            {ticket.status === 'pending' ? 'in progress' : ticket.status}
                          </Badge>
                          {ticket.priority && (
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
                          )}
                        </div>

                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {ticket.subject || 'Untitled ticket'}
                        </h3>

                        {lastMsg && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-medium text-foreground">{lastMsg.fromMe ? 'You' : 'Support'}:</span>{' '}
                            {lastMsg.body}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-xs text-muted-foreground font-mono">{formatDate(ticket.createdAt)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>
                            {ticket.messages.length} {ticket.messages.length === 1 ? 'message' : 'messages'}
                          </span>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {support && (support.mobile || whatsapp) && (
          <div className="rounded-xl border bg-muted/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              <span>
                Complete outage? Contact {support.name || 'your provider'} directly
                {support.mobile && (
                  <>
                    {' '}
                    at <strong className="font-mono">{support.mobile}</strong>
                  </>
                )}
                .
              </span>
            </div>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline shrink-0">
                WhatsApp →
              </a>
            )}
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
