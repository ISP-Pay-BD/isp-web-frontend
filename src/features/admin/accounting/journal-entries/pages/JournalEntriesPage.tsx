'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  FileText,
  PenLine,
  Cpu,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet,
  ArrowRightLeft,
  Eye,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useExportJournal,
  useJournalEntries,
  useJournalSummary,
  type JournalEntryItem,
  type JournalFilters,
  type JournalSource,
} from '../hooks/use-journal-entries';
import { NewJournalVoucherDialog } from '../components/NewJournalVoucherDialog';
import { PageSkeleton, EmptyState, Can } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { replaceQuery } from '@/hooks/use-url-state';
import { useServerTable } from '../../shared/table-utils';
import { DateRangeInputs, KpiCard } from '../../shared/components';
import { humanize, money } from '../../shared/format';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

const SOURCE_TABS: JournalSource[] = ['all', 'manual', 'system'];

type Translate = ReturnType<typeof useTranslations>;

/** "Manual" for hand-posted vouchers, otherwise "Auto · <origin>". */
function sourceText(t: Translate, referenceType: string): string {
  if (!referenceType || referenceType === 'manual') return t('admin.accounting.journal.source.manual', 'Manual');
  const origin = t(`admin.accounting.journal.origin.${referenceType}`, humanize(referenceType));
  return t('admin.accounting.journal.source.auto', 'Auto · {origin}', { origin });
}

function SourceBadge({ referenceType }: { referenceType: string }) {
  const t = useTranslations();
  const manual = !referenceType || referenceType === 'manual';
  return (
    <Badge
      variant="outline"
      tone={manual ? undefined : 'info'} className="text-xs font-medium whitespace-nowrap"
    >
      {sourceText(t, referenceType)}
    </Badge>
  );
}

/** `useSearchParams` needs a Suspense boundary in the App Router. */
export function JournalEntriesPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" rows={8} />}>
      <JournalEntriesView />
    </Suspense>
  );
}

function JournalEntriesView() {
  const t = useTranslations();
  const accountId = useSearchParams().get('account_id') ?? '';

  const { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage } =
    useServerTable(20);
  const [source, setSource] = useState<JournalSource>('all');
  const [range, setRange] = useState({ from: '', to: '' });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filters: JournalFilters = useMemo(
    () => ({ search, fromDate: range.from, toDate: range.to, source, accountId }),
    [search, range, source, accountId],
  );

  const list = useJournalEntries(filters, page, pageSize);
  const summary = useJournalSummary(filters);
  const exportCsv = useExportJournal();
  const s = summary.data;

  // Label for the account filter chip, taken from the loaded lines.
  const filteredAccount = accountId
    ? list.entries.flatMap((e) => e.lines).find((l) => l.accountId === accountId)
    : undefined;

  const clearAccount = () => {
    resetPage();
    replaceQuery((params) => params.delete('account_id'));
  };

  const columns = useMemo<LegacyColumnDef<JournalEntryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('admin.accounting.journal.colId', 'Entry ID'),
        cell: ({ row }) => (
          <span className="bg-primary/10 border-primary/20 text-primary rounded-md border px-2 py-1 font-mono text-xs font-bold">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: t('admin.accounting.journal.colDate', 'Date'),
        cell: ({ row }) => (
          <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" />
            {row.original.date}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: t('admin.accounting.journal.colDescription', 'Voucher Description'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <button
            type="button"
            className="text-foreground hover:text-primary text-left font-medium transition-colors"
            onClick={() => setSelectedEntry(row.original)}
          >
            {row.original.description || '—'}
          </button>
        ),
      },
      {
        id: 'source',
        header: t('admin.accounting.journal.colSource', 'Source'),
        accessorFn: (entry) => sourceText(t, entry.referenceType),
        cell: ({ row }) => <SourceBadge referenceType={row.original.referenceType} />,
      },
      {
        accessorKey: 'totalDebit',
        header: t('admin.accounting.journal.colDebit', 'Debit (BDT)'),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
            {money(row.original.totalDebit)}
          </span>
        ),
      },
      {
        accessorKey: 'totalCredit',
        header: t('admin.accounting.journal.colCredit', 'Credit (BDT)'),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-blue-400 tabular-nums">
            {money(row.original.totalCredit)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-7 w-7"
            aria-label={t('admin.accounting.journal.viewEntry', 'View entry {id}', { id: row.original.id })}
            onClick={() => setSelectedEntry(row.original)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [t],
  );

  if (list.isPending) return <PageSkeleton variant="table" rows={8} />;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title={t('admin.accounting.journal.title', 'General Journal & Double-Entry Vouchers')}
        subtitle={t('admin.accounting.journal.subtitle', 'Every posted debit-credit voucher: manual journals and entries posted automatically from approved incomes, expenses and payments.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.accounting', 'Accounting') },
          { label: t('nav.acc-journal', 'Journal Entries') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void list.refetch();
                void summary.refetch();
              }}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', list.isFetching && 'animate-spin')} />
              {t('admin.accounting.journal.refresh', 'Refresh')}
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
                        ? t('admin.accounting.journal.toast.exported', 'Exported {n} journal entries', { n: formatCount(n) })
                        : t('admin.accounting.journal.toast.nothingToExport', 'No journal entries to export'),
                    ),
                })
              }
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              {exportCsv.isPending ? t('admin.accounting.journal.exporting', 'Exporting…') : t('admin.accounting.journal.export', 'Export Journal')}
            </Button>
            <Can menu="accounting" action="create">
              <Button
                size="sm"
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {t('admin.accounting.journal.newVoucher', 'New Journal Voucher')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon — /journal-entries/summary with the list's filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('admin.accounting.journal.kpiTotal', 'Total Vouchers')}
          value={s ? formatCount(s.count) : '—'}
          hint={summary.isError ? t('admin.accounting.journal.totalsUnavailable', 'Totals unavailable') : t('admin.accounting.journal.kpiTotalHint', 'Journal entries in this view')}
          icon={FileText}
          tone="purple"
        />
        <KpiCard
          label={t('admin.accounting.journal.kpiManual', 'Manual Vouchers')}
          value={s ? formatCount(s.manualCount) : '—'}
          hint={t('admin.accounting.journal.kpiManualHint', 'Posted by hand')}
          icon={PenLine}
          tone="emerald"
        />
        <KpiCard
          label={t('admin.accounting.journal.tabAuto', 'Auto-posted')}
          value={s ? formatCount(s.systemCount) : '—'}
          hint={t('admin.accounting.journal.kpiAutoHint', 'Posted automatically by the system')}
          icon={Cpu}
          tone="blue"
        />
        <KpiCard
          label={t('admin.accounting.journal.kpiDebitCredit', 'Total Debit / Credit')}
          value={s ? money(s.totalDebit) : '—'}
          hint={
            s
              ? s.totalDebit === s.totalCredit
                ? t('admin.accounting.journal.debitsEqual', 'Debits equal credits')
                : t('admin.accounting.journal.creditsAmount', 'Credits {amount}', { amount: money(s.totalCredit) })
              : undefined
          }
          icon={ArrowRightLeft}
          tone="amber"
        />
      </div>

      {/* Journal Table */}
      {list.isError ? (
        <EmptyState variant="error"
          title={t('admin.accounting.journal.loadFailed', 'Failed to load journal entries')}
          description={list.error.message}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => list.refetch()}
        />
      ) : (
        <div className={cn('transition-opacity', list.isPlaceholderData && 'opacity-60')}>
          <DataTable
            urlState
            columns={columns}
            data={list.entries}
            getRowId={(row) => row.id}
            searchPlaceholder={t('admin.accounting.journal.searchPlaceholder', 'Search by voucher ID or description...')}
            emptyTitle={t('admin.accounting.journal.emptyTitle', 'No journal entries found')}
            emptyDescription={
              search || source !== 'all' || range.from || range.to || accountId
                ? t('admin.accounting.journal.emptyFiltered', 'No vouchers match the current filters.')
                : t('admin.accounting.journal.emptyNone', 'Posted vouchers will appear here.')
            }
            server={{
              page,
              pageSize,
              total: list.total,
              onPageChange: setPage,
              onPageSizeChange,
              search,
              onSearchChange,
            }}
            toolbarActions={
              <>
                {accountId && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 h-9 gap-1.5 px-3 text-xs"
                  >
                    {t('admin.accounting.journal.accountChip', 'Account:')}{' '}
                    {filteredAccount
                      ? `${filteredAccount.accountCode} — ${filteredAccount.accountName}`
                      : `#${accountId}`}
                    <button
                      type="button"
                      aria-label={t('admin.accounting.journal.clearAccount', 'Clear account filter')}
                      onClick={clearAccount}
                      className="hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
                  {SOURCE_TABS.map((tab) => (
                    <Button
                      key={tab}
                      type="button"
                      size="sm"
                      variant={source === tab ? 'default' : 'ghost'}
                      onClick={() => {
                        setSource(tab);
                        resetPage();
                      }}
                      className="h-7 px-2.5 text-xs"
                    >
                      {tab === 'all'
                        ? t('admin.accounting.journal.tabAll', 'All')
                        : tab === 'manual'
                          ? t('admin.accounting.journal.source.manual', 'Manual')
                          : t('admin.accounting.journal.tabAuto', 'Auto-posted')}
                    </Button>
                  ))}
                </div>
                <DateRangeInputs
                  from={range.from}
                  to={range.to}
                  onChange={(r) => {
                    setRange(r);
                    resetPage();
                  }}
                />
              </>
            }
          />
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full overflow-y-auto sm:max-w-lg">
          {selectedEntry && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 font-mono text-xs"
                  >
                    #{selectedEntry.id}
                  </Badge>
                  <SourceBadge referenceType={selectedEntry.referenceType} />
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {selectedEntry.description ||
                    t('admin.accounting.journal.voucherNo', 'Voucher #{id}', { id: selectedEntry.id })}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  {t('admin.accounting.journal.postedOn', 'Posted on {date}', { date: selectedEntry.date })}
                  {selectedEntry.referenceType &&
                  selectedEntry.referenceType !== 'manual' &&
                  selectedEntry.referenceId
                    ? ` · ${t('admin.accounting.journal.reference', 'reference #{id}', { id: selectedEntry.referenceId })}`
                    : ''}
                </SheetDescription>
              </SheetHeader>

              <Card className="border-border/70 bg-muted/20 overflow-hidden border p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-border/60 border-b">
                      <TableHead className="text-xs font-semibold">{t('admin.accounting.journal.colAccount', 'Account')}</TableHead>
                      <TableHead className="text-right text-xs font-semibold">{t('admin.accounting.journal.debit', 'Debit')}</TableHead>
                      <TableHead className="text-right text-xs font-semibold">{t('admin.accounting.journal.credit', 'Credit')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-border/40 divide-y">
                    {selectedEntry.lines.map((l, i) => (
                      <TableRow key={`${l.accountId}-${i}`}>
                        <TableCell className="text-xs">
                          <span className="text-primary mr-1.5 font-mono font-bold">
                            {l.accountCode}
                          </span>
                          {l.accountName}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-400 tabular-nums">
                          {l.debit ? money(l.debit) : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-blue-400 tabular-nums">
                          {l.credit ? money(l.credit) : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-bold">
                      <TableCell className="text-xs">{t('admin.accounting.journal.total', 'Total')}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {money(selectedEntry.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {money(selectedEntry.totalCredit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-border hover:bg-accent text-xs"
                  onClick={() => setSelectedEntry(null)}
                >
                  {t('common.close', 'Close')}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {isNewModalOpen && <NewJournalVoucherDialog onClose={() => setIsNewModalOpen(false)} />}
    </div>
  );
}
