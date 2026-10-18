'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { LifeBuoy, Plus, Search, Filter, ArrowRight, MessageSquare, HelpCircle, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  CustomerEmptyState,
  useSupportContact,
} from '@/features/customer/shared';
import { useCustomerSupportTickets } from '../hooks/use-customer-support';
import { ticketPriorityLabel, ticketPriorityTone, ticketStatusLabel, ticketStatusTone } from '../lib/ticket-labels';
import { whatsappHref } from '@/lib/api/adapters/customer.adapter';
import { formatCount, formatDate } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';

const PAGE_SIZE = 20;

export function CustomerSupportPage() {
  const { t } = useLocale();
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
    return tickets.filter((ticket) => {
      const matchSearch = !q || ticket.subject.toLowerCase().includes(q) || ticket.id.includes(q);
      const matchStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const title = t('customer.support.title', 'Support tickets');
  const crumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.support.crumb', 'Support') },
  ];
  const newTicketLabel = t('customer.support.newTicket', 'Open new ticket');

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.support.loading', 'Loading your tickets…')} breadcrumbs={crumbs}>
        <CustomerLoadingSkeleton variant="support" />
      </CustomerPageShell>
    );
  }

  if (isError || !data || !tickets) {
    return (
      <CustomerPageShell title={title} breadcrumbs={crumbs}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const openCount = tickets.filter((ticket) => ticket.status === 'open').length;
  const pendingCount = tickets.filter((ticket) => ticket.status === 'pending').length;
  const closedCount = tickets.filter((ticket) => ticket.status === 'closed').length;
  const totalPages = data.meta.totalPages;
  const support = contact.data;
  const whatsapp = support?.whatsapp ? whatsappHref(support.whatsapp) : '';

  const statusFilters = {
    all: t('customer.support.filterAll', 'All tickets'),
    open: ticketStatusLabel(t, 'open'),
    pending: ticketStatusLabel(t, 'pending'),
    closed: ticketStatusLabel(t, 'closed'),
  };

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.support.subtitle', 'Open technical issues, report line problems, or request a technician visit.')}
      breadcrumbs={crumbs}
      actions={
        <Button className="h-11 w-full gap-2 font-semibold shadow-sm sm:w-auto" render={<Link href="/customer/support/new" />}>
          <Plus className="h-4 w-4" />
          {newTicketLabel}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{formatCount(data.meta.total)}</span>{' '}
            <span className="text-muted-foreground">{t('customer.support.countTickets', 'tickets')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{formatCount(openCount)}</span>{' '}
            <span className="text-muted-foreground">{t('customer.support.countOpen', 'open')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{formatCount(pendingCount)}</span>{' '}
            <span className="text-muted-foreground">{t('customer.support.countProgress', 'in progress')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{formatCount(closedCount)}</span>{' '}
            <span className="text-muted-foreground">{t('customer.support.countClosed', 'closed')}</span>
          </p>
          {totalPages > 1 && <p className="text-muted-foreground">{t('customer.support.countsPage', 'counts for this page')}</p>}
        </div>

        <div className="bg-card flex flex-col items-stretch justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="relative w-full sm:w-80">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('customer.support.search', 'Search ticket subject or ID…')}
              aria-label={t('customer.support.search', 'Search ticket subject or ID…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="text-muted-foreground hidden h-4 w-4 sm:block" />
            <Select items={statusFilters} value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
              <SelectTrigger className="w-full data-[size=default]:h-11 sm:w-44" aria-label={t('customer.support.filterLabel', 'Filter by status')}>
                <SelectValue placeholder={t('customer.support.filterLabel', 'Filter by status')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusFilters).map(([value, label]) => (
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
            icon={<LifeBuoy className="text-muted-foreground/60 h-10 w-10" />}
            title={t('customer.support.emptyTitle', 'No support tickets found')}
            description={
              tickets.length === 0
                ? t('customer.support.emptyNone', 'You have not opened any support tickets yet.')
                : t('customer.support.emptyFiltered', 'No tickets on this page match your search or filter.')
            }
            action={
              <Button className="h-11 gap-2 font-semibold" render={<Link href="/customer/support/new" />}>
                <Plus className="h-4 w-4" />
                {t('customer.support.createTicket', 'Create ticket')}
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3">
            {filteredTickets.map((ticket) => {
              const lastMsg = ticket.messages[ticket.messages.length - 1];
              const count = ticket.messages.length;
              return (
                <li key={ticket.id}>
                  <Link
                    href={`/customer/support/${ticket.id}`}
                    className="focus-visible:ring-ring/50 group block min-h-11 rounded-xl outline-none focus-visible:ring-3"
                  >
                    <Card className="group-hover:border-primary/50 gap-3 p-4 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-foreground group-hover:text-primary line-clamp-2 min-w-0 text-base leading-snug font-semibold break-words transition-colors">
                          {ticket.subject || t('customer.support.untitled', 'Untitled ticket')}
                        </h3>
                        <StatusBadge
                          status={ticket.status}
                          tone={ticketStatusTone(ticket.status)}
                          label={ticketStatusLabel(t, ticket.status)}
                          className="shrink-0"
                        />
                      </div>

                      {lastMsg && (
                        <p className="text-muted-foreground line-clamp-1 text-sm">
                          <span className="text-foreground font-medium">
                            {lastMsg.fromMe ? t('customer.ticket.you', 'You') : t('customer.ticket.support', 'Support')}:
                          </span>{' '}
                          {lastMsg.body}
                        </p>
                      )}

                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                        <span className="font-mono">#{ticket.id}</span>
                        {ticket.priority && (
                          <Badge variant="outline" tone={ticketPriorityTone(ticket.priority)} className="font-semibold">
                            {t('customer.ticket.priorityBadge', '{priority} priority', {
                              priority: ticketPriorityLabel(t, ticket.priority),
                            })}
                          </Badge>
                        )}
                        <span>
                          {t('customer.support.lastMessage', 'Last message {time}', {
                            time: lastMsg?.sentAt || formatDate(ticket.createdAt),
                          })}
                        </span>
                        <span className="ml-auto flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {count === 1
                            ? t('customer.support.messageOne', '1 message')
                            : t('customer.support.messageMany', '{n} messages', { n: formatCount(count) })}
                          <ArrowRight className="text-primary ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="text-muted-foreground flex items-center justify-end gap-2 text-sm">
            <span>
              {t('customer.support.pageOf', 'Page {page} of {total}', { page: formatCount(page), total: formatCount(totalPages) })}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11"
              aria-label={t('customer.support.prevPage', 'Previous page')}
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11"
              aria-label={t('customer.support.nextPage', 'Next page')}
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {support && (support.mobile || whatsapp) && (
          <div className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t('customer.support.outage', 'Complete outage? Contact {name} directly.', {
                  name: support.name || t('customer.support.yourProvider', 'your provider'),
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {support.mobile && (
                <Button variant="outline" className="h-11 gap-2 font-mono" render={<a href={`tel:${support.mobile}`} />}>
                  <Phone className="h-4 w-4" />
                  {support.mobile}
                </Button>
              )}
              {whatsapp && (
                <Button variant="outline" className="h-11 gap-2 font-semibold" render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>
                  {t('customer.support.whatsapp', 'WhatsApp')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
