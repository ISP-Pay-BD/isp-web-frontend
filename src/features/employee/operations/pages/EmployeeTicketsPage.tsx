'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MessageSquare, Search, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApiError } from '@/lib/api/client';
import { formatCount } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { formatDayTime } from '@/features/employee/shared/lib/datetime';
import { useSupportTickets } from '@/features/admin/support/hooks/use-support';
import { EmployeeAccessGate } from '../components/EmployeeAccessGate';

const STATUSES = ['all', 'opened', 'processing', 'closed'] as const;
const PAGE_SIZE = 15;

/** Employee quick action "Tickets": the staff ticket desk (`GET /v1/staff-tickets`, needs `support_ticket.read`). */
export function EmployeeTicketsPage() {
  const t = useTranslations();
  const title = t('employee.tickets.title', 'Support tickets');
  const breadcrumbs = [
    { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/dashboard' },
    { label: title },
  ];
  return (
    <EmployeeAccessGate title={title} breadcrumbs={breadcrumbs} allowed={(p) => p.readTicket}>
      <EmployeePageShell
        title={title}
        subtitle={t('employee.tickets.subtitle', 'Customer tickets you can see and answer.')}
        breadcrumbs={breadcrumbs}
      >
        <TicketList />
      </EmployeePageShell>
    </EmployeeAccessGate>
  );
}

function TicketList() {
  const t = useTranslations();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('opened');
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data, isLoading, isError, error, refetch, isFetching } = useSupportTickets({
    page,
    pageSize: PAGE_SIZE,
    search,
    status,
  });

  const statusLabel = (s: (typeof STATUSES)[number]) =>
    s === 'all'
      ? t('employee.tickets.filter.all', 'All')
      : s === 'opened'
        ? t('employee.tickets.filter.opened', 'Open')
        : s === 'processing'
          ? t('employee.tickets.filter.processing', 'In progress')
          : t('employee.tickets.filter.closed', 'Closed');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label={t('employee.tickets.filter.label', 'Ticket status')}
          className="border-border/60 inline-flex w-fit flex-wrap rounded-lg border p-0.5"
        >
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                'min-h-9 rounded-md px-3 text-sm font-medium transition-colors duration-200 ease-out',
                status === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {statusLabel(s)}
              {data?.stats && s !== 'all' ? (
                <span className="ml-1.5 tabular-nums opacity-80">{formatCount(data.stats[s])}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('employee.tickets.search', 'Search subject or customer…')}
            aria-label={t('employee.tickets.search', 'Search subject or customer…')}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        error instanceof ApiError && error.status === 403 ? (
          <EmployeeEmptyState
            title={t('employee.quick.deniedTitle', 'You do not have access to this')}
            description={error.message}
          />
        ) : (
          <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
        )
      ) : data.items.length === 0 ? (
        <EmployeeEmptyState
          icon={<Ticket className="text-muted-foreground h-5 w-5" />}
          title={t('employee.tickets.empty', 'No tickets here')}
          description={
            search
              ? t('employee.tickets.emptySearch', 'No ticket matches “{q}”.', { q: search })
              : t('employee.tickets.emptyHint', 'There is no ticket with this status right now.')
          }
        />
      ) : (
        <Card className={cn(isFetching && 'opacity-80')}>
          <CardContent className="p-0">
            <ul className="divide-border/60 divide-y">
              {data.items.map((tk) => (
                <li key={tk.id}>
                  <Link
                    href={`/employee/tickets/${tk.id}`}
                    className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition-colors duration-200 ease-out"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        <span className="text-muted-foreground font-mono">#{tk.id}</span>{' '}
                        {tk.subject}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {[tk.customerName, formatDayTime(tk.lastActivityAt || tk.createdAt)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tk.messageCount ? (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums">
                          <MessageSquare className="h-3 w-3" /> {tk.messageCount}
                        </span>
                      ) : null}
                      <StatusBadge status={tk.priority} />
                      <StatusBadge status={tk.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data && data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {t('employee.tickets.page', 'Page {page} of {pages}', {
              page,
              pages: data.meta.totalPages,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label={t('employee.tickets.prev', 'Previous page')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label={t('employee.tickets.next', 'Next page')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
