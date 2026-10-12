'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  sourceLabel,
  useExportJournal,
  useJournalEntries,
  useJournalSummary,
  type JournalEntryItem,
  type JournalFilters,
  type JournalSource,
} from '../hooks/use-journal-entries';
import { NewJournalVoucherDialog } from '../components/NewJournalVoucherDialog';
import { PageSkeleton, EmptyState, Can, TablePagination } from '@/components/shared';
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
import { useServerTable } from '../../shared/table-utils';
import { DateRangeInputs, DebouncedSearchInput, KpiCard } from '../../shared/components';
import { money } from '../../shared/format';

const SOURCE_TABS: Array<{ value: JournalSource; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'manual', label: 'Manual' },
  { value: 'system', label: 'Auto-posted' },
];

function SourceBadge({ referenceType }: { referenceType: string }) {
  const manual = !referenceType || referenceType === 'manual';
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-medium whitespace-nowrap',
        manual
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'border-blue-500/20 bg-blue-500/10 text-blue-400',
      )}
    >
      {sourceLabel(referenceType)}
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
  const router = useRouter();
  const pathname = usePathname();
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
    router.replace(pathname);
  };

  if (list.isPending) return <PageSkeleton variant="table" rows={8} />;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="General Journal & Double-Entry Vouchers"
        subtitle="Every posted debit-credit voucher: manual journals and entries posted automatically from approved incomes, expenses and payments."
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Accounting' },
          { label: 'Journal Entries' },
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
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportCsv.isPending}
              onClick={() =>
                exportCsv.mutate(filters, {
                  onSuccess: (n) =>
                    toast.success(
                      n ? `Exported ${n} journal entries` : 'No journal entries to export',
                    ),
                })
              }
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              {exportCsv.isPending ? 'Exporting…' : 'Export Journal'}
            </Button>
            <Can menu="accounting" action="create">
              <Button
                size="sm"
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-xs font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Journal Voucher
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Ribbon — /journal-entries/summary with the list's filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Vouchers"
          value={s ? s.count.toLocaleString() : '—'}
          hint={summary.isError ? 'Totals unavailable' : 'Journal entries in this view'}
          icon={FileText}
          tone="purple"
        />
        <KpiCard
          label="Manual Vouchers"
          value={s ? s.manualCount.toLocaleString() : '—'}
          hint="Posted by hand"
          icon={PenLine}
          tone="emerald"
        />
        <KpiCard
          label="Auto-posted"
          value={s ? s.systemCount.toLocaleString() : '—'}
          hint="Posted automatically by the system"
          icon={Cpu}
          tone="blue"
        />
        <KpiCard
          label="Total Debit / Credit"
          value={s ? money(s.totalDebit) : '—'}
          hint={
            s
              ? s.totalDebit === s.totalCredit
                ? 'Debits equal credits'
                : `Credits ${money(s.totalCredit)}`
              : undefined
          }
          icon={ArrowRightLeft}
          tone="amber"
        />
      </div>

      {/* Filter Bar */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <DebouncedSearchInput
          onSearchChange={onSearchChange}
          placeholder="Search by voucher ID or description..."
        />
        <div className="flex flex-wrap items-center gap-2">
          {accountId && (
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 h-9 gap-1.5 px-3 text-xs"
            >
              Account:{' '}
              {filteredAccount
                ? `${filteredAccount.accountCode} — ${filteredAccount.accountName}`
                : `#${accountId}`}
              <button
                type="button"
                aria-label="Clear account filter"
                onClick={clearAccount}
                className="hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          )}
          <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
            {SOURCE_TABS.map((t) => (
              <Button
                key={t.value}
                type="button"
                size="sm"
                variant={source === t.value ? 'default' : 'ghost'}
                onClick={() => {
                  setSource(t.value);
                  resetPage();
                }}
                className="h-7 px-2.5 text-xs"
              >
                {t.label}
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
        </div>
      </div>

      {/* Journal Table */}
      {list.isError ? (
        <EmptyState
          title="Failed to load journal entries"
          description={list.error.message}
          actionLabel="Retry"
          onAction={() => list.refetch()}
        />
      ) : list.entries.length === 0 ? (
        <EmptyState
          title="No journal entries found"
          description={
            search || source !== 'all' || range.from || range.to || accountId
              ? 'No vouchers match the current filters.'
              : 'Posted vouchers will appear here.'
          }
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
                  <TableHead className="text-xs font-semibold">Entry ID</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Voucher Description</TableHead>
                  <TableHead className="text-xs font-semibold">Source</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Debit (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Credit (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border/40 divide-y">
                {list.entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-muted/30 group cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <TableCell className="py-3">
                      <span className="bg-primary/10 border-primary/20 text-primary rounded-md border px-2 py-1 font-mono text-xs font-bold">
                        #{entry.id}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        {entry.date}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-foreground group-hover:text-primary text-xs font-medium transition-colors">
                        {entry.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <SourceBadge referenceType={entry.referenceType} />
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-xs font-bold text-emerald-400 tabular-nums">
                      {money(entry.totalDebit)}
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-xs font-bold text-blue-400 tabular-nums">
                      {money(entry.totalCredit)}
                    </TableCell>
                    <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-7 w-7"
                        aria-label={`View entry ${entry.id}`}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={list.total}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
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
                    className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]"
                  >
                    #{selectedEntry.id}
                  </Badge>
                  <SourceBadge referenceType={selectedEntry.referenceType} />
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {selectedEntry.description || `Voucher #${selectedEntry.id}`}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  Posted on {selectedEntry.date}
                  {selectedEntry.referenceType &&
                  selectedEntry.referenceType !== 'manual' &&
                  selectedEntry.referenceId
                    ? ` · reference #${selectedEntry.referenceId}`
                    : ''}
                </SheetDescription>
              </SheetHeader>

              <Card className="border-border/70 bg-muted/20 overflow-hidden border p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-border/60 border-b">
                      <TableHead className="text-[11px] font-semibold">Account</TableHead>
                      <TableHead className="text-right text-[11px] font-semibold">Debit</TableHead>
                      <TableHead className="text-right text-[11px] font-semibold">Credit</TableHead>
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
                      <TableCell className="text-xs">Total</TableCell>
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
                  Close
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
