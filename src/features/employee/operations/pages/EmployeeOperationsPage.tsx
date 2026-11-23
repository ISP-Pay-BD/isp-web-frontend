'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Banknote,
  HandCoins,
  UserPlus,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  HardHat,
  RefreshCw,
  Ticket,
  Wallet,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeErrorState,
  EmployeeEmptyState,
} from '@/features/employee/shared';
import { formatMonthName } from '@/features/employee/shared/lib/datetime';
import { useEmployeeOperations } from '../hooks/use-employee-operations';
import type { EmployeeOperations } from '../lib/map-operations';
import {
  AssignedTicketsCard,
  DueCustomersCard,
  RecentCollectionsCard,
} from '../components/OperationsLists';

const QUICK_ACTIONS = [
  {
    href: '/employee/jobs',
    icon: ClipboardList,
    key: 'employee.operations.qa.jobs',
    label: 'Work orders',
  },
  {
    href: '/employee/installations',
    icon: HardHat,
    key: 'employee.operations.qa.installations',
    label: 'Installations',
  },
  {
    href: '/employee/attendance',
    icon: CalendarCheck,
    key: 'employee.operations.qa.attendance',
    label: 'Attendance',
  },
  {
    href: '/employee/advance-salary',
    icon: Wallet,
    key: 'employee.operations.qa.advance',
    label: 'Advance salary',
  },
] as const;

/** Quick actions that call admin endpoints — shown only with the `can_*` flag the API reported (lane W2-R13). */
const PERMISSION_ACTIONS = [
  {
    href: '/employee/collect-payment',
    icon: HandCoins,
    key: 'employee.quick.collectPayment',
    label: 'Collect payment',
    allowed: (p: EmployeeOperations['perms']) => p.createPayment,
  },
  {
    href: '/employee/customers/new',
    icon: UserPlus,
    key: 'employee.quick.addCustomer',
    label: 'Add customer',
    allowed: (p: EmployeeOperations['perms']) => p.createCustomer,
  },
  {
    href: '/employee/tickets',
    icon: Ticket,
    key: 'employee.quick.tickets',
    label: 'Tickets',
    allowed: (p: EmployeeOperations['perms']) => p.readTicket,
  },
] as const;

/** Employee portal home — operations dashboard (PHP dashboard/employee.php). */
export function EmployeeOperationsPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch, isFetching } = useEmployeeOperations();
  const title = t('employee.operations.title', 'My operations');
  const breadcrumbs = [
    { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/dashboard' },
    { label: t('employee.operations.breadcrumb', 'Dashboard') },
  ];

  if (isLoading) {
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }
  if (isError || !data) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        {forbidden ? (
          <EmployeeEmptyState
            icon={<AlertCircle className="text-muted-foreground h-5 w-5" />}
            title={t('employee.operations.forbidden', 'Dashboard not available')}
            description={error.message}
          />
        ) : (
          <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
        )}
      </EmployeePageShell>
    );
  }

  const { area, collections, tickets } = data;
  const month = formatMonthName(data.month);
  const nothing = !area && !collections && !tickets;

  return (
    <EmployeePageShell
      title={title}
      subtitle={t(
        'employee.operations.subtitle',
        'Your areas, collections and tickets for {month}',
        { month },
      )}
      breadcrumbs={breadcrumbs}
      actions={
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw
            className={
              isFetching
                ? 'mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none'
                : 'mr-1.5 h-4 w-4'
            }
          />
          {t('employee.operations.refresh', 'Refresh')}
        </Button>
      }
    >
      <div className="space-y-6">
        <nav
          aria-label={t('employee.operations.quickActions', 'Quick actions')}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {[...PERMISSION_ACTIONS.filter((a) => a.allowed(data.perms)), ...QUICK_ACTIONS].map(
            ({ href, icon: Icon, key, label }) => (
              <Link
                key={href}
                href={href}
                className="border-border/60 bg-card hover:border-primary/40 flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-200 ease-out hover:shadow-[var(--shadow-sm)]"
              >
                <Icon className="text-primary h-4 w-4 shrink-0" /> {t(key, label)}
              </Link>
            ),
          )}
        </nav>

        {nothing ? (
          <EmployeeEmptyState
            title={t('employee.operations.noSections', 'Nothing to show yet')}
            description={t(
              'employee.operations.noSectionsHint',
              'You do not have access to customers, payments or tickets. Ask your manager if you need them.',
            )}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {area ? (
              <>
                <StatCard
                  title={t('employee.operations.areaPaid', 'Paid in my area')}
                  value={<CurrencyDisplay amount={area.paidAmount} />}
                  description={t('employee.operations.customersCount', '{count} customers', {
                    count: formatCount(area.paidCount),
                  })}
                  icon={CheckCircle2}
                />
                <StatCard
                  title={t('employee.operations.areaDue', 'Due in my area')}
                  value={<CurrencyDisplay amount={area.dueAmount} />}
                  description={t('employee.operations.customersCount', '{count} customers', {
                    count: formatCount(area.dueCount),
                  })}
                  icon={AlertCircle}
                />
              </>
            ) : null}
            {collections ? (
              <>
                <StatCard
                  title={t('employee.operations.today', 'Collected today')}
                  value={<CurrencyDisplay amount={collections.todayAmount} />}
                  description={t('employee.operations.paymentsCount', '{count} payments', {
                    count: formatCount(collections.todayCount),
                  })}
                  icon={Banknote}
                />
                <StatCard
                  title={t('employee.operations.thisMonth', 'Collected this month')}
                  value={<CurrencyDisplay amount={collections.monthAmount} />}
                  description={t('employee.operations.paymentsCount', '{count} payments', {
                    count: formatCount(collections.monthCount),
                  })}
                  icon={Banknote}
                />
              </>
            ) : null}
            {tickets ? (
              <StatCard
                title={t('employee.operations.openTickets', 'Open tickets assigned')}
                value={formatCount(tickets.count)}
                icon={Ticket}
              />
            ) : null}
          </div>
        )}

        {area ? (
          <DueCustomersCard
            customers={area.dueCustomers}
            total={area.dueCount}
            hasAreas={data.hasAreas}
            canCollect={data.perms.createPayment}
          />
        ) : null}
        {collections || tickets ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {collections ? <RecentCollectionsCard items={collections.recent} /> : null}
            {tickets ? (
              <AssignedTicketsCard items={tickets.items} total={tickets.count} linkTickets />
            ) : null}
          </div>
        ) : null}
      </div>
    </EmployeePageShell>
  );
}
