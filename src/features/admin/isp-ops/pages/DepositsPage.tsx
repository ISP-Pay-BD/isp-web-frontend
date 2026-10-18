'use client';

import { useMemo, useState } from 'react';
import {
  Wallet,
  Search,
  Plus,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  X,
  HardDrive,
  Pencil,
  Trash2,
  History,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { BillingCustomerPicker } from '../components/BillingCustomerPicker';
import {
  fmtDay,
  fmtStamp,
  todayYmd,
  useDebouncedValue,
  useDepositDetail,
  useDepositMutations,
  useDeposits,
  useDepositSummary,
  type BillingCustomerOption,
  type Deposit,
  type DepositStatus,
} from '../hooks/use-billing-config';

type StatusFilter = 'all' | DepositStatus;

const STATUS_STYLE: Record<DepositStatus, string> = {
  held: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  refunded: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  adjusted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const methodLabel = (m: string) => m.replace(/_/g, ' ');

export function DepositsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const summary = useDepositSummary();
  const list = useDeposits({ page, perPage, search: debounced, status });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Deposit | 'new' | null>(null);

  const s = summary.data;
  const rows = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;

  if (summary.isLoading || (list.isLoading && !list.data)) return <PageSkeleton variant="table" rows={6} />;
  if (summary.isError || list.isError) {
    return (
      <EmptyState
        title="Failed to load deposits"
        description={errorMessage(summary.error ?? list.error, 'Could not load the deposit ledger.')}
        actionLabel="Retry"
        onAction={() => {
          summary.refetch();
          list.refetch();
        }}
      />
    );
  }

  const pills: { key: StatusFilter; label: string; icon?: React.ReactNode; active: string; idle: string }[] = [
    { key: 'all', label: `All Records (${s?.totalCount ?? 0})`, active: 'bg-primary text-primary-foreground shadow-2xs', idle: 'border-border/70 hover:bg-accent' },
    { key: 'held', label: `Held (${s?.heldCount ?? 0})`, icon: <ShieldCheck className="h-3 w-3" />, active: 'bg-blue-600 text-white', idle: 'text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10' },
    { key: 'refunded', label: `Refunded (${s?.refundedCount ?? 0})`, icon: <RotateCcw className="h-3 w-3" />, active: 'bg-slate-600 text-white', idle: 'text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/10' },
    { key: 'adjusted', label: `Adjusted (${s?.adjustedCount ?? 0})`, icon: <Wallet className="h-3 w-3" />, active: 'bg-emerald-600 text-white', idle: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Security Deposits"
        subtitle="Customer equipment and connection deposits — record them, then refund or adjust them against bills with a full audit trail."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Deposits' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setEditing('new')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Record Deposit
          </Button>
        }
      />

      {/* KPI ribbon (SQL totals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Held Deposits"
          value={formatBdtWithSymbol(s?.heldTotal ?? 0)}
          hint={`${s?.heldCount ?? 0} deposits currently held`}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="primary"
        />
        <KpiCard
          label="Refunded"
          value={formatBdtWithSymbol(s?.refundedTotal ?? 0)}
          hint={`${s?.refundedCount ?? 0} returned to customers`}
          icon={<RotateCcw className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          label="Adjusted"
          value={formatBdtWithSymbol(s?.adjustedTotal ?? 0)}
          hint={`${s?.adjustedCount ?? 0} set against bills`}
          icon={<Wallet className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          label="Total Records"
          value={String(s?.totalCount ?? 0)}
          hint="Deposits recorded"
          icon={<HardDrive className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by customer name, mobile, note or deposit #…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">Status:</span>
            {pills.map((p) => (
              <Button
                key={p.key}
                variant={status === p.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus(p.key);
                  setPage(1);
                }}
                className={cn('h-7 text-xs px-2.5 rounded-full font-medium gap-1', status === p.key ? p.active : p.idle)}
              >
                {p.icon} {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className={cn('border-border/70 shadow-sm bg-card overflow-hidden', list.isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Received</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Note</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">No deposits found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {debounced || status !== 'all' ? 'Try clearing the search or status filter.' : 'Record the first deposit to start the ledger.'}
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((dep) => (
                  <tr key={dep.id} onClick={() => setSelectedId(dep.id)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{dep.customerName ?? `Customer #${dep.customerId}`}</span>
                        <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          #{dep.id}
                          {dep.customerMobile ? ` · ${dep.customerMobile}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold font-mono text-sm text-foreground tabular-nums">{formatBdtWithSymbol(dep.amount)}</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="capitalize font-mono text-xs text-muted-foreground">{methodLabel(dep.method)}</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs text-muted-foreground">{fmtDay(dep.receivedAt)}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="outline" className={cn('capitalize text-[10px] font-semibold px-2 py-0.5', STATUS_STYLE[dep.status])}>
                        {dep.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-foreground line-clamp-1">{dep.note ?? '—'}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedId(dep.id)}
                        className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
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
        )}
      </Card>

      <DepositSheet
        id={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={(d) => {
          setSelectedId(null);
          setEditing(d);
        }}
      />

      <DepositDialog
        target={editing}
        methods={s?.methods ?? []}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: 'primary' | 'sky' | 'emerald' | 'amber';
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    sky: 'bg-sky-500/10 text-sky-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  }[tone];
  return (
    <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', toneClass)}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
    </Card>
  );
}

function DepositSheet({ id, onClose, onEdit }: { id: number | null; onClose: () => void; onEdit: (d: Deposit) => void }) {
  const detail = useDepositDetail(id);
  const { settle, remove } = useDepositMutations();
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState<'refund' | 'adjust' | 'delete' | null>(null);
  const d = detail.data;

  const close = () => {
    setNote('');
    setConfirm(null);
    onClose();
  };

  const run = () => {
    if (!d || !confirm) return;
    if (confirm === 'delete') {
      remove.mutate(d.id, {
        onSuccess: () => {
          toast.success('Deposit deleted');
          close();
        },
      });
      return;
    }
    settle.mutate(
      { id: d.id, action: confirm, note },
      {
        onSuccess: () => {
          toast.success(confirm === 'refund' ? 'Deposit marked refunded' : 'Deposit marked adjusted');
          setNote('');
          setConfirm(null);
        },
      },
    );
  };

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
        {detail.isLoading ? (
          <div className="space-y-3 pt-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : detail.isError || !d ? (
          <EmptyState
            title="Could not load the deposit"
            description={errorMessage(detail.error)}
            actionLabel="Retry"
            onAction={() => detail.refetch()}
          />
        ) : (
          <>
            <SheetHeader>
              <Badge variant="outline" className={cn('w-fit text-[10px] font-semibold uppercase px-2 py-0.5', STATUS_STYLE[d.status])}>
                {d.status}
              </Badge>
              <SheetTitle className="text-xl font-bold text-foreground mt-2">{d.customerName ?? `Customer #${d.customerId}`}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground font-mono">
                Deposit #{d.id} · Received {fmtDay(d.receivedAt)}
              </SheetDescription>
            </SheetHeader>

            <Card className="p-4 border-border/80 bg-muted/20">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Deposit Amount</span>
              <p className="text-2xl font-bold text-primary font-mono tabular-nums mt-1">{formatBdtWithSymbol(d.amount)}</p>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <p>
                  Method: <strong className="text-foreground capitalize">{methodLabel(d.method)}</strong>
                </p>
                {d.customerMobile && (
                  <p>
                    Mobile: <strong className="text-foreground font-mono">{d.customerMobile}</strong>
                  </p>
                )}
                {d.note && (
                  <p>
                    Note: <strong className="text-foreground">{d.note}</strong>
                  </p>
                )}
                {d.createdByName && <p>Recorded by {d.createdByName}</p>}
              </div>
            </Card>

            {d.status === 'held' && (
              <div className="space-y-2">
                <label htmlFor="dep-settle-note" className="text-xs font-semibold text-foreground">
                  Note for refund / adjustment (optional)
                </label>
                <Textarea
                  id="dep-settle-note"
                  value={note}
                  maxLength={255}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs min-h-16"
                  placeholder="e.g. returned in cash, adjusted on the next bill"
                />
                <Button
                  onClick={() => setConfirm('refund')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Mark as Refunded
                </Button>
                <Button variant="outline" onClick={() => setConfirm('adjust')} className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> Mark as Adjusted Against Bills
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onEdit(d)} className="text-xs h-9 gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm('delete')} className="text-xs h-9 gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                <History className="h-3.5 w-3.5" /> Audit Trail
              </h4>
              {d.events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history recorded.</p>
              ) : (
                <ol className="space-y-2">
                  {d.events.map((e) => (
                    <li key={e.id} className="rounded-lg border border-border/50 bg-card p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold capitalize text-foreground">{e.action}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{fmtStamp(e.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {e.fromStatus && e.toStatus && e.fromStatus !== e.toStatus ? `${e.fromStatus} → ${e.toStatus} · ` : ''}
                        {formatBdtWithSymbol(e.amount)}
                        {e.actorName ? ` · by ${e.actorName}` : ''}
                      </p>
                      {e.note && <p className="text-[11px] text-foreground mt-0.5">{e.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </SheetContent>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === 'delete' ? 'Delete this deposit?' : confirm === 'refund' ? 'Mark deposit as refunded?' : 'Mark deposit as adjusted?'}
        description={
          confirm === 'delete'
            ? 'The deposit is removed from the ledger. Its audit trail is kept.'
            : 'A settled deposit is locked and can no longer be edited.'
        }
        confirmLabel={confirm === 'delete' ? 'Delete' : 'Confirm'}
        destructive={confirm === 'delete'}
        onConfirm={run}
      />
    </Sheet>
  );
}

function DepositDialog({
  target,
  methods,
  onClose,
}: {
  target: Deposit | 'new' | null;
  methods: string[];
  onClose: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {target !== null && <DepositForm key={target === 'new' ? 'new' : target.id} target={target} methods={methods} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function DepositForm({ target, methods, onDone }: { target: Deposit | 'new'; methods: string[]; onDone: () => void }) {
  const isNew = target === 'new';
  const { create, update } = useDepositMutations();
  const [customer, setCustomer] = useState<BillingCustomerOption | null>(null);
  const [amount, setAmount] = useState(isNew ? '' : String(target.amount));
  const [method, setMethod] = useState(isNew ? '' : target.method);
  const [receivedAt, setReceivedAt] = useState(isNew ? todayYmd() : (target.receivedAt ?? todayYmd()));
  const [note, setNote] = useState(isNew ? '' : (target.note ?? ''));
  const methodItems = useMemo(() => Object.fromEntries(methods.map((m) => [m, methodLabel(m)])), [methods]);
  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) {
      toast.error('Choose how the deposit was received');
      return;
    }
    const values = { amount: Number(amount), method, receivedAt, note };
    if (isNew) {
      if (!customer) {
        toast.error('Choose a customer');
        return;
      }
      create.mutate(
        { ...values, customerId: customer.id },
        {
          onSuccess: () => {
            toast.success('Deposit recorded');
            onDone();
          },
        },
      );
    } else {
      update.mutate(
        { ...values, id: target.id },
        {
          onSuccess: () => {
            toast.success('Deposit updated');
            onDone();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base font-bold">{isNew ? 'Record Security Deposit' : `Edit Deposit #${target.id}`}</DialogTitle>
        <DialogDescription className="text-xs">
          {isNew ? 'Money held for equipment or connection, refundable or adjustable later.' : (target.customerName ?? '')}
        </DialogDescription>
      </DialogHeader>

      {isNew && (
        <div className="space-y-1.5">
          <label htmlFor="dep-customer" className="text-xs font-semibold">Customer *</label>
          <BillingCustomerPicker id="dep-customer" value={customer} onChange={setCustomer} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="dep-amount" className="text-xs font-semibold">Amount (৳) *</label>
          <Input
            id="dep-amount"
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
          <label htmlFor="dep-date" className="text-xs font-semibold">Received On *</label>
          <Input
            id="dep-date"
            type="date"
            required
            max={todayYmd()}
            value={receivedAt}
            onChange={(e) => setReceivedAt(e.target.value)}
            className="text-xs h-9 font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dep-method" className="text-xs font-semibold">Method *</label>
        <Select items={methodItems} value={method || null} onValueChange={(v) => setMethod(v ? String(v) : '')}>
          <SelectTrigger id="dep-method" className="text-xs h-9 w-full">
            <SelectValue placeholder="Choose method" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {methodLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dep-note" className="text-xs font-semibold">Note</label>
        <Textarea
          id="dep-note"
          maxLength={255}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-xs min-h-16"
          placeholder="What the deposit is for (e.g. ONU, router)"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="bg-primary text-primary-foreground">
          {pending ? 'Saving…' : isNew ? 'Record Deposit' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}
