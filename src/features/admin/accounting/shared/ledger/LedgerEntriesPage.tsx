'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Ban,
  Calendar,
  Check,
  Clock,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Can, ConfirmDialog, EmptyState, PageSkeleton, StatusBadge } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useServerTable } from '../table-utils';
import { DateRangeInputs, KpiCard } from '../components';
import { humanize, money } from '../format';
import {
  useExportLedger,
  useLedgerAction,
  useLedgerCategories,
  useLedgerEntries,
  useLedgerSummary,
  type LedgerAction,
  type LedgerEntry,
  type LedgerFilters,
  type LedgerKind,
  type LedgerStatusFilter,
} from './api';
import { LedgerEntryModal } from './LedgerEntryModal';
import { ManageCategoriesDialog } from './ManageCategoriesDialog';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { ledgerCopy } from './copy';

const KIND_UI = {
  income: {
    icon: TrendingUp,
    tone: 'emerald',
    amountText: 'text-emerald-400',
    idText: 'text-primary',
    idBadge: 'bg-primary/10 text-primary border-primary/20',
  },
  expense: {
    icon: TrendingDown,
    tone: 'rose',
    amountText: 'text-rose-400',
    idText: 'text-rose-400',
    idBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
} as const;

const STATUS_TABS: LedgerStatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

const ALL = '__all__';

/** Shared income / expense ledger screen (list, KPIs, approve/reject, CRUD, categories, export). */
export function LedgerEntriesPage({
  kind,
  title,
  subtitle,
}: {
  kind: LedgerKind;
  title: string;
  subtitle: string;
}) {
  const t = useTranslations();
  const ui = KIND_UI[kind];
  const copy = useMemo(() => ledgerCopy(t, kind), [t, kind]);
  const statusLabel = useCallback(
    (status: string) => (status ? t(`status.${status.toLowerCase()}`, humanize(status)) : '—'),
    [t],
  );
  const statusTabLabel = (value: LedgerStatusFilter) =>
    value === 'all' ? t('admin.accounting.ledger.all', 'All') : statusLabel(value);
  const actionCopy: Record<LedgerAction, { title: string; confirm: string }> = {
    approve: { title: t('admin.accounting.ledger.approveTitle', 'Approve entry'), confirm: t('admin.accounting.ledger.approve', 'Approve') },
    reject: { title: t('admin.accounting.ledger.rejectTitle', 'Reject entry'), confirm: t('admin.accounting.ledger.reject', 'Reject') },
    delete: { title: t('admin.accounting.ledger.deleteTitle', 'Delete entry'), confirm: t('admin.accounting.ledger.delete', 'Delete') },
  };
  const { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage } =
    useServerTable(20);
  const [status, setStatus] = useState<LedgerStatusFilter>('all');
  const [category, setCategory] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  const filters: LedgerFilters = useMemo(
    () => ({ search, status, category, fromDate: range.from, toDate: range.to }),
    [search, status, category, range],
  );

  const list = useLedgerEntries(kind, filters, page, pageSize);
  const summary = useLedgerSummary(kind, filters);
  const categories = useLedgerCategories(kind);
  const action = useLedgerAction(kind);
  const exportCsv = useExportLedger(kind);

  const [editor, setEditor] = useState<{ entry: LedgerEntry | null } | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selected, setSelected] = useState<LedgerEntry | null>(null);
  const [confirm, setConfirm] = useState<{ action: LedgerAction; entry: LedgerEntry } | null>(null);

  const categoryItems = useMemo(
    () => ({
      [ALL]: t('admin.accounting.ledger.allCategories', 'All categories'),
      ...Object.fromEntries((categories.data ?? []).map((c) => [c.name, c.name])),
    }),
    [categories.data, t],
  );

  const rows = list.data?.items ?? [];
  // Prefer the freshest copy of the inspected entry (e.g. after an edit).
  const current = selected ? (rows.find((r) => r.id === selected.id) ?? selected) : null;
  const total = list.data?.meta.total ?? 0;
  const s = summary.data;
  const avg = s && s.count > 0 ? s.totalAmount / s.count : 0;
  const hasToolbarFilters = status !== 'all' || Boolean(category || range.from || range.to);
  const hasFilters = Boolean(search) || hasToolbarFilters;

  const clearFilters = () => {
    setStatus('all');
    setCategory('');
    setRange({ from: '', to: '' });
    resetPage();
  };

  const runConfirmed = () => {
    if (!confirm) return;
    const { action: act, entry } = confirm;
    setConfirm(null);
    action.mutate(
      { id: entry.id, action: act },
      {
        onSuccess: (res) => {
          const jeId = act === 'approve' ? res?.journal_entry_id : undefined;
          const done =
            act === 'approve'
              ? t('admin.accounting.ledger.toast.approved', 'Entry #{id} approved', { id: entry.id })
              : act === 'reject'
                ? t('admin.accounting.ledger.toast.rejected', 'Entry #{id} rejected', { id: entry.id })
                : t('admin.accounting.ledger.toast.deleted', 'Entry #{id} deleted', { id: entry.id });
          toast.success(
            jeId
              ? `${done} · ${t('admin.accounting.ledger.toast.journalEntry', 'journal entry #{id}', { id: String(jeId) })}`
              : done,
          );
          if (act !== 'delete') return;
          setSelected((cur) => (cur?.id === entry.id ? null : cur));
          if (rows.length === 1 && page > 1) setPage(page - 1);
        },
      },
    );
  };

  const confirmDescription = (() => {
    if (!confirm) return '';
    const { action: act, entry } = confirm;
    const label = copy.entryLabel({ id: entry.id, name: entry.name, amount: money(entry.amount) });
    if (act === 'approve') {
      return t('admin.accounting.ledger.confirmApprove', 'Approve {label}? Approving posts it to the general ledger.', { label });
    }
    if (act === 'reject') return t('admin.accounting.ledger.confirmReject', 'Reject {label}?', { label });
    return t('admin.accounting.ledger.confirmDelete', 'Delete {label}? This cannot be undone.', { label });
  })();

  const pendingActions = useCallback(
    (entry: LedgerEntry, size: 'icon' | 'full') =>
      entry.status === 'pending' ? (
        <Can menu="accounting" action="update">
          {size === 'icon' ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                title={t('admin.accounting.ledger.editEntry', 'Edit entry')}
                aria-label={t('admin.accounting.ledger.editEntryN', 'Edit entry {id}', { id: entry.id })}
                onClick={() => setEditor({ entry })}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                title={t('admin.accounting.ledger.approve', 'Approve')}
                aria-label={t('admin.accounting.ledger.approveEntryN', 'Approve entry {id}', { id: entry.id })}
                disabled={action.isPending}
                onClick={() => setConfirm({ action: 'approve', entry })}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-400 hover:bg-amber-500/10"
                title={t('admin.accounting.ledger.reject', 'Reject')}
                aria-label={t('admin.accounting.ledger.rejectEntryN', 'Reject entry {id}', { id: entry.id })}
                disabled={action.isPending}
                onClick={() => setConfirm({ action: 'reject', entry })}
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 text-xs font-semibold"
                disabled={action.isPending}
                onClick={() => setConfirm({ action: 'approve', entry })}
              >
                {t('admin.accounting.ledger.approve', 'Approve')}
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-accent text-xs"
                onClick={() => setConfirm({ action: 'reject', entry })}
              >
                {t('admin.accounting.ledger.reject', 'Reject')}
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-accent text-xs"
                onClick={() => setEditor({ entry })}
              >
                {t('common.edit', 'Edit')}
              </Button>
            </>
          )}
        </Can>
      ) : null,
    [action.isPending, t],
  );

  const columns = useMemo<LegacyColumnDef<LedgerEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('admin.accounting.ledger.colId', 'ID'),
        cell: ({ row }) => (
          <span className={cn('font-mono text-xs font-bold', ui.idText)}>#{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: t('admin.accounting.ledger.colDate', 'Date'),
        cell: ({ row }) => (
          <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" />
            {row.original.date || '—'}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: t('admin.accounting.ledger.colName', 'Name'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <button
            type="button"
            className="text-foreground hover:text-primary block max-w-full truncate text-left font-semibold transition-colors md:max-w-[200px]"
            onClick={() => setSelected(row.original)}
          >
            {row.original.name || '—'}
          </button>
        ),
      },
      {
        accessorKey: 'category',
        header: t('admin.accounting.ledger.colCategory', 'Category'),
        cell: ({ row }) => <span className="text-foreground">{row.original.category || '—'}</span>,
      },
      {
        accessorKey: 'employeeName',
        header: t('admin.accounting.ledger.colEmployee', 'Employee'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.employeeName || '—'}</span>
        ),
      },
      {
        accessorKey: 'bankAccount',
        header: t('admin.accounting.ledger.colBank', 'Bank account'),
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono">{row.original.bankAccount || '—'}</span>
        ),
      },
      {
        accessorKey: 'invoiceNo',
        header: t('admin.accounting.ledger.colInvoice', 'Invoice'),
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono">{row.original.invoiceNo || '—'}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: t('admin.accounting.ledger.colAmount', 'Amount (BDT)'),
        cell: ({ row }) => (
          <span className={cn('font-mono text-sm font-bold tabular-nums', ui.amountText)}>
            {money(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} label={statusLabel(row.original.status)} />
        ),
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                title={t('admin.accounting.ledger.view', 'View')}
                aria-label={t('admin.accounting.ledger.viewEntryN', 'View entry {id}', { id: item.id })}
                onClick={() => setSelected(item)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              {pendingActions(item, 'icon')}
              <Can menu="accounting" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 h-7 w-7"
                  title={t('admin.accounting.ledger.deleteTitle', 'Delete entry')}
                  aria-label={t('admin.accounting.ledger.deleteEntryN', 'Delete entry {id}', { id: item.id })}
                  disabled={action.isPending}
                  onClick={() => setConfirm({ action: 'delete', entry: item })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Can>
            </div>
          );
        },
      },
    ],
    [ui, pendingActions, action.isPending, statusLabel, t],
  );

  if (list.isPending) return <PageSkeleton variant="table" rows={8} />;

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.accounting', 'Accounting') },
          { label: copy.crumb },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void list.refetch();
                void summary.refetch();
              }}
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', list.isFetching && 'animate-spin')} />
              {t('admin.accounting.ledger.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoriesOpen(true)}
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <Tags className="h-3.5 w-3.5" />
              {t('admin.accounting.ledger.manageCategories', 'Manage categories')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate(filters, {
                  onSuccess: (n) =>
                    toast.success(
                      n
                        ? copy.exported(formatCount(n))
                        : t('admin.accounting.ledger.toast.nothingToExport', 'No entries to export'),
                    ),
                })
              }
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <FileSpreadsheet className={cn('h-3.5 w-3.5', ui.amountText)} />
              {exportCsv.isPending ? t('admin.accounting.ledger.exporting', 'Exporting…') : t('admin.accounting.ledger.exportCsv', 'Export CSV')}
            </Button>
            <Can menu="accounting" action="create">
              <Button
                onClick={() => setEditor({ entry: null })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {copy.newEntry}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPIs — from /summary with the same filters as the list */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={copy.totalLabel}
          value={s ? money(s.totalAmount) : '—'}
          hint={
            s
              ? t('admin.accounting.ledger.kpiEntries', '{n} entries', { n: formatCount(s.count) })
              : summary.isError
                ? t('admin.accounting.ledger.totalsUnavailable', 'Totals unavailable')
                : undefined
          }
          icon={ui.icon}
          tone={ui.tone}
        />
        <KpiCard
          label={t('admin.accounting.ledger.kpiAverage', 'Average Entry')}
          value={s ? money(Math.round(avg * 100) / 100) : '—'}
          hint={t('admin.accounting.ledger.kpiAverageHint', 'Total ÷ number of entries')}
          icon={Wallet}
          tone="blue"
        />
        <KpiCard
          label={t('admin.accounting.ledger.kpiPending', 'Pending Approval')}
          value={s ? money(s.pending.amount) : '—'}
          hint={s ? t('admin.accounting.ledger.kpiPendingHint', '{n} awaiting approval', { n: formatCount(s.pending.count) }) : undefined}
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          label={t('status.approved', 'Approved')}
          value={s ? money(s.approved.amount) : '—'}
          hint={s ? t('admin.accounting.ledger.kpiApprovedHint', '{n} approved', { n: formatCount(s.approved.count) }) : undefined}
          icon={CheckCircle2}
          tone="purple"
        />
      </div>

      {list.isError ? (
        <EmptyState variant="error"
          title={copy.loadFailed}
          description={list.error.message}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => list.refetch()}
        />
      ) : (
        <div className={cn('transition-opacity', list.isPlaceholderData && 'opacity-60')}>
          <DataTable
            urlState
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            searchPlaceholder={t('admin.accounting.ledger.searchPlaceholder', 'Search by name, invoice #, employee, bank…')}
            emptyTitle={copy.emptyTitle}
            emptyDescription={
              hasFilters
                ? copy.emptyFiltered
                : (categories.data?.length ?? 0) === 0
                  ? copy.emptyNoCategory
                  : copy.emptyNone
            }
            server={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange,
              search,
              onSearchChange,
            }}
            toolbarActions={
              <>
                <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
                  {STATUS_TABS.map((tab) => (
                    <Button
                      key={tab}
                      type="button"
                      size="sm"
                      variant={status === tab ? 'default' : 'ghost'}
                      onClick={() => {
                        setStatus(tab);
                        resetPage();
                      }}
                      className="h-7 px-2.5 text-xs"
                    >
                      {statusTabLabel(tab)}
                    </Button>
                  ))}
                </div>
                <Select
                  items={categoryItems}
                  value={category || ALL}
                  onValueChange={(v) => {
                    setCategory(!v || v === ALL ? '' : v);
                    resetPage();
                  }}
                >
                  <SelectTrigger className="bg-background/80 h-9 min-w-[180px] text-xs" aria-label={t('admin.accounting.ledger.colCategory', 'Category')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value={ALL}>{t('admin.accounting.ledger.allCategories', 'All categories')}</SelectItem>
                    {(categories.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DateRangeInputs
                  from={range.from}
                  to={range.to}
                  onChange={(r) => {
                    setRange(r);
                    resetPage();
                  }}
                />
                {hasToolbarFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 text-xs"
                  >
                    {t('admin.accounting.ledger.clearFilters', 'Clear filters')}
                  </Button>
                ) : null}
              </>
            }
          />
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!current} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full overflow-y-auto sm:max-w-md">
          {current && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('font-mono text-xs', ui.idBadge)}>
                    #{current.id}
                  </Badge>
                  <StatusBadge status={current.status} label={statusLabel(current.status)} />
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {current.name || current.category}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  {current.category}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border-border/70 bg-muted/20 space-y-3 border p-4">
                  {(
                    [
                      [
                        t('admin.accounting.ledger.sheetAmount', 'Amount'),
                        <span
                          key="a"
                          className={cn('font-mono text-base font-bold', ui.amountText)}
                        >
                          {money(current.amount)}
                        </span>,
                      ],
                      [t('admin.accounting.ledger.colDate', 'Date'), current.date],
                      [t('admin.accounting.ledger.colEmployee', 'Employee'), current.employeeName],
                      [t('admin.accounting.ledger.colBank', 'Bank account'), current.bankAccount],
                      [t('admin.accounting.ledger.invoiceNo', 'Invoice no.'), current.invoiceNo],
                      [t('admin.accounting.ledger.recordedAt', 'Recorded at'), current.createdAt],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground text-right font-mono">{value || '—'}</span>
                    </div>
                  ))}
                </Card>

                {current.description && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {t('admin.accounting.ledger.description', 'Description')}
                    </p>
                    <p className="text-foreground bg-muted/30 border-border/60 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                      {current.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4">
                  {pendingActions(current, 'full')}
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelected(null)}
                  >
                    {t('common.close', 'Close')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {editor && (
        <LedgerEntryModal
          kind={kind}
          open
          onOpenChange={(open) => !open && setEditor(null)}
          entry={editor.entry}
        />
      )}

      {categoriesOpen && (
        <ManageCategoriesDialog kind={kind} open onOpenChange={setCategoriesOpen} />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm ? actionCopy[confirm.action].title : ''}
        description={confirmDescription}
        confirmLabel={confirm ? actionCopy[confirm.action].confirm : t('common.confirm', 'Confirm')}
        destructive={confirm?.action !== 'approve'}
        onConfirm={runConfirmed}
      />
    </div>
  );
}
