'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useCreatePopFunding, usePopFunding, usePops, type PopReseller } from '../../hooks/use-pop';
import { PopSelect } from '../../components/PopSelect';
import { PageSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { todayYmd } from '@/features/admin/accounting/shared/table-utils';
import { cn } from '@/lib/utils';

/** Field names match PopFundingController::create so 422 details map 1:1. */
const fundingSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
  paid_via: z.string().max(50).optional(),
  received_date: z.string().optional(),
  invoice_number: z.string().max(100).optional(),
  comments: z.string().max(500).optional(),
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
  const [selectedPop, setSelectedPop] = useState<PopReseller | null>(null);
  const [cardPage, setCardPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setCardPage(1);
    }, 300); // debounce server search
    return () => clearTimeout(t);
  }, [searchInput]);

  const popsQuery = usePops({ page: cardPage, pageSize: CARD_PAGE_SIZE, search });
  const ledgerQuery = usePopFunding(selectedPop?.id ?? null, { page: 1, pageSize: 6 });
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
          toast.success(
            `${values.type === 'credit' ? 'Credited' : 'Debited'} ${selectedPop.name}` +
              (Number.isFinite(balance) ? ` · new balance ৳${balance.toLocaleString()}` : ''),
          );
          reset(emptyForm());
          setRequestId(crypto.randomUUID());
        },
        onError: (err) => handleApiError(err, setError),
      },
    );
  };

  if (popsQuery.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (popsQuery.isError) {
    return (
      <EmptyState
        title="Failed to load POP funding data"
        description={popsQuery.error?.message ?? 'Could not fetch POP wallet balances.'}
        actionLabel="Retry"
        onAction={() => popsQuery.refetch()}
      />
    );
  }

  const ledgerSummary = ledgerQuery.data?.summary;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Funding"
        subtitle="Credit and debit POP reseller wallet balances used for downstream renewals and package purchases"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'POP Funding' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{popsQuery.data?.meta.total ?? 0}</span>{' '}
          <span className="text-muted-foreground">POP wallets{search ? ' matching search' : ''}</span>
        </p>
        {selectedPop && ledgerSummary && (
          <>
            <p>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                <CurrencyDisplay amount={ledgerSummary.creditTotal} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">credited to {selectedPop.name}</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-destructive">
                <CurrencyDisplay amount={ledgerSummary.debitTotal} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">debited</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums text-foreground">
                <CurrencyDisplay amount={ledgerSummary.balance} className="inline font-semibold" />
              </span>{' '}
              <span className="text-muted-foreground">current balance</span>
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
                <span>Allocate POP Funding</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Each entry is written to the POP funding ledger and moves the wallet balance immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">POP Reseller Partner *</Label>
                  <PopSelect value={selectedPop} onChange={setSelectedPop} autoSelectFirst={false} />
                  {selectedPop && !selectedPop.fundEnabled && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Wallet funding is switched off for this POP.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/50">
                  {(['credit', 'debit'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('type', t)}
                      className={cn(
                        'py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition',
                        fundingType === t
                          ? cn(
                              'bg-background shadow-xs border border-border/60',
                              t === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                            )
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {t === 'credit' ? (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5" /> Credit Top-Up
                        </>
                      ) : (
                        <>
                          <ArrowUpFromLine className="h-3.5 w-3.5" /> Debit / Deduct
                        </>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-amount" className="text-xs font-semibold">
                    Amount (৳ BDT) *
                  </Label>
                  <Input
                    id="fund-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register('amount')}
                    className="h-10 font-mono shadow-sm text-sm font-bold"
                  />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fund-paid-via" className="text-xs font-semibold">
                      Settlement Channel
                    </Label>
                    <Input
                      id="fund-paid-via"
                      {...register('paid_via')}
                      placeholder="e.g. Bank transfer, bKash, cash"
                      className="h-9 shadow-sm text-xs"
                    />
                    {errors.paid_via && <p className="text-xs text-destructive">{errors.paid_via.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fund-date" className="text-xs font-semibold">
                      Received Date
                    </Label>
                    <Input id="fund-date" type="date" {...register('received_date')} className="h-9 shadow-sm text-xs" />
                    {errors.received_date && <p className="text-xs text-destructive">{errors.received_date.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-invoice" className="text-xs font-semibold">
                    Invoice / Voucher No.
                  </Label>
                  <Input id="fund-invoice" {...register('invoice_number')} className="h-9 shadow-sm text-xs font-mono" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fund-comments" className="text-xs font-semibold">
                    Memo Note
                  </Label>
                  <Input
                    id="fund-comments"
                    {...register('comments')}
                    placeholder="e.g. Deposit slip reference"
                    className="h-9 shadow-sm text-xs"
                  />
                  {errors.comments && <p className="text-xs text-destructive">{errors.comments.message}</p>}
                </div>

                {selectedPop && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Current POP Balance:</span>
                      <span className="font-mono font-semibold text-foreground">
                        <CurrencyDisplay amount={currentBalance} />
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-border/40">
                      <span className="text-foreground">Projected New Balance:</span>
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
                      <ArrowDownToLine className="h-4 w-4" /> Credit POP Wallet
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="h-4 w-4" /> Debit POP Wallet
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
              <Building2 className="h-4 w-4 text-primary" /> POP Partner Wallets
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search POPs…"
                className="h-8 w-48 pl-8 text-xs"
                aria-label="Search POP wallets"
              />
            </div>
          </div>

          {pops.length === 0 ? (
            <EmptyState
              title={search ? 'No POPs match your search' : 'No POP resellers yet'}
              description={search ? undefined : 'Register a POP before allocating wallet funding.'}
            />
          ) : (
            <div className={cn('grid gap-3 sm:grid-cols-2 transition-opacity', popsQuery.isFetching && 'opacity-60')}>
              {pops.map((r) => {
                const isSelected = selectedPop?.id === r.id;
                return (
                  <Card
                    key={r.id}
                    onClick={() => setSelectedPop(r)}
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
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {r.billingType}
                        </Badge>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Current Balance</span>
                          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            <CurrencyDisplay amount={r.balanceBdt} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Subscribers</span>
                          <span className="text-xs font-bold font-mono text-foreground">{r.customers} Users</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
                        <span className="text-[11px] text-muted-foreground font-mono">{r.mobile || '—'}</span>
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          className="h-6 px-2 text-[10px] font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPop(r);
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
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
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden mt-6">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent Funding Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedPop ? `Latest entries for ${selectedPop.name}` : 'Select a POP to see its funding history'}
            </CardDescription>
          </div>
          <Link href="/admin/pop/transactions" className="text-xs font-medium text-primary hover:underline">
            All transactions
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedPop ? null : ledgerQuery.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : ledgerQuery.isError ? (
            <div className="py-8">
              <EmptyState
                title="Failed to load ledger"
                description={ledgerQuery.error?.message}
                actionLabel="Retry"
                onAction={() => ledgerQuery.refetch()}
              />
            </div>
          ) : (ledgerQuery.data?.items.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No funding recorded for this POP yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[120px] text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount (BDT)</TableHead>
                    <TableHead className="text-xs">Settlement Channel</TableHead>
                    <TableHead className="text-xs">Memo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerQuery.data?.items.map((tx) => (
                    <TableRow key={tx.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{tx.receivedDate || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold gap-1 capitalize',
                            tx.type === 'credit'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                          )}
                        >
                          {tx.type === 'credit' ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-mono text-sm font-bold',
                            tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
                          )}
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          <CurrencyDisplay amount={tx.amountBdt} />
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.paidVia || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">{tx.comments || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
