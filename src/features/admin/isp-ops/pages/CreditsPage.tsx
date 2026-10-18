'use client';

import { useState } from 'react';
import {
  FileBadge,
  Search,
  Plus,
  Clock,
  X,
  Eye,
  Users,
  Pencil,
  Trash2,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { BillingCustomerPicker } from '../components/BillingCustomerPicker';
import {
  fmtDay,
  fmtStamp,
  useCreditBalances,
  useCreditMutations,
  useCreditNotes,
  useCreditSummary,
  useDebouncedValue,
  type BillingCustomerOption,
  type CreditNote,
} from '../hooks/use-billing-config';

type View = 'notes' | 'balances';

export function CreditsPage() {
  const [view, setView] = useState<View>('notes');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [customerFilter, setCustomerFilter] = useState<{ id: number; name: string } | null>(null);

  const summary = useCreditSummary();
  const notes = useCreditNotes({ page, perPage, search: debounced, customerId: customerFilter?.id ?? null }, view === 'notes');
  const balances = useCreditBalances({ page, perPage, search: debounced }, view === 'balances');
  const active = view === 'notes' ? notes : balances;

  const [selected, setSelected] = useState<CreditNote | null>(null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  if (summary.isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (summary.isError) {
    return (
      <EmptyState
        title="Failed to load credit notes"
        description={errorMessage(summary.error, 'Could not load the credit note ledger.')}
        actionLabel="Retry"
        onAction={() => summary.refetch()}
      />
    );
  }

  const s = summary.data;
  const total = active.data?.meta.total ?? 0;
  const switchView = (v: View) => {
    setView(v);
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Credit Notes"
        subtitle="Goodwill, outage and billing-correction credits owed to customers, and each customer's credit balance."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Collections' },
          { label: 'Credit Notes' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setIsIssueOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Issue Credit Note
          </Button>
        }
      />

      {/* KPI ribbon (SQL totals) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Kpi
          label="Total Credits Issued"
          value={formatBdtWithSymbol(s?.totalAmount ?? 0)}
          hint="All credit notes on record"
          icon={<FileBadge className="h-4 w-4" />}
          tone="bg-primary/10 text-primary"
        />
        <Kpi
          label="This Month"
          value={formatBdtWithSymbol(s?.monthAmount ?? 0)}
          hint={`${s?.monthCount ?? 0} notes since ${fmtDay(s?.monthStart)}`}
          icon={<Clock className="h-4 w-4" />}
          tone="bg-amber-500/10 text-amber-500"
        />
        <Kpi
          label="Customers With Credit"
          value={String(s?.customersCount ?? 0)}
          hint="Distinct customers"
          icon={<Users className="h-4 w-4" />}
          tone="bg-emerald-500/10 text-emerald-500"
        />
        <Kpi
          label="Credit Notes"
          value={String(s?.notesCount ?? 0)}
          hint="Notes issued"
          icon={<Wallet className="h-4 w-4" />}
          tone="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={view === 'notes' ? 'Search by customer, mobile, reason or note #…' : 'Search customer name or mobile…'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customerFilter && view === 'notes' && (
            <Badge variant="outline" className="gap-1 text-[11px]">
              {customerFilter.name}
              <button type="button" aria-label="Clear customer filter" onClick={() => setCustomerFilter(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'notes', label: 'Credit Notes' },
                { key: 'balances', label: 'Customer Balances' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={view === pill.key ? 'default' : 'ghost'}
                onClick={() => switchView(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition',
                  view === pill.key ? 'bg-primary text-primary-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main table */}
      {active.isLoading && !active.data ? (
        <PageSkeleton variant="table" rows={5} />
      ) : active.isError ? (
        <EmptyState
          title="Failed to load"
          description={errorMessage(active.error)}
          actionLabel="Retry"
          onAction={() => active.refetch()}
        />
      ) : total === 0 ? (
        <EmptyState
          title={view === 'notes' ? 'No credit notes found' : 'No customer has a credit balance'}
          description={debounced || customerFilter ? 'No records match your search.' : 'Issue a credit note to get started.'}
          actionLabel="Issue Credit Note"
          onAction={() => setIsIssueOpen(true)}
        />
      ) : (
        <div className={cn('rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs', active.isFetching && 'opacity-80')}>
          <div className="overflow-x-auto">
            {view === 'notes' ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4">Note # & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Issued By</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(notes.data?.items ?? []).map((credit) => (
                    <tr
                      key={credit.id}
                      onClick={() => setSelected(credit)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors font-mono">#{credit.id}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{fmtDay(credit.createdAt)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{credit.customerName ?? `Customer #${credit.customerId}`}</div>
                        {credit.customerMobile && <div className="text-[11px] text-muted-foreground font-mono">{credit.customerMobile}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-500 text-sm">{formatBdtWithSymbol(credit.amount)}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-foreground font-medium truncate max-w-[260px]" title={credit.reason}>
                          {credit.reason}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">{credit.createdByName ?? '—'}</td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="View credit note"
                          onClick={() => setSelected(credit)}
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Credit Balance</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4">Last Credit</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(balances.data?.items ?? []).map((b) => (
                    <tr key={b.customerId} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{b.customerName ?? `Customer #${b.customerId}`}</div>
                        {b.customerMobile && <div className="text-[11px] text-muted-foreground font-mono">{b.customerMobile}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-500 text-sm">{formatBdtWithSymbol(b.balance)}</td>
                      <td className="py-3.5 px-4 font-mono">{b.notesCount}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">{fmtDay(b.lastCreditAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary hover:bg-primary/10"
                          onClick={() => {
                            setCustomerFilter({ id: b.customerId, name: b.customerName ?? `#${b.customerId}` });
                            setSearch('');
                            switchView('notes');
                          }}
                        >
                          View notes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="border-t border-border/60 px-4 py-2">
            <TablePagination
              currentPage={page}
              pageSize={perPage}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      <CreditSheet credit={selected} onClose={() => setSelected(null)} />

      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-xl">
          {isIssueOpen && <IssueCreditForm onDone={() => setIsIssueOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, value, hint, icon, tone }: { label: string; value: string; hint: string; icon: React.ReactNode; tone: string }) {
  return (
    <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-foreground font-mono">{value}</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function CreditSheet({ credit, onClose }: { credit: CreditNote | null; onClose: () => void }) {
  const { update, remove } = useCreditMutations();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => {
    setEditing(false);
    setConfirmDelete(false);
    onClose();
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credit) return;
    update.mutate(
      { id: credit.id, amount: Number(amount), reason },
      {
        onSuccess: () => {
          toast.success(`Credit note #${credit.id} updated`);
          close();
        },
      },
    );
  };

  return (
    <Sheet open={credit !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
        {credit && (
          <>
            <SheetHeader className="space-y-1">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                Credit Note
              </Badge>
              <SheetTitle className="text-xl font-bold text-foreground font-mono">#{credit.id}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Issued {fmtStamp(credit.createdAt)}
                {credit.createdByName ? ` by ${credit.createdByName}` : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
              <div className="text-[11px] text-muted-foreground font-semibold">Credit Amount</div>
              <div className="text-2xl font-black font-mono text-emerald-500 mt-0.5">{formatBdtWithSymbol(credit.amount)}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold text-foreground">{credit.customerName ?? `#${credit.customerId}`}</span>
              </div>
              {credit.customerMobile && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-mono text-foreground">{credit.customerMobile}</span>
                </div>
              )}
            </div>

            {editing ? (
              <form onSubmit={save} className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label htmlFor="cn-edit-amount" className="font-semibold">Amount (৳)</label>
                  <Input
                    id="cn-edit-amount"
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cn-edit-reason" className="font-semibold">Reason</label>
                  <Textarea
                    id="cn-edit-reason"
                    required
                    maxLength={255}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-xs min-h-16"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={update.isPending} className="text-xs h-9 bg-primary text-primary-foreground">
                    {update.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-card border border-border/50 space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground">Reason</span>
                  <p className="text-foreground font-medium leading-relaxed">{credit.reason}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-border/60">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="text-xs h-9 gap-1.5"
                      onClick={() => {
                        setAmount(String(credit.amount));
                        setReason(credit.reason);
                        setEditing(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" className="text-xs h-9 gap-1.5 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                  <Button variant="outline" onClick={close} className="w-full text-xs h-9">
                    Close
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this credit note?"
        description="The customer's credit balance goes down by this amount."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!credit) return;
          remove.mutate(credit.id, {
            onSuccess: () => {
              toast.success(`Credit note #${credit.id} deleted`);
              close();
            },
          });
        }}
      />
    </Sheet>
  );
}

function IssueCreditForm({ onDone }: { onDone: () => void }) {
  const { create } = useCreditMutations();
  const [customer, setCustomer] = useState<BillingCustomerOption | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Choose a customer');
      return;
    }
    create.mutate(
      { customerId: customer.id, amount: Number(amount), reason },
      {
        onSuccess: (note) => {
          toast.success(`Credit note #${note.id} issued to ${customer.name}`);
          onDone();
        },
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          Issue Credit Note
        </DialogTitle>
        <DialogDescription className="text-xs">Record a credit owed to a customer (goodwill, outage, billing correction).</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="cn-customer" className="text-xs font-semibold">Customer *</label>
          <BillingCustomerPicker id="cn-customer" value={customer} onChange={setCustomer} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cn-amount" className="text-xs font-semibold">Amount (৳) *</label>
          <Input
            id="cn-amount"
            type="number"
            min={0.01}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-xs h-9 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cn-reason" className="text-xs font-semibold">Reason *</label>
          <Textarea
            id="cn-reason"
            required
            maxLength={255}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs min-h-16"
            placeholder="Why the customer is credited"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={create.isPending}
            className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 shadow-xs"
          >
            {create.isPending ? 'Issuing…' : 'Issue Credit Note'}
          </Button>
        </div>
      </form>
    </>
  );
}
