'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http, saveBlob } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { useTranslations } from '@/i18n/locale-context';
import { cleanParams, getPagedWithSummary } from '../api/paged';
import { mapCustomerOption, mapLedgerSummary, mapPaymentRow, mapReceipt } from '../lib/mappers';
import type { CustomerOption, LedgerFilters, PaymentReceipt } from '../types';

export const customerPaymentKeys = {
  all: ['admin', 'customer-payments'] as const,
  ledger: (f: LedgerFilters) => ['admin', 'customer-payments', 'ledger', f] as const,
  receipt: (id: string) => ['admin', 'customer-payments', 'receipt', id] as const,
  lookup: (q: string) => ['admin', 'customer-payments', 'lookup', q] as const,
};

function ledgerParams(f: Omit<LedgerFilters, 'page' | 'pageSize'>) {
  return {
    search: f.search,
    status: f.status,
    method: f.method,
    fromDate: f.from,
    toDate: f.to,
  };
}

/** GET /v1/reseller/customer-payments/{rid} — one server page + whole-set summary. */
export function useCustomerPayments(filters: LedgerFilters) {
  return useQuery({
    queryKey: customerPaymentKeys.ledger(filters),
    queryFn: async ({ signal }) => {
      const res = await getPagedWithSummary(
        `/v1/reseller/customer-payments/${getResellerId()}`,
        { page: filters.page, per_page: filters.pageSize, ...ledgerParams(filters) },
        signal,
      );
      return { items: res.items.map(mapPaymentRow), meta: res.meta, summary: mapLedgerSummary(res.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/reseller/billing/payments/{id}/receipt */
export function usePaymentReceipt(id: string | null | undefined) {
  return useQuery<PaymentReceipt>({
    queryKey: customerPaymentKeys.receipt(String(id ?? '')),
    queryFn: async () => mapReceipt(await http.get<Record<string, unknown>>(`/v1/reseller/billing/payments/${id}/receipt`)),
    enabled: Boolean(id),
  });
}

/** Server-side customer search for the payment form (GET /v1/reseller/billing/customer-lookup). */
export function useCustomerLookup(search: string) {
  return useQuery<CustomerOption[]>({
    queryKey: customerPaymentKeys.lookup(search),
    queryFn: async ({ signal }) => {
      const rows = await http.get<Record<string, unknown>[]>('/v1/reseller/billing/customer-lookup', { search, limit: 20 }, signal);
      return (Array.isArray(rows) ? rows : []).map(mapCustomerOption);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export interface RecordPaymentInput {
  customerId: string;
  amountBdt: number;
  billingMonth: string;
  status: 'successful' | 'pending' | 'failed';
  method: string;
  trxId?: string;
  note?: string;
}

/** POST /v1/reseller/customer-payments/{rid} — backend contract: customer, amount, month, status, paid_via. */
export function useCreateCustomerPayment() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordPaymentInput) => {
      const body: Record<string, unknown> = {
        customer: Number(input.customerId),
        amount: input.amountBdt,
        month: input.billingMonth,
        status: input.status,
        paid_via: input.method,
      };
      if (input.trxId?.trim()) body.method_trx = input.trxId.trim();
      if (input.note?.trim()) body.comment = input.note.trim();
      return http.post<{ id: number; invoice: string; message?: string }>(`/v1/reseller/customer-payments/${getResellerId()}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerPaymentKeys.all });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success(t('admin.customerPayments.toast.recorded', 'Payment recorded'));
    },
  });
}

/** PUT /v1/reseller/customer-payments/{rid}/{id} — e.g. settle a pending invoice. */
export function useUpdatePaymentStatus() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; amountBdt: number; billingMonth: string; status: 'successful' | 'pending' | 'failed'; method: string; trxId?: string }) =>
      http.put(`/v1/reseller/customer-payments/${getResellerId()}/${input.id}`, {
        amount: input.amountBdt,
        month: input.billingMonth,
        status: input.status,
        paid_via: input.method,
        method_trx: input.trxId || undefined,
      }),
    onSuccess: (_d, input) => {
      qc.invalidateQueries({ queryKey: customerPaymentKeys.all });
      qc.invalidateQueries({ queryKey: customerPaymentKeys.receipt(input.id) });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success(
        input.status === 'successful'
          ? t('admin.customerPayments.toast.markedPaid', 'Invoice marked as paid')
          : t('admin.customerPayments.toast.invoiceUpdated', 'Invoice updated'),
      );
    },
  });
}

/** Sends the receipt text to the customer through the tenant's SMS gateway (POST /v1/reseller/sms/{rid}/send). */
export function useSendPaymentSms() {
  const t = useTranslations();
  return useMutation({
    mutationFn: async (input: { customerId: string; content: string }) =>
      http.post<{ sent?: number; failed?: number }>(`/v1/reseller/sms/${getResellerId()}/send`, {
        content: input.content,
        send_to: [Number(input.customerId)],
      }),
    onSuccess: () => toast.success(t('admin.customerPayments.toast.smsSent', 'SMS sent to the customer')),
  });
}

/** Whole filtered ledger as CSV (GET /v1/reseller/reports/export?type=payments). */
export async function downloadLedgerCsv(filters: Omit<LedgerFilters, 'page' | 'pageSize'>) {
  const p = ledgerParams(filters);
  const { blob, filename } = await http.download(
    '/v1/reseller/reports/export',
    cleanParams({ type: 'payments', search: p.search, status: p.status, method: p.method, from: p.fromDate, to: p.toDate }),
  );
  saveBlob(blob, filename ?? 'customer_payments.csv');
}
