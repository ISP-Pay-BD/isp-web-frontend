'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { accountingKeys, invalidateGeneralLedger } from '../../shared/query-keys';
import { downloadCsv, fetchAllPages, todayYmd } from '../../shared/table-utils';
import { humanize, ymd } from '../../shared/format';

export type JournalSource = 'all' | 'manual' | 'system';

export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
}

export interface JournalEntryItem {
  id: string;
  date: string;
  description: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface JournalSummary {
  count: number;
  manualCount: number;
  systemCount: number;
  totalDebit: number;
  totalCredit: number;
}

export interface JournalFilters {
  search: string;
  fromDate: string;
  toDate: string;
  source: JournalSource;
  accountId: string;
}

export interface NewJournalEntryInput {
  entry_date: string;
  description: string;
  lines: Array<{ account_id: number; debit: number; credit: number }>;
}

type Row = Record<string, unknown>;

function mapLine(r: Row): JournalLine {
  return {
    accountId: str(r.account_id),
    accountCode: str(r.account_code),
    accountName: str(r.account_name),
    accountType: str(r.account_type),
    debit: num(r.debit),
    credit: num(r.credit),
  };
}

function mapEntry(r: Row): JournalEntryItem {
  return {
    id: str(r.id),
    date: ymd(str(r.entry_date)),
    description: str(r.description),
    referenceType: str(r.reference_type),
    referenceId: str(r.reference_id),
    createdAt: str(r.created_at),
    lines: Array.isArray(r.lines) ? (r.lines as Row[]).map(mapLine) : [],
    totalDebit: num(r.total_debit),
    totalCredit: num(r.total_credit),
  };
}

/** "Manual" for hand-posted vouchers, otherwise "Auto · <origin>". */
export function sourceLabel(referenceType: string): string {
  if (!referenceType || referenceType === 'manual') return 'Manual';
  return `Auto · ${humanize(referenceType)}`;
}

function filterParams(f: JournalFilters): Record<string, unknown> {
  return {
    search: f.search || undefined,
    from_date: f.fromDate || undefined,
    to_date: f.toDate || undefined,
    source: f.source === 'all' ? undefined : f.source,
    account_id: f.accountId || undefined,
  };
}

export function useJournalEntries(filters: JournalFilters, page: number, pageSize: number) {
  const query = useQuery({
    queryKey: [...accountingKeys.journalEntries, 'list', { ...filters, page, pageSize }],
    queryFn: async () => {
      const res = await http.getPage<Row>('/v1/accounting/journal-entries', {
        ...filterParams(filters),
        page,
        per_page: pageSize,
      });
      return { items: res.items.map(mapEntry), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
  return { ...query, entries: query.data?.items ?? [], total: query.data?.meta.total ?? 0 };
}

export function useJournalSummary(filters: JournalFilters) {
  return useQuery({
    queryKey: [...accountingKeys.journalEntries, 'summary', filters],
    queryFn: async (): Promise<JournalSummary> => {
      const r = await http.get<Row>(
        '/v1/accounting/journal-entries/summary',
        filterParams(filters),
      );
      return {
        count: num(r?.count),
        manualCount: num(r?.manual_count),
        systemCount: num(r?.system_count),
        totalDebit: num(r?.total_debit),
        totalCredit: num(r?.total_credit),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** POST a balanced multi-line voucher; caller maps 422 details (`lines.N.account_id` …) via `onError`. */
export function useCreateJournalEntry(onError: (error: ApiError) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewJournalEntryInput) =>
      http.post<Row>('/v1/accounting/journal-entries', input),
    onSuccess: () => invalidateGeneralLedger(queryClient),
    onError,
  });
}

/** User-triggered CSV export (one row per journal line) of every entry matching the filters. */
export function useExportJournal() {
  return useMutation({
    mutationFn: async (filters: JournalFilters) => {
      const entries = (
        await fetchAllPages<Row>('/v1/accounting/journal-entries', filterParams(filters))
      ).map(mapEntry);
      downloadCsv(
        `journal_entries_${todayYmd()}.csv`,
        [
          'Entry ID',
          'Date',
          'Description',
          'Source',
          'Account code',
          'Account',
          'Debit (BDT)',
          'Credit (BDT)',
        ],
        entries.flatMap((e) =>
          e.lines.map((l) => [
            e.id,
            e.date,
            e.description,
            sourceLabel(e.referenceType),
            l.accountCode,
            l.accountName,
            l.debit,
            l.credit,
          ]),
        ),
      );
      return entries.length;
    },
  });
}
