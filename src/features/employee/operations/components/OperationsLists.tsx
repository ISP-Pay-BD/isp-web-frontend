'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { HandCoins, MapPin, Phone, Receipt, Ticket, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatBdPhone } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { formatDay, formatDayTime, formatMonthName } from '@/features/employee/shared/lib/datetime';
import type { AssignedTicket, DueCustomer, MyCollection } from '../lib/map-operations';

function ListCard({
  icon,
  title,
  description,
  empty,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  empty: string | null;
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-muted-foreground bg-muted/25 rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            {empty}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

const isPast = (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) < new Date() : false;
};

/** Up to 10 customers in my areas who have not paid this month, soonest expiry first. */
export function DueCustomersCard({
  customers,
  total,
  hasAreas,
  canCollect = false,
}: {
  customers: DueCustomer[];
  total: number;
  hasAreas: boolean;
  /** `can_create_payment`: each row links to the Collect payment screen with the customer preset. */
  canCollect?: boolean;
}) {
  const t = useTranslations();
  const empty = !hasAreas
    ? t(
        'employee.operations.noAreas',
        'No service area is assigned to you yet. Ask your manager to assign one.',
      )
    : customers.length
      ? null
      : t('employee.operations.noDue', 'Everyone in your areas has paid this month.');
  return (
    <ListCard
      icon={<Users className="text-primary h-4 w-4" />}
      title={t('employee.operations.dueTitle', 'Due customers in my area')}
      description={
        total > customers.length
          ? t('employee.operations.dueShowing', 'Showing {shown} of {total}', {
              shown: customers.length,
              total,
            })
          : undefined
      }
      empty={empty}
    >
      <ul className="divide-border/60 divide-y">
        {customers.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.name || `#${c.id}`}</p>
              <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                {c.areaName ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {c.areaName}
                  </span>
                ) : null}
                <span>{c.packageName}</span>
                {c.willExpire ? (
                  <span className={isPast(c.willExpire) ? 'text-destructive' : undefined}>
                    {t('employee.operations.expires', 'Expires {date}', {
                      date: formatDay(c.willExpire),
                    })}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyDisplay amount={c.packagePrice} className="text-sm font-semibold" />
              {c.mobile ? (
                <a
                  href={`tel:${c.mobile}`}
                  className="border-border/60 hover:bg-muted inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors duration-200 ease-out"
                  aria-label={t('employee.operations.call', 'Call {name}', {
                    name: c.name || c.mobile,
                  })}
                >
                  <Phone className="h-3.5 w-3.5" /> {formatBdPhone(c.mobile)}
                </a>
              ) : null}
              {canCollect ? (
                <Link
                  href={`/employee/collect-payment?${new URLSearchParams({
                    customerId: c.id,
                    name: c.name,
                    mobile: c.mobile,
                    price: String(c.packagePrice || ''),
                  }).toString()}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-200 ease-out"
                  aria-label={t('employee.quick.collectFrom', 'Collect payment from {name}', {
                    name: c.name || c.mobile || c.id,
                  })}
                >
                  <HandCoins className="h-3.5 w-3.5" /> {t('employee.quick.collect', 'Collect')}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </ListCard>
  );
}

/** The 6 most recent payments I recorded. */
export function RecentCollectionsCard({ items }: { items: MyCollection[] }) {
  const t = useTranslations();
  return (
    <ListCard
      icon={<Receipt className="text-primary h-4 w-4" />}
      title={t('employee.operations.recentTitle', 'My recent collections')}
      empty={
        items.length
          ? null
          : t('employee.operations.noCollections', 'You have not collected any payment yet.')
      }
    >
      <ul className="divide-border/60 divide-y">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {p.customerName || p.customerMobile || p.invoice || `#${p.id}`}
              </p>
              <p className="text-muted-foreground text-xs">
                {[formatMonthName(p.month), p.paidVia, formatDayTime(p.createdAt)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CurrencyDisplay amount={p.amount} className="text-sm font-semibold" />
              <StatusBadge status={p.status === 'successful' ? 'paid' : p.status || 'pending'} />
            </div>
          </li>
        ))}
      </ul>
    </ListCard>
  );
}

/** Up to 5 open / in-progress / pending tickets assigned to me. */
export function AssignedTicketsCard({
  items,
  total,
  linkTickets = false,
}: {
  items: AssignedTicket[];
  total: number;
  /** Link each ticket to the employee ticket screen. */
  linkTickets?: boolean;
}) {
  const t = useTranslations();
  return (
    <ListCard
      icon={<Ticket className="text-primary h-4 w-4" />}
      title={t('employee.operations.ticketsTitle', 'Assigned tickets')}
      description={
        total > items.length
          ? t('employee.operations.dueShowing', 'Showing {shown} of {total}', {
              shown: items.length,
              total,
            })
          : undefined
      }
      empty={
        items.length
          ? null
          : t('employee.operations.noTickets', 'No open ticket is assigned to you.')
      }
    >
      <ul className="divide-border/60 divide-y">
        {items.map((tk) => (
          <li key={tk.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                <span className="text-muted-foreground font-mono">#{tk.id}</span>{' '}
                {linkTickets ? (
                  <Link href={`/employee/tickets/${tk.id}`} className="hover:underline">
                    {tk.subject}
                  </Link>
                ) : (
                  tk.subject
                )}
              </p>
              <p className="text-muted-foreground text-xs">{formatDayTime(tk.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {tk.priority ? <StatusBadge status={tk.priority} /> : null}
              <StatusBadge status={tk.status} />
            </div>
          </li>
        ))}
      </ul>
    </ListCard>
  );
}
