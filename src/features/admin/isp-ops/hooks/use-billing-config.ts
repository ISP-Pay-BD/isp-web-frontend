'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import type { PageMeta } from '@/lib/api/types';
import { formatDate, formatDateTime } from '@/lib/format';

/**
 * Admin billing configuration (zapi `api/v1/reseller/billing-config/*`):
 * billing policy, VAT settings, proration calculator, security deposits,
 * credit notes, contracts and the collections map. The tenant comes from
 * the JWT server-side, so no reseller id is ever sent.
 */
const BASE = '/v1/reseller/billing-config';

type Raw = Record<string, unknown>;

export const billingConfigKeys = {
  all: ['admin', 'billing-config'] as const,
  policy: ['admin', 'billing-config', 'policy'] as const,
  policyPreview: ['admin', 'billing-config', 'policy-preview'] as const,
  policyCharges: ['admin', 'billing-config', 'policy-charges'] as const,
  tax: ['admin', 'billing-config', 'tax'] as const,
  proration: ['admin', 'billing-config', 'proration'] as const,
  customerOptions: ['admin', 'billing-config', 'customer-options'] as const,
  packageOptions: ['admin', 'billing-config', 'package-options'] as const,
  deposits: ['admin', 'billing-config', 'deposits'] as const,
  credits: ['admin', 'billing-config', 'credits'] as const,
  contracts: ['admin', 'billing-config', 'contracts'] as const,
  collections: ['admin', 'billing-config', 'collections-map'] as const,
};

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
}

export interface ListParams {
  page: number;
  perPage: number;
  search: string;
}

const listQuery = (p: ListParams, extra: Raw = {}) => ({
  page: p.page,
  per_page: p.perPage,
  search: p.search || undefined,
  ...extra,
});

const strOrNull = (v: unknown): string | null => {
  const s = str(v);
  return s === '' ? null : s;
};

/** Local calendar date (YYYY-MM-DD) — not UTC, so it is right just after midnight. */
export function todayYmd(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Backend "Y-m-d H:i:s" / "Y-m-d" → display. Safari cannot parse the space
 * form; a bare date is read at local noon so no timezone shifts its day.
 */
export function fmtDay(value: string | null | undefined): string {
  return value ? formatDate(value.length > 10 ? value.replace(' ', 'T') : `${value}T12:00:00`) : '—';
}

export function fmtStamp(value: string | null | undefined): string {
  return value ? formatDateTime(value.replace(' ', 'T')) : '—';
}

export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Shared pickers
// ---------------------------------------------------------------------------

export interface BillingCustomerOption {
  id: number;
  name: string;
  mobile: string;
  pppoeId: string | null;
  packageId: number;
  willExpire: string | null;
}

export interface BillingPackageOption {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

export function useBillingCustomerOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: [...billingConfigKeys.customerOptions, search],
    queryFn: async (): Promise<BillingCustomerOption[]> => {
      const rows = await http.get<Raw[]>(`${BASE}/customer-options`, { search: search || undefined });
      return (rows ?? []).map((r) => ({
        id: num(r.id),
        name: str(r.name),
        mobile: str(r.mobile),
        pppoeId: strOrNull(r.pppoe_id),
        packageId: num(r.package_id),
        willExpire: strOrNull(r.will_expire),
      }));
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBillingPackageOptions() {
  return useQuery({
    queryKey: billingConfigKeys.packageOptions,
    queryFn: async (): Promise<BillingPackageOption[]> => {
      const rows = await http.get<Raw[]>(`${BASE}/package-options`);
      return (rows ?? []).map((r) => ({ id: num(r.id), name: str(r.name), price: num(r.price), active: Boolean(r.active) }));
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Billing policy
// ---------------------------------------------------------------------------

export interface BillingPolicy {
  configured: boolean;
  billingCycleDay: number;
  graceDays: number;
  autoSuspend: boolean;
  autoSuspendDays: number;
  lateFeeAmount: number;
  lateFeePercent: number;
  reconnectionFee: number;
  updatedAt: string | null;
  updatedByName: string | null;
  stats: { customersTotal: number; expired: number; inGrace: number; pastGrace: number; asOf: string | null };
}

export type BillingPolicyInput = Omit<BillingPolicy, 'configured' | 'updatedAt' | 'updatedByName' | 'stats'>;

function mapPolicy(r: Raw): BillingPolicy {
  const s = (r.stats ?? {}) as Raw;
  return {
    configured: Boolean(r.configured),
    billingCycleDay: num(r.billing_cycle_day),
    graceDays: num(r.grace_days),
    autoSuspend: Boolean(r.auto_suspend),
    autoSuspendDays: num(r.auto_suspend_days),
    lateFeeAmount: num(r.late_fee_amount),
    lateFeePercent: num(r.late_fee_percent),
    reconnectionFee: num(r.reconnection_fee),
    updatedAt: strOrNull(r.updated_at),
    updatedByName: strOrNull(r.updated_by_name),
    stats: {
      customersTotal: num(s.customers_total),
      expired: num(s.expired),
      inGrace: num(s.in_grace),
      pastGrace: num(s.past_grace),
      asOf: strOrNull(s.as_of),
    },
  };
}

export function useBillingPolicy() {
  return useQuery({
    queryKey: billingConfigKeys.policy,
    queryFn: async () => mapPolicy(await http.get<Raw>(`${BASE}/policies`)),
  });
}

export function useSaveBillingPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: Partial<BillingPolicyInput>) =>
      mapPolicy(
        await http.put<Raw>(`${BASE}/policies`, {
          billing_cycle_day: v.billingCycleDay,
          grace_days: v.graceDays,
          auto_suspend: v.autoSuspend,
          auto_suspend_days: v.autoSuspendDays,
          late_fee_amount: v.lateFeeAmount,
          late_fee_percent: v.lateFeePercent,
          reconnection_fee: v.reconnectionFee,
        }),
      ),
    onSuccess: (policy) => {
      qc.setQueryData(billingConfigKeys.policy, policy);
      qc.invalidateQueries({ queryKey: billingConfigKeys.policyPreview });
    },
  });
}

// ---------------------------------------------------------------------------
// Policy enforcement: dry-run preview + the charges the cron raises
// ---------------------------------------------------------------------------

export interface PolicyPreviewCustomer {
  userId: number;
  name: string;
  mobile: string;
  willExpire: string | null;
  daysOverdue: number | null;
  period: string | null;
  amount: number | null;
}

export interface PolicyPreviewSection {
  enabled: boolean;
  count: number;
  amount: number;
  sample: PolicyPreviewCustomer[];
}

export interface PolicyPreview {
  configured: boolean;
  asOf: string | null;
  windowDays: number;
  grace: PolicyPreviewSection & { days: number };
  autoSuspend: PolicyPreviewSection & { days: number };
  lateFee: PolicyPreviewSection;
  reconnectionFee: PolicyPreviewSection & { fee: number; awaiting: number };
  charges: { pendingCount: number; pendingAmount: number; waivedCount: number; waivedAmount: number };
}

function mapPreviewSection(x: unknown): PolicyPreviewSection {
  const s = (x ?? {}) as Raw;
  return {
    enabled: Boolean(s.enabled),
    count: num(s.count),
    amount: num(s.amount),
    sample: (Array.isArray(s.sample) ? (s.sample as Raw[]) : []).map((r) => ({
      userId: num(r.user_id),
      name: str(r.name),
      mobile: str(r.mobile),
      willExpire: strOrNull(r.will_expire),
      daysOverdue: r.days_overdue == null ? null : num(r.days_overdue),
      period: strOrNull(r.period),
      amount: r.amount == null ? null : num(r.amount),
    })),
  };
}

/** What the saved policy does right now — a server-side dry run (writes nothing). */
export function useBillingPolicyPreview() {
  return useQuery({
    queryKey: billingConfigKeys.policyPreview,
    queryFn: async (): Promise<PolicyPreview> => {
      const r = await http.get<Raw>(`${BASE}/policies/preview`);
      const sec = (k: string) => (r[k] ?? {}) as Raw;
      const c = sec('charges');
      return {
        configured: Boolean(r.configured),
        asOf: strOrNull(r.as_of),
        windowDays: num(r.window_days),
        grace: { ...mapPreviewSection(r.grace), days: num(sec('grace').days) },
        autoSuspend: { ...mapPreviewSection(r.auto_suspend), days: num(sec('auto_suspend').days) },
        lateFee: mapPreviewSection(r.late_fee),
        reconnectionFee: {
          ...mapPreviewSection(r.reconnection_fee),
          fee: num(sec('reconnection_fee').fee),
          awaiting: num(sec('reconnection_fee').awaiting),
        },
        charges: {
          pendingCount: num(c.pending_count),
          pendingAmount: num(c.pending_amount),
          waivedCount: num(c.waived_count),
          waivedAmount: num(c.waived_amount),
        },
      };
    },
    staleTime: 30_000,
  });
}

export type PolicyChargeKind = 'late_fee' | 'reconnection_fee';
export type PolicyChargeStatus = 'pending' | 'waived' | 'paid';

export interface PolicyCharge {
  id: number;
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  kind: PolicyChargeKind;
  period: string;
  amount: number;
  status: PolicyChargeStatus;
  note: string | null;
  waivedByName: string | null;
  waivedAt: string | null;
  createdAt: string | null;
}

function mapPolicyCharge(r: Raw): PolicyCharge {
  const status = str(r.status);
  return {
    id: num(r.id),
    customerId: num(r.customer_id),
    customerName: strOrNull(r.customer_name),
    customerMobile: strOrNull(r.customer_mobile),
    kind: r.kind === 'reconnection_fee' ? 'reconnection_fee' : 'late_fee',
    period: str(r.period),
    amount: num(r.amount),
    status: status === 'waived' || status === 'paid' ? status : 'pending',
    note: strOrNull(r.note),
    waivedByName: strOrNull(r.waived_by_name),
    waivedAt: strOrNull(r.waived_at),
    createdAt: strOrNull(r.created_at),
  };
}

export function usePolicyCharges(p: ListParams & { status: string; kind: string }) {
  return useQuery({
    queryKey: [...billingConfigKeys.policyCharges, p],
    queryFn: async (): Promise<Paged<PolicyCharge>> => {
      const res = await http.getPage<Raw>(
        `${BASE}/policy-charges`,
        listQuery(p, {
          status: p.status !== 'all' ? p.status : undefined,
          kind: p.kind !== 'all' ? p.kind : undefined,
        }),
      );
      return { items: res.items.map(mapPolicyCharge), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useWaivePolicyCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => mapPolicyCharge(await http.post<Raw>(`${BASE}/policy-charges/${id}/waive`, {})),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingConfigKeys.policyCharges });
      qc.invalidateQueries({ queryKey: billingConfigKeys.policyPreview });
    },
  });
}

/** POST …/policy-charges/{id}/mark-paid — record that a pending fee was collected (optionally linked to a payment). */
export function useMarkPolicyChargePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; paymentId?: number; note?: string }) =>
      mapPolicyCharge(
        await http.post<Raw>(`${BASE}/policy-charges/${input.id}/mark-paid`, {
          payment_id: input.paymentId || undefined,
          note: input.note || undefined,
        }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingConfigKeys.policyCharges });
      qc.invalidateQueries({ queryKey: billingConfigKeys.policyPreview });
    },
  });
}

// ---------------------------------------------------------------------------
// VAT / tax
// ---------------------------------------------------------------------------

export type TaxMode = 'inclusive' | 'exclusive';

export interface TaxConfig {
  configured: boolean;
  enabled: boolean;
  label: string;
  ratePercent: number;
  mode: TaxMode;
  binNumber: string | null;
  tinNumber: string | null;
  registrationNumber: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export type TaxConfigInput = Omit<TaxConfig, 'configured' | 'updatedAt' | 'updatedByName'>;

function mapTax(r: Raw): TaxConfig {
  return {
    configured: Boolean(r.configured),
    enabled: Boolean(r.enabled),
    label: str(r.label),
    ratePercent: num(r.rate_percent),
    mode: r.mode === 'inclusive' ? 'inclusive' : 'exclusive',
    binNumber: strOrNull(r.bin_number),
    tinNumber: strOrNull(r.tin_number),
    registrationNumber: strOrNull(r.registration_number),
    updatedAt: strOrNull(r.updated_at),
    updatedByName: strOrNull(r.updated_by_name),
  };
}

/** Tenant VAT config — also usable by invoice/receipt screens. */
export function useTaxConfig() {
  return useQuery({
    queryKey: billingConfigKeys.tax,
    queryFn: async () => mapTax(await http.get<Raw>(`${BASE}/tax`)),
  });
}

export function useSaveTaxConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: TaxConfigInput) =>
      mapTax(
        await http.put<Raw>(`${BASE}/tax`, {
          enabled: v.enabled,
          label: v.label,
          rate_percent: v.ratePercent,
          mode: v.mode,
          bin_number: v.binNumber ?? '',
          tin_number: v.tinNumber ?? '',
          registration_number: v.registrationNumber ?? '',
        }),
      ),
    onSuccess: (tax) => qc.setQueryData(billingConfigKeys.tax, tax),
  });
}

// ---------------------------------------------------------------------------
// Proration (read-only quote)
// ---------------------------------------------------------------------------

export interface ProrationQuote {
  customer: { id: number; name: string; mobile: string; willExpire: string | null };
  currentPackage: { id: number; name: string; price: number };
  targetPackage: { id: number; name: string; price: number };
  changeDate: string;
  cycleDays: number;
  daysRemaining: number;
  expired: boolean;
  credit: number;
  charge: number;
  net: number;
  direction: 'upgrade' | 'downgrade' | 'same_price';
}

export interface ProrationParams {
  customerId: number | null;
  packageId: number | null;
  changeDate: string;
}

export function useProrationQuote(p: ProrationParams) {
  const ready = Boolean(p.customerId && p.packageId && p.changeDate);
  return useQuery({
    queryKey: [...billingConfigKeys.proration, p],
    queryFn: async (): Promise<ProrationQuote> => {
      const r = await http.get<Raw>(`${BASE}/proration`, {
        customer_id: p.customerId,
        package_id: p.packageId,
        change_date: p.changeDate,
      });
      const c = (r.customer ?? {}) as Raw;
      const pkg = (x: unknown) => {
        const o = (x ?? {}) as Raw;
        return { id: num(o.id), name: str(o.name), price: num(o.price) };
      };
      const direction = str(r.direction);
      return {
        customer: { id: num(c.id), name: str(c.name), mobile: str(c.mobile), willExpire: strOrNull(c.will_expire) },
        currentPackage: pkg(r.current_package),
        targetPackage: pkg(r.target_package),
        changeDate: str(r.change_date),
        cycleDays: num(r.cycle_days),
        daysRemaining: num(r.days_remaining),
        expired: Boolean(r.expired),
        credit: num(r.credit),
        charge: num(r.charge),
        net: num(r.net),
        direction: direction === 'upgrade' || direction === 'downgrade' ? direction : 'same_price',
      };
    },
    enabled: ready,
    retry: false,
  });
}

// ---------------------------------------------------------------------------
// Security deposits
// ---------------------------------------------------------------------------

export type DepositStatus = 'held' | 'refunded' | 'adjusted';

export interface Deposit {
  id: number;
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  amount: number;
  method: string;
  receivedAt: string | null;
  status: DepositStatus;
  note: string | null;
  settledAt: string | null;
  createdByName: string | null;
  createdAt: string | null;
}

export interface DepositEvent {
  id: number;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  amount: number;
  note: string | null;
  actorName: string | null;
  createdAt: string | null;
}

export interface DepositSummary {
  totalCount: number;
  heldTotal: number;
  heldCount: number;
  refundedTotal: number;
  refundedCount: number;
  adjustedTotal: number;
  adjustedCount: number;
  methods: string[];
}

export interface DepositInput {
  customerId?: number;
  amount: number;
  method: string;
  receivedAt: string;
  note: string;
}

function mapDeposit(r: Raw): Deposit {
  const status = str(r.status);
  return {
    id: num(r.id),
    customerId: num(r.customer_id),
    customerName: strOrNull(r.customer_name),
    customerMobile: strOrNull(r.customer_mobile),
    amount: num(r.amount),
    method: str(r.method),
    receivedAt: strOrNull(r.received_at),
    status: status === 'refunded' || status === 'adjusted' ? status : 'held',
    note: strOrNull(r.note),
    settledAt: strOrNull(r.settled_at),
    createdByName: strOrNull(r.created_by_name),
    createdAt: strOrNull(r.created_at),
  };
}

export function useDeposits(p: ListParams & { status: string }) {
  return useQuery({
    queryKey: [...billingConfigKeys.deposits, 'list', p],
    queryFn: async (): Promise<Paged<Deposit>> => {
      const res = await http.getPage<Raw>(`${BASE}/deposits`, listQuery(p, { status: p.status !== 'all' ? p.status : undefined }));
      return { items: res.items.map(mapDeposit), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useDepositSummary() {
  return useQuery({
    queryKey: [...billingConfigKeys.deposits, 'summary'],
    queryFn: async (): Promise<DepositSummary> => {
      const r = await http.get<Raw>(`${BASE}/deposits/summary`);
      return {
        totalCount: num(r.total_count),
        heldTotal: num(r.held_total),
        heldCount: num(r.held_count),
        refundedTotal: num(r.refunded_total),
        refundedCount: num(r.refunded_count),
        adjustedTotal: num(r.adjusted_total),
        adjustedCount: num(r.adjusted_count),
        methods: Array.isArray(r.methods) ? r.methods.map((m) => str(m)) : [],
      };
    },
  });
}

export function useDepositDetail(id: number | null) {
  return useQuery({
    queryKey: [...billingConfigKeys.deposits, 'detail', id],
    queryFn: async (): Promise<Deposit & { events: DepositEvent[] }> => {
      const r = await http.get<Raw>(`${BASE}/deposits/${id}`);
      const events = Array.isArray(r.events) ? (r.events as Raw[]) : [];
      return {
        ...mapDeposit(r),
        events: events.map((e) => ({
          id: num(e.id),
          action: str(e.action),
          fromStatus: strOrNull(e.from_status),
          toStatus: strOrNull(e.to_status),
          amount: num(e.amount),
          note: strOrNull(e.note),
          actorName: strOrNull(e.actor_name),
          createdAt: strOrNull(e.created_at),
        })),
      };
    },
    enabled: id !== null,
  });
}

export function useDepositMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: billingConfigKeys.deposits });
  const fields = (v: DepositInput) => ({
    amount: v.amount,
    method: v.method,
    received_at: v.receivedAt,
    note: v.note.trim(),
  });

  const create = useMutation({
    mutationFn: async (v: DepositInput) =>
      mapDeposit(await http.post<Raw>(`${BASE}/deposits`, { customer_id: v.customerId, ...fields(v) })),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...v }: DepositInput & { id: number }) =>
      mapDeposit(await http.put<Raw>(`${BASE}/deposits/${id}`, fields(v))),
    onSuccess: refresh,
  });
  const settle = useMutation({
    mutationFn: async ({ id, action, note }: { id: number; action: 'refund' | 'adjust'; note: string }) =>
      mapDeposit(await http.post<Raw>(`${BASE}/deposits/${id}/${action}`, { note: note.trim() })),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: number) => http.delete<Raw>(`${BASE}/deposits/${id}`),
    onSuccess: refresh,
  });

  return { create, update, settle, remove };
}

// ---------------------------------------------------------------------------
// Credit notes
// ---------------------------------------------------------------------------

export interface CreditNote {
  id: number;
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  amount: number;
  reason: string;
  createdByName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreditBalance {
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  notesCount: number;
  balance: number;
  lastCreditAt: string | null;
}

export interface CreditSummary {
  notesCount: number;
  customersCount: number;
  totalAmount: number;
  monthAmount: number;
  monthCount: number;
  monthStart: string | null;
}

function mapCredit(r: Raw): CreditNote {
  return {
    id: num(r.id),
    customerId: num(r.customer_id),
    customerName: strOrNull(r.customer_name),
    customerMobile: strOrNull(r.customer_mobile),
    amount: num(r.amount),
    reason: str(r.reason),
    createdByName: strOrNull(r.created_by_name),
    createdAt: strOrNull(r.created_at),
    updatedAt: strOrNull(r.updated_at),
  };
}

export function useCreditNotes(p: ListParams & { customerId: number | null }, enabled = true) {
  return useQuery({
    queryKey: [...billingConfigKeys.credits, 'list', p],
    queryFn: async (): Promise<Paged<CreditNote>> => {
      const res = await http.getPage<Raw>(`${BASE}/credits`, listQuery(p, { customer_id: p.customerId ?? undefined }));
      return { items: res.items.map(mapCredit), meta: res.meta };
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreditBalances(p: ListParams, enabled = true) {
  return useQuery({
    queryKey: [...billingConfigKeys.credits, 'balances', p],
    queryFn: async (): Promise<Paged<CreditBalance>> => {
      const res = await http.getPage<Raw>(`${BASE}/credits/balances`, listQuery(p));
      return {
        items: res.items.map((r) => ({
          customerId: num(r.customer_id),
          customerName: strOrNull(r.customer_name),
          customerMobile: strOrNull(r.customer_mobile),
          notesCount: num(r.notes_count),
          balance: num(r.balance),
          lastCreditAt: strOrNull(r.last_credit_at),
        })),
        meta: res.meta,
      };
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreditSummary() {
  return useQuery({
    queryKey: [...billingConfigKeys.credits, 'summary'],
    queryFn: async (): Promise<CreditSummary> => {
      const r = await http.get<Raw>(`${BASE}/credits/summary`);
      return {
        notesCount: num(r.notes_count),
        customersCount: num(r.customers_count),
        totalAmount: num(r.total_amount),
        monthAmount: num(r.month_amount),
        monthCount: num(r.month_count),
        monthStart: strOrNull(r.month_start),
      };
    },
  });
}

export function useCreditMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: billingConfigKeys.credits });

  const create = useMutation({
    mutationFn: async (v: { customerId: number; amount: number; reason: string }) =>
      mapCredit(await http.post<Raw>(`${BASE}/credits`, { customer_id: v.customerId, amount: v.amount, reason: v.reason.trim() })),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: async (v: { id: number; amount: number; reason: string }) =>
      mapCredit(await http.put<Raw>(`${BASE}/credits/${v.id}`, { amount: v.amount, reason: v.reason.trim() })),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: number) => http.delete<Raw>(`${BASE}/credits/${id}`),
    onSuccess: refresh,
  });

  return { create, update, remove };
}

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export type ContractStatus = 'active' | 'expired' | 'terminated';

export interface Contract {
  id: number;
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  title: string;
  startDate: string;
  endDate: string | null;
  daysToEnd: number | null;
  monthlyValue: number;
  slaNotes: string | null;
  status: ContractStatus;
  hasAttachment: boolean;
  attachmentName: string | null;
  attachmentSize: number | null;
  createdByName: string | null;
  createdAt: string | null;
}

export interface ContractSummary {
  total: number;
  active: number;
  expired: number;
  terminated: number;
  expiringSoon: number;
  pastEndDate: number;
  activeMonthlyValue: number;
  expiringWithin: number;
  statuses: ContractStatus[];
}

export interface ContractInput {
  customerId?: number;
  title: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  slaNotes: string;
  status: ContractStatus;
}

function mapContract(r: Raw): Contract {
  const status = str(r.status);
  return {
    id: num(r.id),
    customerId: num(r.customer_id),
    customerName: strOrNull(r.customer_name),
    customerMobile: strOrNull(r.customer_mobile),
    title: str(r.title),
    startDate: str(r.start_date),
    endDate: strOrNull(r.end_date),
    daysToEnd: r.days_to_end === null || r.days_to_end === undefined ? null : num(r.days_to_end),
    monthlyValue: num(r.monthly_value),
    slaNotes: strOrNull(r.sla_notes),
    status: status === 'expired' || status === 'terminated' ? status : 'active',
    hasAttachment: Boolean(r.has_attachment),
    attachmentName: strOrNull(r.attachment_name),
    attachmentSize: r.attachment_size === null || r.attachment_size === undefined ? null : num(r.attachment_size),
    createdByName: strOrNull(r.created_by_name),
    createdAt: strOrNull(r.created_at),
  };
}

export function useContracts(p: ListParams & { status: string; expiringOnly: boolean; expiringWithin: number }) {
  return useQuery({
    queryKey: [...billingConfigKeys.contracts, 'list', p],
    queryFn: async (): Promise<Paged<Contract>> => {
      const res = await http.getPage<Raw>(
        `${BASE}/contracts`,
        listQuery(p, {
          status: p.status !== 'all' ? p.status : undefined,
          expiring_within: p.expiringOnly ? p.expiringWithin : undefined,
        }),
      );
      return { items: res.items.map(mapContract), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useContractSummary() {
  return useQuery({
    queryKey: [...billingConfigKeys.contracts, 'summary'],
    queryFn: async (): Promise<ContractSummary> => {
      const r = await http.get<Raw>(`${BASE}/contracts/summary`);
      return {
        total: num(r.total),
        active: num(r.active),
        expired: num(r.expired),
        terminated: num(r.terminated),
        expiringSoon: num(r.expiring_soon),
        pastEndDate: num(r.past_end_date),
        activeMonthlyValue: num(r.active_monthly_value),
        expiringWithin: num(r.expiring_within),
        statuses: Array.isArray(r.statuses) ? (r.statuses.map((s) => str(s)) as ContractStatus[]) : [],
      };
    },
  });
}

export function useContractMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: billingConfigKeys.contracts });
  const fields = (v: ContractInput) => ({
    title: v.title.trim(),
    start_date: v.startDate,
    end_date: v.endDate,
    monthly_value: v.monthlyValue,
    sla_notes: v.slaNotes.trim(),
    status: v.status,
  });

  /** Create — multipart so an optional attachment goes up in the same request. */
  const create = useMutation({
    mutationFn: async ({ file, ...v }: ContractInput & { file: File | null }) => {
      const form = new FormData();
      form.append('customer_id', String(v.customerId ?? ''));
      for (const [k, val] of Object.entries(fields(v))) form.append(k, String(val));
      if (file) form.append('attachment', file);
      return mapContract(await http.upload<Raw>(`${BASE}/contracts`, form));
    },
    onSuccess: refresh,
  });
  /** Update fields, then replace the attachment when a new file is picked. */
  const update = useMutation({
    mutationFn: async ({ id, file, ...v }: ContractInput & { id: number; file: File | null }) => {
      let saved = mapContract(await http.put<Raw>(`${BASE}/contracts/${id}`, fields(v)));
      if (file) {
        const form = new FormData();
        form.append('attachment', file);
        saved = mapContract(await http.upload<Raw>(`${BASE}/contracts/${id}/attachment`, form));
      }
      return saved;
    },
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: number) => http.delete<Raw>(`${BASE}/contracts/${id}`),
    onSuccess: refresh,
  });
  const download = useMutation({
    mutationFn: (id: number) => http.download(`${BASE}/contracts/${id}/attachment`),
  });

  return { create, update, remove, download };
}

// ---------------------------------------------------------------------------
// Collections map (read-only)
// ---------------------------------------------------------------------------

export interface CollectionRow {
  customerId: number;
  name: string;
  mobile: string;
  latitude: number | null;
  longitude: number | null;
  located: boolean;
  paymentsCount: number;
  collected: number;
  lastPaidAt: string | null;
}

export interface CollectionsSummary {
  from: string;
  to: string;
  collected: number;
  paymentsCount: number;
  customersCount: number;
  locatedCustomers: number;
  unlocatedCustomers: number;
}

function mapCollectionRow(r: Raw): CollectionRow {
  const located = Boolean(r.located) && r.latitude !== null && r.longitude !== null;
  return {
    customerId: num(r.customer_id),
    name: str(r.name),
    mobile: str(r.mobile),
    latitude: located ? num(r.latitude) : null,
    longitude: located ? num(r.longitude) : null,
    located,
    paymentsCount: num(r.payments_count),
    collected: num(r.collected),
    lastPaidAt: strOrNull(r.last_paid_at),
  };
}

export interface CollectionsParams extends ListParams {
  from: string;
  to: string;
  located: 'all' | 'yes' | 'no';
}

export function useCollections(p: CollectionsParams, enabled = true) {
  return useQuery({
    enabled,
    queryKey: [...billingConfigKeys.collections, 'list', p],
    queryFn: async () => {
      const res = await http.getPage<Raw>(
        `${BASE}/collections-map`,
        listQuery(p, { from: p.from, to: p.to, located: p.located !== 'all' ? p.located : undefined }),
      );
      const s = (res.raw.summary ?? {}) as Raw;
      const summary: CollectionsSummary = {
        from: str(s.from),
        to: str(s.to),
        collected: num(s.collected),
        paymentsCount: num(s.payments_count),
        customersCount: num(s.customers_count),
        locatedCustomers: num(s.located_customers),
        unlocatedCustomers: num(s.unlocated_customers),
      };
      return {
        items: res.items.map(mapCollectionRow),
        meta: res.meta,
        summary,
        coordinatesAvailable: res.raw.coordinates_available !== false,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCollectionPoints(p: { from: string; to: string }, enabled = true) {
  return useQuery({
    enabled,
    queryKey: [...billingConfigKeys.collections, 'points', p],
    queryFn: async () => {
      const r = await http.get<Raw>(`${BASE}/collections-map/points`, { from: p.from, to: p.to });
      const items = Array.isArray(r.items) ? (r.items as Raw[]) : [];
      return { items: items.map(mapCollectionRow).filter((x) => x.located), truncated: Boolean(r.truncated) };
    },
    placeholderData: keepPreviousData,
  });
}
