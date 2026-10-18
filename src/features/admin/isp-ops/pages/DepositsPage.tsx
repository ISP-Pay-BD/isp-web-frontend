'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Wallet,
  Plus,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  HardDrive,
  Pencil,
  Trash2,
  History,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Tone } from '@/components/shared/status-tones';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useTranslations } from '@/i18n/locale-context';
import { BillingCustomerPicker } from '../components/BillingCustomerPicker';
import {
  fmtDay,
  fmtStamp,
  todayYmd,
  useDepositDetail,
  useDepositMutations,
  useDeposits,
  useDepositSummary,
  type BillingCustomerOption,
  type Deposit,
  type DepositStatus,
} from '../hooks/use-billing-config';

type StatusFilter = 'all' | DepositStatus;

const STATUS_TONE: Record<DepositStatus, Tone> = {
  held: 'info',
  refunded: 'neutral',
  adjusted: 'success',
};

type Translate = ReturnType<typeof useTranslations>;

const upperFirst = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

function depositStatusLabel(t: Translate, status: string): string {
  switch (status) {
    case 'held':
      return t('admin.ops.deposits.status.held', 'Held');
    case 'refunded':
      return t('admin.ops.deposits.status.refunded', 'Refunded');
    case 'adjusted':
      return t('admin.ops.deposits.status.adjusted', 'Adjusted');
    default:
      return upperFirst(status);
  }
}

/** Payment method in the active language; gateway names (bKash, Nagad, Rocket) stay as they are. */
function depositMethodLabel(t: Translate, method: string): string {
  switch (method) {
    case 'cash':
      return t('admin.customerPayments.method.cash', 'Cash');
    case 'bank':
      return t('admin.customerPayments.method.bank', 'Bank');
    case 'card':
      return t('admin.customerPayments.method.cardOnly', 'Card');
    case 'other':
      return t('admin.ops.deposits.method.other', 'Other');
    case 'bkash':
      return 'bKash';
    case 'nagad':
      return 'Nagad';
    case 'rocket':
      return 'Rocket';
    default:
      return upperFirst(method.replace(/_/g, ' '));
  }
}

function depositActionLabel(t: Translate, action: string): string {
  switch (action) {
    case 'created':
      return t('admin.ops.deposits.action.created', 'Created');
    case 'updated':
      return t('admin.ops.deposits.action.updated', 'Updated');
    case 'deleted':
      return t('admin.ops.deposits.action.deleted', 'Deleted');
    case 'refunded':
    case 'adjusted':
      return depositStatusLabel(t, action);
    default:
      return upperFirst(action);
  }
}

export function DepositsPage() {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const summary = useDepositSummary();
  const list = useDeposits({ page, perPage, search, status });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Deposit | 'new' | null>(null);

  const s = summary.data;
  const rows = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;

  const columns = useMemo<LegacyColumnDef<Deposit, unknown>[]>(
    () => [
      {
        id: 'customer',
        header: t('admin.ops.deposits.colCustomer', 'Customer'),
        enableSorting: false,
        meta: { mobile: 'title' },
        cell: ({ row: { original: dep } }) => (
          <div className="flex flex-col items-start">
            <button type="button" onClick={() => setSelectedId(dep.id)} className="text-left text-sm font-bold text-foreground hover:text-primary hover:underline">
              {dep.customerName ?? t('admin.ops.deposits.customerFallback', 'Customer #{id}', { id: dep.customerId })}
            </button>
            <span className="mt-0.5 font-mono text-xs text-muted-foreground">
              #{dep.id}
              {dep.customerMobile ? ` · ${dep.customerMobile}` : ''}
            </span>
          </div>
        ),
      },
      {
        id: 'amount',
        header: t('admin.ops.deposits.colAmount', 'Amount'),
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap font-mono text-sm font-bold tabular-nums text-foreground">{formatBdtWithSymbol(row.original.amount)}</span>,
      },
      {
        id: 'method',
        header: t('admin.customerPayments.receipt.method', 'Method'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{depositMethodLabel(t, row.original.method)}</span>,
      },
      {
        id: 'received',
        header: t('admin.ops.deposits.colReceived', 'Received'),
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{fmtDay(row.original.receivedAt)}</span>,
      },
      {
        id: 'status',
        header: t('admin.customers.expiredPage.colStatus', 'Status'),
        enableSorting: false,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            tone={STATUS_TONE[row.original.status]}
            label={depositStatusLabel(t, row.original.status)}
          />
        ),
      },
      {
        id: 'note',
        header: t('admin.ops.deposits.colNote', 'Note'),
        enableSorting: false,
        cell: ({ row }) => <span className="line-clamp-2 min-w-[200px] text-foreground md:line-clamp-1">{row.original.note ?? '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">{t('admin.customers.list.colActions', 'Actions')}</div>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId(row.original.id)}
              className="h-8 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <Sliders className="h-3.5 w-3.5" /> {t('admin.ops.deposits.manage', 'Manage')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (summary.isLoading || (list.isLoading && !list.data)) return <PageSkeleton variant="table" rows={6} />;
  if (summary.isError || list.isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.deposits.loadFailed', 'Failed to load deposits')}
        description={errorMessage(summary.error ?? list.error, t('admin.ops.deposits.loadFailedHint', 'Could not load the deposit ledger.'))}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => {
          summary.refetch();
          list.refetch();
        }}
      />
    );
  }

  const pills: { key: StatusFilter; label: string; icon?: React.ReactNode; active: string; idle: string }[] = [
    { key: 'all', label: t('admin.ops.deposits.pillAll', 'All Records ({n})', { n: s?.totalCount ?? 0 }), active: 'bg-primary text-primary-foreground shadow-2xs', idle: 'border-border/70 hover:bg-accent' },
    { key: 'held', label: `${depositStatusLabel(t, 'held')} (${s?.heldCount ?? 0})`, icon: <ShieldCheck className="h-3 w-3" />, active: 'bg-blue-600 text-white', idle: 'text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10' },
    { key: 'refunded', label: `${depositStatusLabel(t, 'refunded')} (${s?.refundedCount ?? 0})`, icon: <RotateCcw className="h-3 w-3" />, active: 'bg-slate-600 text-white', idle: 'text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/10' },
    { key: 'adjusted', label: `${depositStatusLabel(t, 'adjusted')} (${s?.adjustedCount ?? 0})`, icon: <Wallet className="h-3 w-3" />, active: 'bg-emerald-700 text-white', idle: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('admin.ops.deposits.title', 'Security Deposits')}
        subtitle={t('admin.ops.deposits.subtitle', 'Customer equipment and connection deposits — record them, then refund or adjust them against bills with a full audit trail.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.billing', 'Billing') },
          { label: t('admin.ops.deposits.crumb', 'Deposits') },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setEditing('new')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> {t('admin.ops.deposits.record', 'Record Deposit')}
          </Button>
        }
      />

      {/* KPI ribbon (SQL totals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin.ops.deposits.kpiHeld', 'Held Deposits')}
          value={formatBdtWithSymbol(s?.heldTotal ?? 0)}
          hint={t('admin.ops.deposits.hintHeld', '{n} deposits currently held', { n: s?.heldCount ?? 0 })}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="primary"
        />
        <KpiCard
          label={depositStatusLabel(t, 'refunded')}
          value={formatBdtWithSymbol(s?.refundedTotal ?? 0)}
          hint={t('admin.ops.deposits.hintRefunded', '{n} returned to customers', { n: s?.refundedCount ?? 0 })}
          icon={<RotateCcw className="h-4 w-4" />}
          tone="sky"
        />
        <KpiCard
          label={depositStatusLabel(t, 'adjusted')}
          value={formatBdtWithSymbol(s?.adjustedTotal ?? 0)}
          hint={t('admin.ops.deposits.hintAdjusted', '{n} set against bills', { n: s?.adjustedCount ?? 0 })}
          icon={<Wallet className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          label={t('admin.ops.deposits.kpiTotal', 'Total Records')}
          value={String(s?.totalCount ?? 0)}
          hint={t('admin.ops.deposits.hintTotal', 'Deposits recorded')}
          icon={<HardDrive className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {/* Status filter */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mr-1">{t('admin.customers.expiredPage.colStatus', 'Status')}:</span>
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

      <DataTable
        urlState
        className={cn(list.isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(dep) => String(dep.id)}
        searchPlaceholder={t('admin.ops.deposits.searchPlaceholder', 'Search by customer name, mobile, note or deposit #…')}
        emptyTitle={t('admin.ops.deposits.emptyTitle', 'No deposits found')}
        emptyDescription={
          search || status !== 'all'
            ? t('admin.ops.deposits.emptyFiltered', 'Try clearing the search or status filter.')
            : t('admin.ops.deposits.emptyNone', 'Record the first deposit to start the ledger.')
        }
        server={{
          page,
          pageSize: perPage,
          total,
          onPageChange: setPage,
          onPageSizeChange: (n) => {
            setPerPage(n);
            setPage(1);
          },
          search,
          onSearchChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
      />

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
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}

function DepositSheet({ id, onClose, onEdit }: { id: number | null; onClose: () => void; onEdit: (d: Deposit) => void }) {
  const t = useTranslations();
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
          toast.success(t('admin.ops.deposits.toast.deleted', 'Deposit deleted'));
          close();
        },
      });
      return;
    }
    settle.mutate(
      { id: d.id, action: confirm, note },
      {
        onSuccess: () => {
          toast.success(
            confirm === 'refund'
              ? t('admin.ops.deposits.toast.refunded', 'Deposit marked refunded')
              : t('admin.ops.deposits.toast.adjusted', 'Deposit marked adjusted'),
          );
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
          <EmptyState variant="error"
            title={t('admin.ops.deposits.detailLoadFailed', 'Could not load the deposit')}
            description={errorMessage(detail.error)}
            actionLabel={t('admin.customers.list.retry', 'Retry')}
            onAction={() => detail.refetch()}
          />
        ) : (
          <>
            <SheetHeader>
              <StatusBadge status={d.status} tone={STATUS_TONE[d.status]} label={depositStatusLabel(t, d.status)} className="w-fit" />
              <SheetTitle className="text-xl font-bold text-foreground mt-2">
                {d.customerName ?? t('admin.ops.deposits.customerFallback', 'Customer #{id}', { id: d.customerId })}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground font-mono">
                {t('admin.ops.deposits.sheetDesc', 'Deposit #{id} · Received {date}', { id: d.id, date: fmtDay(d.receivedAt) })}
              </SheetDescription>
            </SheetHeader>

            <Card className="p-4 border-border/80 bg-muted/20">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{t('admin.ops.deposits.amountLabel', 'Deposit Amount')}</span>
              <p className="text-2xl font-bold text-primary font-mono tabular-nums mt-1">{formatBdtWithSymbol(d.amount)}</p>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <p>
                  {t('admin.customerPayments.receipt.method', 'Method')}: <strong className="text-foreground">{depositMethodLabel(t, d.method)}</strong>
                </p>
                {d.customerMobile && (
                  <p>
                    {t('admin.customerPayments.receipt.mobile', 'Mobile')}: <strong className="text-foreground font-mono">{d.customerMobile}</strong>
                  </p>
                )}
                {d.note && (
                  <p>
                    {t('admin.ops.deposits.colNote', 'Note')}: <strong className="text-foreground">{d.note}</strong>
                  </p>
                )}
                {d.createdByName && <p>{t('admin.ops.deposits.recordedBy', 'Recorded by {name}', { name: d.createdByName })}</p>}
              </div>
            </Card>

            {d.status === 'held' && (
              <div className="space-y-2">
                <label htmlFor="dep-settle-note" className="text-xs font-semibold text-foreground">
                  {t('admin.ops.deposits.settleNote', 'Note for refund / adjustment (optional)')}
                </label>
                <Textarea
                  id="dep-settle-note"
                  value={note}
                  maxLength={255}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs min-h-16"
                  placeholder={t('admin.ops.deposits.settlePlaceholder', 'e.g. returned in cash, adjusted on the next bill')}
                />
                <Button
                  onClick={() => setConfirm('refund')}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t('admin.ops.deposits.markRefunded', 'Mark as Refunded')}
                </Button>
                <Button variant="outline" onClick={() => setConfirm('adjust')} className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> {t('admin.ops.deposits.markAdjusted', 'Mark as Adjusted Against Bills')}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onEdit(d)} className="text-xs h-9 gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm('delete')} className="text-xs h-9 gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 font-bold text-muted-foreground uppercase tracking-wider text-xs">
                <History className="h-3.5 w-3.5" /> {t('admin.ops.deposits.auditTrail', 'Audit Trail')}
              </h4>
              {d.events.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('admin.ops.deposits.noHistory', 'No history recorded.')}</p>
              ) : (
                <ol className="space-y-2">
                  {d.events.map((e) => (
                    <li key={e.id} className="rounded-lg border border-border/50 bg-card p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{depositActionLabel(t, e.action)}</span>
                        <span className="font-mono text-xs text-muted-foreground">{fmtStamp(e.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {e.fromStatus && e.toStatus && e.fromStatus !== e.toStatus
                          ? `${depositStatusLabel(t, e.fromStatus)} → ${depositStatusLabel(t, e.toStatus)} · `
                          : ''}
                        {formatBdtWithSymbol(e.amount)}
                        {e.actorName ? ` · ${t('admin.ops.deposits.by', 'by {name}', { name: e.actorName })}` : ''}
                      </p>
                      {e.note && <p className="text-xs text-foreground mt-0.5">{e.note}</p>}
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
        title={
          confirm === 'delete'
            ? t('admin.ops.deposits.confirmDeleteTitle', 'Delete this deposit?')
            : confirm === 'refund'
              ? t('admin.ops.deposits.confirmRefundTitle', 'Mark deposit as refunded?')
              : t('admin.ops.deposits.confirmAdjustTitle', 'Mark deposit as adjusted?')
        }
        description={
          confirm === 'delete'
            ? t('admin.ops.deposits.confirmDeleteDesc', 'The deposit is removed from the ledger. Its audit trail is kept.')
            : t('admin.ops.deposits.confirmSettleDesc', 'A settled deposit is locked and can no longer be edited.')
        }
        confirmLabel={confirm === 'delete' ? t('common.delete', 'Delete') : t('common.confirm', 'Confirm')}
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
  const t = useTranslations();
  const isNew = target === 'new';
  const { create, update } = useDepositMutations();
  const [customer, setCustomer] = useState<BillingCustomerOption | null>(null);
  const [amount, setAmount] = useState(isNew ? '' : String(target.amount));
  const [method, setMethod] = useState(isNew ? '' : target.method);
  const [receivedAt, setReceivedAt] = useState(isNew ? todayYmd() : (target.receivedAt ?? todayYmd()));
  const [note, setNote] = useState(isNew ? '' : (target.note ?? ''));
  const methodItems = useMemo(() => Object.fromEntries(methods.map((m) => [m, depositMethodLabel(t, m)])), [methods, t]);
  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) {
      toast.error(t('admin.ops.deposits.toast.chooseMethod', 'Choose how the deposit was received'));
      return;
    }
    const values = { amount: Number(amount), method, receivedAt, note };
    if (isNew) {
      if (!customer) {
        toast.error(t('admin.ops.deposits.toast.chooseCustomer', 'Choose a customer'));
        return;
      }
      create.mutate(
        { ...values, customerId: customer.id },
        {
          onSuccess: () => {
            toast.success(t('admin.ops.deposits.toast.recorded', 'Deposit recorded'));
            onDone();
          },
        },
      );
    } else {
      update.mutate(
        { ...values, id: target.id },
        {
          onSuccess: () => {
            toast.success(t('admin.ops.deposits.toast.updated', 'Deposit updated'));
            onDone();
          },
        },
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base font-bold">{isNew ? t('admin.ops.deposits.formNewTitle', 'Record Security Deposit') : t('admin.ops.deposits.formEditTitle', 'Edit Deposit #{id}', { id: target.id })}</DialogTitle>
        <DialogDescription className="text-xs">
          {isNew ? t('admin.ops.deposits.formNewDesc', 'Money held for equipment or connection, refundable or adjustable later.') : (target.customerName ?? '')}
        </DialogDescription>
      </DialogHeader>

      {isNew && (
        <div className="space-y-1.5">
          <label htmlFor="dep-customer" className="text-xs font-semibold">{t('admin.ops.deposits.fieldCustomer', 'Customer *')}</label>
          <BillingCustomerPicker id="dep-customer" value={customer} onChange={setCustomer} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="dep-amount" className="text-xs font-semibold">{t('admin.ops.deposits.fieldAmount', 'Amount (৳) *')}</label>
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
          <label htmlFor="dep-date" className="text-xs font-semibold">{t('admin.ops.deposits.fieldReceived', 'Received On *')}</label>
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
        <label htmlFor="dep-method" className="text-xs font-semibold">{t('admin.ops.deposits.fieldMethod', 'Method *')}</label>
        <Select items={methodItems} value={method || null} onValueChange={(v) => setMethod(v ? String(v) : '')}>
          <SelectTrigger id="dep-method" className="text-xs h-9 w-full">
            <SelectValue placeholder={t('admin.ops.deposits.chooseMethod', 'Choose method')} />
          </SelectTrigger>
          <SelectContent>
            {methods.map((m) => (
              <SelectItem key={m} value={m}>
                {depositMethodLabel(t, m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dep-note" className="text-xs font-semibold">{t('admin.ops.deposits.colNote', 'Note')}</label>
        <Textarea
          id="dep-note"
          maxLength={255}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-xs min-h-16"
          placeholder={t('admin.ops.deposits.notePlaceholder', 'What the deposit is for (e.g. ONU, router)')}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={pending} className="bg-primary text-primary-foreground">
          {pending
            ? t('admin.ops.deposits.saving', 'Saving…')
            : isNew
              ? t('admin.ops.deposits.record', 'Record Deposit')
              : t('admin.ops.deposits.saveChanges', 'Save Changes')}
        </Button>
      </DialogFooter>
    </form>
  );
}
