'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { downloadCsv, fetchAllPages, todayYmd } from '../table-utils';
import { invalidateGeneralLedger } from '../query-keys';
import { ymd } from '../format';

/** Incomes and expenses share one backend shape; only paths and the category key differ. */
export type LedgerKind = 'income' | 'expense';
export type LedgerStatus = 'pending' | 'approved' | 'rejected';
export type LedgerStatusFilter = LedgerStatus | 'all';

export const LEDGER_CONFIG = {
  income: { path: 'incomes', categoryPath: 'income-categories', categoryField: 'income_category' },
  expense: { path: 'expenses', categoryPath: 'expense-types', categoryField: 'expense_head' },
} as const satisfies Record<
  LedgerKind,
  { path: string; categoryPath: string; categoryField: string }
>;

export interface LedgerEntry {
  id: string;
  name: string;
  category: string;
  employeeId: string;
  employeeName: string;
  invoiceNo: string;
  date: string;
  amount: number;
  bankAccount: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface LedgerSummary {
  count: number;
  totalAmount: number;
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
  rejected: { count: number; amount: number };
}

export interface LedgerCategory {
  id: string;
  name: string;
  status: string;
}

export interface EntryOptions {
  employees: Array<{ id: string; name: string }>;
  bankAccounts: string[];
}

export interface LedgerFilters {
  search: string;
  status: LedgerStatusFilter;
  /** Category name; '' = all */
  category: string;
  fromDate: string;
  toDate: string;
}

/** Body of POST/PUT (category is sent under the kind's own key). */
export interface LedgerEntryInput {
  name: string;
  category: string;
  employee: string;
  date: string;
  amount: number;
  bank_account: string;
  invoice_no?: string;
  description?: string;
}

type Row = Record<string, unknown>;

function mapEntry(kind: LedgerKind, r: Row): LedgerEntry {
  return {
    id: str(r.id),
    name: str(r.name),
    category: str(r[LEDGER_CONFIG[kind].categoryField]),
    employeeId: str(r.employee),
    employeeName: str(r.employee_name),
    invoiceNo: str(r.invoice_no),
    date: ymd(str(r.date)),
    amount: num(r.amount),
    bankAccount: str(r.bank_account),
    description: str(r.description),
    status: str(r.status),
    createdAt: str(r.created_at),
  };
}

function mapBucket(v: unknown) {
  const b = (v ?? {}) as Row;
  return { count: num(b.count), amount: num(b.amount) };
}

function mapSummary(r: Row): LedgerSummary {
  return {
    count: num(r.count),
    totalAmount: num(r.total_amount),
    pending: mapBucket(r.pending),
    approved: mapBucket(r.approved),
    rejected: mapBucket(r.rejected),
  };
}

function filterParams(f: LedgerFilters): Record<string, unknown> {
  return {
    search: f.search || undefined,
    status: f.status === 'all' ? undefined : f.status,
    category: f.category || undefined,
    from_date: f.fromDate || undefined,
    to_date: f.toDate || undefined,
  };
}

const ledgerRoot = (kind: LedgerKind) => ['admin', 'accounting', LEDGER_CONFIG[kind].path] as const;
const categoriesKey = (kind: LedgerKind) =>
  ['admin', 'accounting', LEDGER_CONFIG[kind].categoryPath] as const;

export function useLedgerEntries(
  kind: LedgerKind,
  filters: LedgerFilters,
  page: number,
  pageSize: number,
) {
  return useQuery({
    queryKey: [...ledgerRoot(kind), 'list', { ...filters, page, pageSize }],
    queryFn: async () => {
      const res = await http.getPage<Row>(`/v1/accounting/${LEDGER_CONFIG[kind].path}`, {
        ...filterParams(filters),
        page,
        per_page: pageSize,
      });
      return { items: res.items.map((r) => mapEntry(kind, r)), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useLedgerSummary(kind: LedgerKind, filters: LedgerFilters) {
  return useQuery({
    queryKey: [...ledgerRoot(kind), 'summary', filters],
    queryFn: async () =>
      mapSummary(
        await http.get<Row>(
          `/v1/accounting/${LEDGER_CONFIG[kind].path}/summary`,
          filterParams(filters),
        ),
      ),
    placeholderData: keepPreviousData,
  });
}

export function useLedgerCategories(kind: LedgerKind) {
  return useQuery({
    queryKey: categoriesKey(kind),
    queryFn: async () => {
      const res = await http.getPage<Row>(`/v1/accounting/${LEDGER_CONFIG[kind].categoryPath}`);
      return res.items.map((r): LedgerCategory => ({
        id: str(r.id),
        name: str(r.name),
        status: str(r.status),
      }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useEntryOptions(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'accounting', 'entry-options'],
    queryFn: async (): Promise<EntryOptions> => {
      const d = (await http.get<Row>('/v1/accounting/entry-options')) ?? {};
      const employees = Array.isArray(d.employees) ? (d.employees as Row[]) : [];
      const banks = Array.isArray(d.bank_accounts) ? (d.bank_accounts as unknown[]) : [];
      return {
        employees: employees.map((e) => ({ id: str(e.id), name: str(e.name) })),
        bankAccounts: banks.map((b) => str(b)).filter(Boolean),
      };
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Create (no id) or update (PUT, partial) an entry. Caller maps field errors via `onError`. */
export function useSaveLedgerEntry(kind: LedgerKind, onError: (error: ApiError) => void) {
  const queryClient = useQueryClient();
  const cfg = LEDGER_CONFIG[kind];
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: LedgerEntryInput }) => {
      const { category, ...rest } = input;
      const body = { ...rest, [cfg.categoryField]: category };
      return id
        ? http.put<Row>(`/v1/accounting/${cfg.path}/${id}`, body)
        : http.post<Row>(`/v1/accounting/${cfg.path}`, body);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ledgerRoot(kind) }),
    onError,
  });
}

export type LedgerAction = 'approve' | 'reject' | 'delete';

/** Approve / reject / delete. Approving posts to the GL, so GL-derived queries are refreshed too. */
export function useLedgerAction(kind: LedgerKind) {
  const queryClient = useQueryClient();
  const { path } = LEDGER_CONFIG[kind];
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: LedgerAction }) =>
      action === 'delete'
        ? http.delete<Row>(`/v1/accounting/${path}/${id}`)
        : http.post<Row>(`/v1/accounting/${path}/${id}/${action}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ledgerRoot(kind) });
      invalidateGeneralLedger(queryClient);
    },
  });
}

/** Category add / rename / delete. Errors (e.g. 409 "in use") are handled by the caller. */
export function useCategoryMutation(kind: LedgerKind, onError: (error: ApiError) => void) {
  const queryClient = useQueryClient();
  const base = `/v1/accounting/${LEDGER_CONFIG[kind].categoryPath}`;
  return useMutation({
    mutationFn: (
      op:
        | { type: 'create'; name: string }
        | { type: 'rename'; id: string; name: string }
        | { type: 'delete'; id: string },
    ) =>
      op.type === 'create'
        ? http.post<Row>(base, { name: op.name })
        : op.type === 'rename'
          ? http.put<Row>(`${base}/${op.id}`, { name: op.name })
          : http.delete<Row>(`${base}/${op.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKey(kind) });
      void queryClient.invalidateQueries({ queryKey: ledgerRoot(kind) });
    },
    onError,
  });
}

/** User-triggered CSV export of every entry matching the filters. */
export function useExportLedger(kind: LedgerKind) {
  return useMutation({
    mutationFn: async (filters: LedgerFilters) => {
      const rows = await fetchAllPages<Row>(
        `/v1/accounting/${LEDGER_CONFIG[kind].path}`,
        filterParams(filters),
      );
      const entries = rows.map((r) => mapEntry(kind, r));
      downloadCsv(
        `${LEDGER_CONFIG[kind].path}_${todayYmd()}.csv`,
        [
          'ID',
          'Date',
          'Name',
          'Category',
          'Employee',
          'Bank account',
          'Invoice no',
          'Amount (BDT)',
          'Status',
          'Description',
        ],
        entries.map((e) => [
          e.id,
          e.date,
          e.name,
          e.category,
          e.employeeName,
          e.bankAccount,
          e.invoiceNo,
          e.amount,
          e.status,
          e.description,
        ]),
      );
      return entries.length;
    },
  });
}
