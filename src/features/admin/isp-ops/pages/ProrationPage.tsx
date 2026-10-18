'use client';

import { useMemo, useState } from 'react';
import { Calculator, Calendar, ArrowRight, Info } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatBdt, formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { BillingCustomerPicker } from '../components/BillingCustomerPicker';
import {
  fmtDay,
  todayYmd,
  useBillingPackageOptions,
  useProrationQuote,
  type BillingCustomerOption,
} from '../hooks/use-billing-config';

export function ProrationPage() {
  const packages = useBillingPackageOptions();
  const [customer, setCustomer] = useState<BillingCustomerOption | null>(null);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [changeDate, setChangeDate] = useState(todayYmd());

  const quote = useProrationQuote({ customerId: customer?.id ?? null, packageId, changeDate });
  const q = quote.data;

  const targetOptions = useMemo(
    () => (packages.data ?? []).filter((p) => p.active && p.id !== customer?.packageId),
    [packages.data, customer?.packageId],
  );
  const selectItems = useMemo(
    () => Object.fromEntries(targetOptions.map((p) => [String(p.id), `${p.name} — ${formatBdtWithSymbol(p.price)}`])),
    [targetOptions],
  );
  const currentPackage = useMemo(
    () => (packages.data ?? []).find((p) => p.id === customer?.packageId) ?? null,
    [packages.data, customer?.packageId],
  );

  if (packages.isError) {
    return (
      <EmptyState
        title="Failed to load packages"
        description={errorMessage(packages.error, 'Could not load your package catalogue.')}
        actionLabel="Retry"
        onAction={() => packages.refetch()}
      />
    );
  }

  const isUpgrade = q ? q.net >= 0 : true;

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Proration Calculator"
        subtitle="Work out the credit, charge and net amount when a customer moves to another package before their expiry date. Nothing is billed or changed here."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Proration' },
        ]}
      />

      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-md overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Mid-Cycle Package Change</h3>
            </div>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-primary/30 text-primary font-mono">
              Read-only quote
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Customer */}
            <div className="space-y-1.5">
              <label htmlFor="pr-customer" className="text-[11px] font-semibold text-muted-foreground">Customer</label>
              <BillingCustomerPicker
                id="pr-customer"
                value={customer}
                onChange={(c) => {
                  setCustomer(c);
                  setPackageId(null);
                }}
              />
              {customer && (
                <p className="text-[10px] text-muted-foreground">
                  Current: {currentPackage ? `${currentPackage.name} (${formatBdtWithSymbol(currentPackage.price)})` : 'no priced package'}
                  {customer.willExpire ? ` · expires ${fmtDay(customer.willExpire)}` : ''}
                </p>
              )}
            </div>

            {/* Target package */}
            <div className="space-y-1.5">
              <label htmlFor="pr-package" className="text-[11px] font-semibold text-muted-foreground">New Package</label>
              {packages.isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  items={selectItems}
                  value={packageId !== null ? String(packageId) : null}
                  onValueChange={(v) => setPackageId(v ? Number(v) : null)}
                  disabled={!customer || targetOptions.length === 0}
                >
                  <SelectTrigger id="pr-package" className="h-9 w-full text-xs">
                    <SelectValue placeholder={targetOptions.length === 0 ? 'No other packages' : 'Choose package'} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — {formatBdtWithSymbol(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Change date */}
            <div className="space-y-1.5">
              <label htmlFor="pr-date" className="text-[11px] font-semibold text-muted-foreground">Change Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="pr-date"
                  type="date"
                  value={changeDate}
                  onChange={(e) => setChangeDate(e.target.value)}
                  className="pl-8 h-9 text-xs font-mono font-bold"
                />
              </div>
              {q && (
                <p className="text-[10px] text-muted-foreground">
                  {q.daysRemaining} of {q.cycleDays} days remaining
                </p>
              )}
            </div>

            {/* Net */}
            <div
              className={cn(
                'p-4 rounded-lg border flex flex-col justify-between',
                isUpgrade ? 'bg-primary/10 border-primary/30' : 'bg-emerald-500/10 border-emerald-500/30',
              )}
            >
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {q ? (isUpgrade ? 'Net Payable by Customer' : 'Net Credit to Customer') : 'Net Adjustment'}
              </span>
              {quote.isFetching && !q ? (
                <Skeleton className="mt-2 h-7 w-28" />
              ) : q ? (
                <p className="text-xl font-bold font-mono text-foreground mt-1 tabular-nums">
                  {formatBdtWithSymbol(Math.abs(q.net))}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Pick a customer and a package</p>
              )}
            </div>
          </div>

          {quote.isError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {errorMessage(quote.error, 'Could not calculate the proration.')}
            </div>
          )}

          {q && (
            <>
              {q.expired && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  The customer&apos;s package has already expired on the change date — there is nothing left to prorate.
                </div>
              )}

              <div className="bg-muted/30 p-4 rounded-lg border border-border/60 text-xs flex flex-col lg:flex-row items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Unused credit:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ({q.daysRemaining}/{q.cycleDays}) × {formatBdt(q.currentPackage.price)} = {formatBdt(q.credit)}
                  </span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">New package charge:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    ({q.daysRemaining}/{q.cycleDays}) × {formatBdt(q.targetPackage.price)} = {formatBdt(q.charge)}
                  </span>
                </div>
                <span>=</span>
                <div className="flex items-center gap-2 font-bold text-primary">
                  <span>Net:</span>
                  <span>{formatBdtWithSymbol(q.net)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Customer</p>
                  <p className="font-bold text-foreground mt-0.5">{q.customer.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {q.customer.mobile}
                    {q.customer.willExpire ? ` · expires ${fmtDay(q.customer.willExpire)}` : ''}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3 flex items-center gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">From</p>
                    <p className="font-medium text-foreground truncate">{q.currentPackage.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatBdtWithSymbol(q.currentPackage.price)} / mo</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">To</p>
                    <p className="font-bold text-primary truncate">{q.targetPackage.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatBdtWithSymbol(q.targetPackage.price)} / mo</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Type</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'mt-1 text-[10px] font-semibold uppercase px-2 py-0.5',
                      q.direction === 'upgrade'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                    )}
                  >
                    {q.direction === 'upgrade' ? 'Upgrade' : q.direction === 'downgrade' ? 'Downgrade' : 'Same price'}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-1">Effective {fmtDay(q.changeDate)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
