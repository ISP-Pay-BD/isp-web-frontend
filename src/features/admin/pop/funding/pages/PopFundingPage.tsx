'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Building2,
  History,
  MapPin,
  Search,
} from 'lucide-react';
import { useCreatePopFunding, usePopFunding, usePops, type PopFundingEntry, type PopReseller } from '../../hooks/use-pop';
import { PopSelect } from '../../components/PopSelect';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { todayYmd } from '@/features/admin/accounting/shared/table-utils';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/locale-context';
import { formatBdtWithSymbol } from '@/lib/format';
/** Field names match PopFundingController::create so 422 details map 1:1. */
const fundingSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
  paid_via: z.string().max(50, 'Too long').optional(),
  received_date: z.string().optional(),
  invoice_number: z.string().max(100, 'Too long').optional(),
  comments: z.string().max(500, 'Too long').optional(),
});

type FundingFormValues = z.infer<typeof fundingSchema>;

const CARD_PAGE_SIZE = 8;

const emptyForm = (): FundingFormValues => ({
  type: 'credit',
  amount: 0,
  paid_via: '',
  received_date: todayYmd(),
  invoice_number: '',
  comments: '',
});

export function PopFundingPage() {
  const { t, te } = useLocale();
  const [selectedPop, setSelectedPop] = useState<PopReseller | null>(null);
  const [cardPage, setCardPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setCardPage(1);
    }, 300); // debounce server search
    return () => clearTimeout(timer);
  }, [searchInput]);

  const popsQuery = usePops({ page: cardPage, pageSize: CARD_PAGE_SIZE, search });
  const ledgerQuery = usePopFunding(selectedPop?.id ?? null, { page: ledgerPage, pageSize: ledgerPageSize });
  const fundingMutation = useCreatePopFunding();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FundingFormValues>({
    resolver: zodResolver(fundingSchema) as Resolver<FundingFormValues>,
    defaultValues: emptyForm(),
  });

  const amount = Number(watch('amount')) || 0;
  const fundingType = watch('type');
  const pops = popsQuery.data?.items ?? [];
  const ledgerRows = useMemo(() => ledgerQuery.data?.items ?? [], [ledgerQuery.data]);
  const selectPop = useCallback((pop: PopReseller | null) => {
    setSelectedPop(pop);
    setLedgerPage(1);
  }, []);
  const ledgerColumns = useMemo<LegacyColumnDef<PopFundingEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'receivedDate',
        header: t('admin.pop.funding.colDate', 'Date'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.receivedDate || '—'}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: t('admin.pop.funding.colType', 'Type'),
        meta: { mobile: 'status' },
        cell: ({ row }) => {
          const isCredit = row.original.type === 'credit';
          return (
            <Badge variant="outline" tone={isCredit ? 'success' : 'danger'} className="text-xs font-semibold gap-1 capitalize">
              {isCredit ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
              {isCredit ? t('admin.pop.funding.credit', 'Credit') : t('admin.pop.funding.debit', 'Debit')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'amountBdt',
        header: t('admin.pop.funding.colAmount', 'Amount (BDT)'),
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const isCredit = row.original.type === 'credit';
          return (
            <span
              className={cn(
                'font-mono text-sm font-bold',
                isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
              )}
            >
              {isCredit ? '+' : '-'}
              <CurrencyDisplay amount={row.original.amountBdt} />
            </span>
          );
        },
      },
      {
        accessorKey: 'paidVia',
        header: t('admin.pop.funding.settlementChannel', 'Settlement Channel'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.paidVia || '—'}</span>,
      },
      {
        accessorKey: 'comments',
        header: t('admin.pop.funding.colMemo', 'Memo'),
        cell: ({ row }) => (
          <span className="block max-w-[280px] truncate text-muted-foreground">{row.original.comments || '—'}</span>
        ),
      },
    ],
    [t],
  );
  // Fresh balance from the ledger endpoint (users.fund), not the cached list row.
  const currentBalance = ledgerQuery.data?.summary.balance ?? selectedPop?.balanceBdt ?? 0;
  const projectedBalance = fundingType === 'credit' ? currentBalance + amount : currentBalance - amount;

  const onSubmit = (values: FundingFormValues) => {
    if (!selectedPop) return;
    fundingMutation.mutate(
      {
        popId: selectedPop.id,
        payload: {
          type: values.type,
          amount: values.amount,
          paid_via: values.paid_via || undefined,
          received_date: values.received_date || undefined,
          invoice_number: values.invoice_number || undefined,
          comments: values.comments || undefined,
          request_id: requestId,
        },
      },
      {
        onSuccess: (res) => {
          const balance = Number((res as Record<string, unknown>)?.balance);
          const vars = { name: selectedPop.name, balance: Number.isFinite(balance) ? formatBdtWithSymbol(balance) : '' };
          toast.success(
            values.type === 'credit'
              ? Number.isFinite(balance)
                ? t('admin.pop.funding.toastCreditedBal', 'Credited {name} · new balance {balance}', vars)
                : t('admin.pop.funding.toastCredited', 'Credited {name}', vars)
              : Number.isFinite(balance)
                ? t('admin.pop.funding.toastDebitedBal', 'Debited {name} · new balance {balance}', vars)
                : t('admin.pop.funding.toastDebited', 'Debited {name}', vars),
          );
          reset(emptyForm());
          setLedgerPage(1);
          setRequestId(crypto.randomUUID());
        },
        onError: (err) => handleApiError(err, setError),
      },
    );
  };

  if (popsQuery.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (popsQuery.isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.pop.funding.loadFailed', 'Failed to load POP funding data')}
        description={popsQuery.error?.message ?? t('admin.pop.funding.loadFailedHint', 'Could not fetch POP wallet balances.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => popsQuery.refetch()}
      />
    );
  }

  const ledgerSummary = ledgerQuery.data?.summary;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('nav.pop-funding-menu', 'POP Funding')}
        subtitle={t('admin.pop.funding.subtitle', 'Credit and debit POP reseller wallet balances used for downstream renewals and package purchases')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.pop_suite', 'POP Suite') },
          { label: t('nav.pop-funding-menu', 'POP Funding') },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{popsQuery.data?.meta.total ?? 0}</span>{' '}
          <span className="text-muted-foreground">
            {search ? t('admin.pop.funding.walletsMatching', 'POP wallets matching search') : t('admin.pop.funding.wallets', 'POP wallets')}
          </span>
        </p>
        {selectedPop && ledgerSummary && (
          <>
            <p>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                <CurrencyDisplay amount={ledgerSummary.creditTotal} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">{t('admin.pop.funding.creditedTo', 'credited to {name}', { name: selectedPop.name })}</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-destructive">
                <CurrencyDisplay amount={ledgerSummary.debitTotal} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">{t('admin.pop.funding.debited', 'debited')}</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-foreground">
                <CurrencyDisplay amount={ledgerSummary.balance} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">{t('admin.pop.funding.currentBalanceLower', 'current balance')}</span>
            </p>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Funding Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span>{t('admin.pop.funding.allocate', 'Allocate POP Funding')}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('admin.pop.funding.allocateDesc', 'Each entry is written to the POP funding ledger and moves the wallet balance immediately.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('admin.pop.funding.popPartner', 'POP Reseller Partner *')}</Label>
                  <PopSelect value={selectedPop} onChange={selectPop} autoSelectFirst={false} />
                  {selectedPop && !selectedPop.fundEnabled && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">{t('admin.pop.funding.fundOff', 'Wallet funding is switched off for this POP.')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/50">
                  {(['credit', 'debit'] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setValue('type', kind)}
                      className={cn(
                        'py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition',
                        fundingType === kind
                          ? cn(
                              'bg-background shadow-xs border border-border/60',
                              kind === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                            )
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {kind === 'credit' ? (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5" /> {t('admin.pop.funding.creditTopUp', 'Credit Top-Up')}
                        </>
                      ) : (
                        <>
                          <ArrowUpFromLine className="h-3.5 w-3.5" /> {t('admin.pop.funding.debitDeduct', 'Debit / Deduct')}
                        </>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-amount" className="text-xs font-semibold">
                    {t('admin.pop.funding.amountLabel', 'Amount (৳ BDT) *')}
                  </Label>
                  <Input
                    id="fund-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register('amount')}
                    className="h-10 font-mono shadow-sm text-sm font-bold"
                  />
                  {errors.amount && <p className="text-xs text-destructive">{te(errors.amount.message ?? '')}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fund-paid-via" className="text-xs font-semibold">
                      {t('admin.pop.funding.settlementChannel', 'Settlement Channel')}
                    </Label>
                    <Input
                      id="fund-paid-via"
                      {...register('paid_via')}
                      placeholder={t('admin.pop.funding.channelPlaceholder', 'e.g. Bank transfer, bKash, cash')}
                      className="h-9 shadow-sm text-xs"
                    />
                    {errors.paid_via && <p className="text-xs text-destructive">{te(errors.paid_via.message ?? '')}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fund-date" className="text-xs font-semibold">
                      {t('admin.pop.funding.receivedDate', 'Received Date')}
                    </Label>
                    <Input id="fund-date" type="date" {...register('received_date')} className="h-9 shadow-sm text-xs" />
                    {errors.received_date && <p className="text-xs text-destructive">{te(errors.received_date.message ?? '')}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-invoice" className="text-xs font-semibold">
                    {t('admin.pop.funding.invoiceNo', 'Invoice / Voucher No.')}
                  </Label>
                  <Input id="fund-invoice" {...register('invoice_number')} className="h-9 shadow-sm text-xs font-mono" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-comments" className="text-xs font-semibold">
                    {t('admin.pop.funding.memoNote', 'Memo Note')}
                  </Label>
                  <Input
                    id="fund-comments"
                    {...register('comments')}
                    placeholder={t('admin.pop.funding.memoPlaceholder', 'e.g. Deposit slip reference')}
                    className="h-9 shadow-sm text-xs"
                  />
                  {errors.comments && <p className="text-xs text-destructive">{te(errors.comments.message ?? '')}</p>}
                </div>

                {selectedPop && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('admin.pop.funding.currentPopBalance', 'Current POP Balance:')}</span>
                      <span className="font-mono font-semibold text-foreground">
                        <CurrencyDisplay amount={currentBalance} />
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-border/40">
                      <span className="text-foreground">{t('admin.pop.funding.projected', 'Projected New Balance:')}</span>
                      <span
                        className={cn(
                          'font-mono',
                          projectedBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
                        )}
                      >
                        <CurrencyDisplay amount={projectedBalance} />
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold shadow-2xs gap-1.5 text-xs h-10"
                  disabled={fundingMutation.isPending || !selectedPop}
                >
                  {fundingType === 'credit' ? (
                    <>
                      <ArrowDownToLine className="h-4 w-4" /> {t('admin.pop.funding.creditWallet', 'Credit POP Wallet')}
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="h-4 w-4" /> {t('admin.pop.funding.debitWallet', 'Debit POP Wallet')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: POP Wallet Cards */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> {t('admin.pop.funding.partnerWallets', 'POP Partner Wallets')}
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.pop.funding.searchPops', 'Search POPs…')}
                className="h-8 w-48 pl-8 text-xs"
                aria-label={t('admin.pop.funding.searchWallets', 'Search POP wallets')}
              />
            </div>
          </div>

          {pops.length === 0 ? (
            <EmptyState
              title={search ? t('admin.pop.funding.noPopsSearch', 'No POPs match your search') : t('admin.pop.funding.noPops', 'No POP resellers yet')}
              description={search ? undefined : t('admin.pop.funding.noPopsHint', 'Register a POP before allocating wallet funding.')}
            />
          ) : (
            <div className={cn('grid gap-3 sm:grid-cols-2 transition-opacity', popsQuery.isFetching && 'opacity-60')}>
              {pops.map((r) => {
                const isSelected = selectedPop?.id === r.id;
                return (
                  <Card
                    key={r.id}
                    onClick={() => selectPop(r)}
                    className={cn(
                      'border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden transition duration-200 cursor-pointer group',
                      isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'hover:border-primary/40 hover:shadow-md',
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {r.name}
                          </div>
                          {r.address && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                              <span className="truncate">{r.address}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                          {r.billingType === 'prepaid' ? t('admin.pop.funding.prepaid', 'Prepaid') : t('admin.pop.funding.postpaid', 'Postpaid')}
                        </Badge>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider block">{t('admin.pop.funding.currentBalance', 'Current Balance')}</span>
                          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            <CurrencyDisplay amount={r.balanceBdt} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider block">{t('admin.pop.funding.subscribers', 'Subscribers')}</span>
                          <span className="text-xs font-bold font-mono text-foreground">{t('admin.pop.funding.usersCount', '{n} Users', { n: r.customers })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
                        <span className="text-xs text-muted-foreground font-mono">{r.mobile || '—'}</span>
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          className="h-6 px-2 text-xs font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectPop(r);
                          }}
                        >
                          {isSelected ? t('admin.pop.funding.selected', 'Selected') : t('admin.pop.funding.select', 'Select')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {(popsQuery.data?.meta.total ?? 0) > CARD_PAGE_SIZE && (
            <TablePagination
              currentPage={cardPage}
              pageSize={CARD_PAGE_SIZE}
              pageSizeOptions={[CARD_PAGE_SIZE]}
              totalItems={popsQuery.data?.meta.total ?? 0}
              onPageChange={setCardPage}
              onPageSizeChange={() => setCardPage(1)}
            />
          )}
        </div>
      </div>

      {/* Bottom: Recent ledger of the selected POP */}
      <section className="mt-6 space-y-3">
        <div className="flex flex-row items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> {t('admin.pop.funding.recentLedger', 'Recent Funding Ledger')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedPop
                ? t('admin.pop.funding.latestFor', 'Latest entries for {name}', { name: selectedPop.name })
                : t('admin.pop.funding.selectPopHint', 'Select a POP to see its funding history')}
            </p>
          </div>
          <Link href="/admin/pop/transactions" className="text-xs font-medium text-primary hover:underline">
            {t('admin.pop.funding.allTransactions', 'All transactions')}
          </Link>
        </div>
        {!selectedPop ? null : ledgerQuery.isError ? (
          <EmptyState variant="error"
            title={t('admin.pop.funding.ledgerFailed', 'Failed to load ledger')}
            description={ledgerQuery.error?.message}
            actionLabel={t('admin.customers.list.retry', 'Retry')}
            onAction={() => ledgerQuery.refetch()}
          />
        ) : (
          <div className={cn('transition-opacity', ledgerQuery.isPlaceholderData && 'opacity-60')}>
            <DataTable
              columns={ledgerColumns}
              data={ledgerRows}
              isLoading={ledgerQuery.isLoading}
              getRowId={(row) => row.id}
              emptyTitle={t('admin.pop.funding.emptyLedger', 'No funding recorded for this POP yet.')}
              server={{
                page: ledgerPage,
                pageSize: ledgerPageSize,
                total: ledgerQuery.data?.meta.total ?? 0,
                onPageChange: setLedgerPage,
                onPageSizeChange: (size) => {
                  setLedgerPageSize(size);
                  setLedgerPage(1);
                },
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
