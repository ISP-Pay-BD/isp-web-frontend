'use client';

import { useMemo, useState } from 'react';
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
import { Can, ConfirmDialog, EmptyState, PageSkeleton, TablePagination } from '@/components/shared';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useServerTable } from '../table-utils';
import { DateRangeInputs, DebouncedSearchInput, KpiCard } from '../components';
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

const KIND_UI = {
  income: {
    noun: 'income',
    crumb: 'Incomes',
    totalLabel: 'Total Recorded',
    icon: TrendingUp,
    tone: 'emerald',
    amountText: 'text-emerald-400',
    idText: 'text-primary',
    idBadge: 'bg-primary/10 text-primary border-primary/20',
  },
  expense: {
    noun: 'expense',
    crumb: 'Expenses',
    totalLabel: 'Total Expenses',
    icon: TrendingDown,
    tone: 'rose',
    amountText: 'text-rose-400',
    idText: 'text-rose-400',
    idBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
} as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const STATUS_TABS: Array<{ value: LedgerStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const ALL = '__all__';

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-medium', STATUS_STYLES[status] ?? 'text-muted-foreground')}
    >
      {humanize(status) || '—'}
    </Badge>
  );
}

const ACTION_COPY: Record<LedgerAction, { title: string; confirm: string; done: string }> = {
  approve: { title: 'Approve entry', confirm: 'Approve', done: 'approved' },
  reject: { title: 'Reject entry', confirm: 'Reject', done: 'rejected' },
  delete: { title: 'Delete entry', confirm: 'Delete', done: 'deleted' },
};

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
  const ui = KIND_UI[kind];
  const { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage } =
    useServerTable(20);
  const [status, setStatus] = useState<LedgerStatusFilter>('all');
  const [category, setCategory] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [searchInputKey, setSearchInputKey] = useState(0);

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
      [ALL]: 'All categories',
      ...Object.fromEntries((categories.data ?? []).map((c) => [c.name, c.name])),
    }),
    [categories.data],
  );

  const rows = list.data?.items ?? [];
  // Prefer the freshest copy of the inspected entry (e.g. after an edit).
  const current = selected ? (rows.find((r) => r.id === selected.id) ?? selected) : null;
  const total = list.data?.meta.total ?? 0;
  const s = summary.data;
  const avg = s && s.count > 0 ? s.totalAmount / s.count : 0;
  const hasFilters = Boolean(search || status !== 'all' || category || range.from || range.to);

  const clearFilters = () => {
    setStatus('all');
    setCategory('');
    setRange({ from: '', to: '' });
    setSearchInputKey((k) => k + 1);
    onSearchChange('');
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
          toast.success(
            `Entry #${entry.id} ${ACTION_COPY[act].done}${jeId ? ` · journal entry #${jeId}` : ''}`,
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
    const label = `${ui.noun} entry #${entry.id} (${entry.name}, ${money(entry.amount)})`;
    if (act === 'approve') return `Approve ${label}? Approving posts it to the general ledger.`;
    if (act === 'reject') return `Reject ${label}?`;
    return `Delete ${label}? This cannot be undone.`;
  })();

  if (list.isPending) return <PageSkeleton variant="table" rows={8} />;

  const pendingActions = (entry: LedgerEntry, size: 'icon' | 'full') =>
    entry.status === 'pending' ? (
      <Can menu="accounting" action="update">
        {size === 'icon' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              title="Edit entry"
              aria-label={`Edit entry ${entry.id}`}
              onClick={() => setEditor({ entry })}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
              title="Approve"
              aria-label={`Approve entry ${entry.id}`}
              disabled={action.isPending}
              onClick={() => setConfirm({ action: 'approve', entry })}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-400 hover:bg-amber-500/10"
              title="Reject"
              aria-label={`Reject entry ${entry.id}`}
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
              Approve
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-accent text-xs"
              onClick={() => setConfirm({ action: 'reject', entry })}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-accent text-xs"
              onClick={() => setEditor({ entry })}
            >
              Edit
            </Button>
          </>
        )}
      </Can>
    ) : null;

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Accounting' },
          { label: ui.crumb },
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
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoriesOpen(true)}
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <Tags className="h-3.5 w-3.5" />
              Manage categories
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate(filters, {
                  onSuccess: (n) =>
                    toast.success(n ? `Exported ${n} ${ui.noun} entries` : 'No entries to export'),
                })
              }
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <FileSpreadsheet className={cn('h-3.5 w-3.5', ui.amountText)} />
              {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Can menu="accounting" action="create">
              <Button
                onClick={() => setEditor({ entry: null })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New {ui.noun.charAt(0).toUpperCase() + ui.noun.slice(1)} Entry
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPIs — from /summary with the same filters as the list */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={ui.totalLabel}
          value={s ? money(s.totalAmount) : '—'}
          hint={
            s
              ? `${s.count.toLocaleString()} entries`
              : summary.isError
                ? 'Totals unavailable'
                : undefined
          }
          icon={ui.icon}
          tone={ui.tone}
        />
        <KpiCard
          label="Average Entry"
          value={s ? money(Math.round(avg * 100) / 100) : '—'}
          hint="Total ÷ number of entries"
          icon={Wallet}
          tone="blue"
        />
        <KpiCard
          label="Pending Approval"
          value={s ? money(s.pending.amount) : '—'}
          hint={s ? `${s.pending.count.toLocaleString()} awaiting approval` : undefined}
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          label="Approved"
          value={s ? money(s.approved.amount) : '—'}
          hint={s ? `${s.approved.count.toLocaleString()} approved` : undefined}
          icon={CheckCircle2}
          tone="purple"
        />
      </div>

      {/* Filter Bar */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <DebouncedSearchInput
          key={searchInputKey}
          onSearchChange={onSearchChange}
          placeholder="Search by name, invoice #, employee, bank…"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
            {STATUS_TABS.map((t) => (
              <Button
                key={t.value}
                type="button"
                size="sm"
                variant={status === t.value ? 'default' : 'ghost'}
                onClick={() => {
                  setStatus(t.value);
                  resetPage();
                }}
                className="h-7 px-2.5 text-xs"
              >
                {t.label}
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
            <SelectTrigger className="bg-background/80 h-9 w-[180px] text-xs" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value={ALL}>All categories</SelectItem>
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
        </div>
      </div>

      {/* Table */}
      {list.isError ? (
        <EmptyState
          title={`Failed to load ${ui.noun} entries`}
          description={list.error.message}
          actionLabel="Retry"
          onAction={() => list.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ui.icon className="text-muted-foreground h-10 w-10" />}
          title={`No ${ui.noun} entries found`}
          description={
            hasFilters
              ? `No ${ui.noun} entries match your search or filters.`
              : (categories.data?.length ?? 0) === 0
                ? `Add a category under "Manage categories", then record the first ${ui.noun} entry.`
                : `No ${ui.noun} entries have been recorded yet.`
          }
          actionLabel={hasFilters ? 'Clear filters' : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <div
          className={cn(
            'border-border/60 bg-card overflow-hidden rounded-xl border shadow-xs transition-opacity',
            list.isPlaceholderData && 'opacity-60',
          )}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground border-border/60 border-b font-medium">
                  <TableHead className="text-xs font-semibold">ID</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Employee</TableHead>
                  <TableHead className="text-xs font-semibold">Bank account</TableHead>
                  <TableHead className="text-xs font-semibold">Invoice</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Amount (BDT)</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border/40 divide-y">
                {rows.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/30 group cursor-pointer transition-colors duration-150"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell className={cn('font-mono text-xs font-bold', ui.idText)}>
                      #{item.id}
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.date || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground max-w-[200px] truncate text-xs font-semibold">
                      {item.name || '—'}
                    </TableCell>
                    <TableCell className="text-foreground text-xs">
                      {item.category || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.employeeName || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {item.bankAccount || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {item.invoiceNo || '—'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-sm font-bold tabular-nums',
                        ui.amountText,
                      )}
                    >
                      {money(item.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-7 w-7"
                          title="View"
                          aria-label={`View entry ${item.id}`}
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
                            title="Delete entry"
                            aria-label={`Delete entry ${item.id}`}
                            disabled={action.isPending}
                            onClick={() => setConfirm({ action: 'delete', entry: item })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
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
                  <Badge variant="outline" className={cn('font-mono text-[10px]', ui.idBadge)}>
                    #{current.id}
                  </Badge>
                  <StatusBadge status={current.status} />
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
                        'Amount',
                        <span
                          key="a"
                          className={cn('font-mono text-base font-bold', ui.amountText)}
                        >
                          {money(current.amount)}
                        </span>,
                      ],
                      ['Date', current.date],
                      ['Employee', current.employeeName],
                      ['Bank account', current.bankAccount],
                      ['Invoice no.', current.invoiceNo],
                      ['Recorded at', current.createdAt],
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
                      Description
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
                    Close
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
          noun={ui.noun}
          open
          onOpenChange={(open) => !open && setEditor(null)}
          entry={editor.entry}
        />
      )}

      {categoriesOpen && (
        <ManageCategoriesDialog kind={kind} noun={ui.noun} open onOpenChange={setCategoriesOpen} />
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm ? ACTION_COPY[confirm.action].title : ''}
        description={confirmDescription}
        confirmLabel={confirm ? ACTION_COPY[confirm.action].confirm : 'Confirm'}
        destructive={confirm?.action !== 'approve'}
        onConfirm={runConfirmed}
      />
    </div>
  );
}
