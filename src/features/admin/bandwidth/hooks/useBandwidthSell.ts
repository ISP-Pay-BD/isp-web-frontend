import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  mapDailyBill,
  mapDailyBillTotals,
  mapInvoice,
  mapInvoiceTotals,
  mapSellClient,
  type ActiveStatus,
  type ClientVlan,
} from '../types';
import { bandwidthKeys, compact } from './keys';

/* -------------------------------------------------------------- clients */

export interface ClientListParams {
  page: number;
  pageSize: number;
  search?: string;
  popStatus?: '' | ActiveStatus;
}

/** GET /v1/bandwidth/clients?page=&per_page=&search=&pop_status= */
export function useBandwidthClients({ page, pageSize, search, popStatus }: ClientListParams) {
  const params = compact({ page, per_page: pageSize, search, pop_status: popStatus });
  return useQuery({
    queryKey: bandwidthKeys.clientList(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/bandwidth/clients', params);
      return { items: res.items.map(mapSellClient), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Sell clients for pickers (backend max page size). */
export function useBandwidthClientOptions() {
  return useQuery({
    queryKey: bandwidthKeys.clientOptions,
    queryFn: async () => (await http.getPage<unknown>('/v1/bandwidth/clients', { per_page: 100 })).items.map(mapSellClient),
    staleTime: 5 * 60_000,
  });
}

export interface ClientInput {
  customerName: string;
  customerCode: string;
  contactPerson: string;
  email: string;
  mobileNumber: string;
  phoneNumber: string;
  popStatus: 'Active' | 'Inactive';
  referenceBy: string;
  address: string;
  nttnInfo: string;
  scrId: string;
  activationDate: string;
  popName: string;
  username: string;
  password: string;
  confirmPassword: string;
  ips: string;
  vlans: ClientVlan[];
}

function clientBody(v: ClientInput) {
  const vlans = v.vlans.filter((x) => x.name.trim() || x.ip.trim());
  const body: Record<string, unknown> = {
    customer_name: v.customerName.trim(),
    customer_code: v.customerCode.trim(),
    contact_person: v.contactPerson.trim(),
    email: v.email.trim(),
    mobile_number: v.mobileNumber.trim(),
    phone_number: v.phoneNumber.trim(),
    pop_status: v.popStatus,
    reference_by: v.referenceBy.trim(),
    address: v.address.trim(),
    nttn_info: v.nttnInfo.trim(),
    scr_id: v.scrId.trim(),
    activation_date: v.activationDate,
    pop_name: v.popName.trim(),
    username: v.username.trim(),
    ip_address: v.ips.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean),
    vlan_name: vlans.map((x) => x.name.trim()),
    vlan_ip: vlans.map((x) => x.ip.trim()),
  };
  // An empty date would be written as '' on update; leave the stored one alone.
  if (!v.activationDate) delete body.activation_date;
  // Update keeps the stored password when none is sent.
  if (v.password) {
    body.password = v.password;
    body.confirm_password = v.confirmPassword;
  }
  return body;
}

function useClientInvalidation() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: bandwidthKeys.clients }),
    // Invoices and the daily bill show client names.
    qc.invalidateQueries({ queryKey: bandwidthKeys.invoices }),
    qc.invalidateQueries({ queryKey: bandwidthKeys.dailyBill }),
  ]);
}

/** POST /v1/bandwidth/clients. */
export function useCreateBandwidthClient() {
  const invalidate = useClientInvalidation();
  return useMutation({
    mutationFn: (v: ClientInput) => http.post('/v1/bandwidth/clients', clientBody(v)),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/clients/{id}. */
export function useUpdateBandwidthClient() {
  const invalidate = useClientInvalidation();
  return useMutation({
    mutationFn: (v: ClientInput & { id: number }) => http.put(`/v1/bandwidth/clients/${v.id}`, clientBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/bandwidth/clients/{id} — 409 while invoices still reference the client. */
export function useDeleteBandwidthClient() {
  const invalidate = useClientInvalidation();
  return useMutation({
    mutationFn: (id: number) => http.delete(`/v1/bandwidth/clients/${id}`),
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------------------- invoices */

export interface InvoiceListParams {
  page: number;
  pageSize: number;
  search?: string;
  clientId?: string;
  status?: '' | 'paid' | 'due';
  from?: string;
  to?: string;
}

/** GET /v1/bandwidth/invoices — documents grouped by requisition_id, newest first. */
export function useBandwidthInvoices({ page, pageSize, search, clientId, status, from, to }: InvoiceListParams) {
  const params = compact({ page, per_page: pageSize, search, client_id: clientId, status, from, to });
  return useQuery({
    queryKey: bandwidthKeys.invoiceList(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/bandwidth/invoices', params, { listKey: 'items' });
      return { items: res.items.map(mapInvoice), meta: res.meta, totals: mapInvoiceTotals(res.raw.totals) };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/bandwidth/invoices/{rid} — document with its lines. */
export function useBandwidthInvoice(rid: string | null) {
  return useQuery({
    queryKey: bandwidthKeys.invoiceDetail(rid ?? ''),
    queryFn: async () => mapInvoice(await http.get<unknown>(`/v1/bandwidth/invoices/${encodeURIComponent(rid ?? '')}`)),
    enabled: Boolean(rid),
  });
}

export interface InvoiceLineInput {
  id?: number;
  itemId: string;
  /** Legacy lines without a catalogue key are resolved by name. */
  itemName?: string;
  description: string;
  qty: string;
  rate: string;
  fromDate: string;
  toDate: string;
}

export interface InvoiceInput {
  clientId: string;
  requisitionDate: string;
  deadline: string;
  remarks: string;
  lines: InvoiceLineInput[];
}

function invoiceBody(v: InvoiceInput) {
  return {
    client_id: v.clientId,
    requisition_date: v.requisitionDate,
    deadline: v.deadline,
    remarks: v.remarks.trim(),
    items: v.lines.map((l) => ({
      id: l.id,
      item_id: l.itemId,
      item_name: l.itemId ? undefined : l.itemName,
      description: l.description.trim(),
      qty: l.qty,
      rate: l.rate,
      from_date: l.fromDate,
      to_date: l.toDate,
    })),
  };
}

function useInvoiceInvalidation() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: bandwidthKeys.invoices }),
    qc.invalidateQueries({ queryKey: bandwidthKeys.dailyBill }),
  ]);
}

/** POST /v1/bandwidth/invoices. */
export function useCreateBandwidthInvoice() {
  const invalidate = useInvoiceInvalidation();
  return useMutation({
    mutationFn: (v: InvoiceInput) => http.post('/v1/bandwidth/invoices', invoiceBody(v)),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/invoices/{rid} — lines with an id are updated, others inserted, missing ones removed. */
export function useUpdateBandwidthInvoice() {
  const invalidate = useInvoiceInvalidation();
  return useMutation({
    mutationFn: (v: InvoiceInput & { rid: string }) => http.put(`/v1/bandwidth/invoices/${encodeURIComponent(v.rid)}`, invoiceBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/bandwidth/invoices/{rid} — every line of the document. */
export function useDeleteBandwidthInvoice() {
  const invalidate = useInvoiceInvalidation();
  return useMutation({
    mutationFn: (rid: string) => http.delete(`/v1/bandwidth/invoices/${encodeURIComponent(rid)}`),
    onSuccess: invalidate,
  });
}

export interface PaymentInput {
  receivedAmount: string;
  discount: string;
  vatAmount: string;
  paymentDate: string;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  description: string;
}

/**
 * POST /v1/bandwidth/invoices/{rid}/payments — sets the invoice's cumulative
 * received amount; due = total − received + VAT − discount.
 */
export function usePayBandwidthInvoice() {
  const invalidate = useInvoiceInvalidation();
  return useMutation({
    mutationFn: ({ rid, ...v }: PaymentInput & { rid: string }) =>
      http.post(`/v1/bandwidth/invoices/${encodeURIComponent(rid)}/payments`, {
        received_amount: v.receivedAmount,
        discount: v.discount.trim() || 0,
        vat_amount: v.vatAmount.trim() || 0,
        payment_date: v.paymentDate,
        payment_method: v.paymentMethod,
        paid_by: v.paidBy.trim(),
        received_by: v.receivedBy.trim(),
        description: v.description.trim(),
      }),
    onSuccess: invalidate,
  });
}

/* ----------------------------------------------------------- daily bill */

export interface DailyBillParams {
  page: number;
  pageSize: number;
  from: string;
  to: string;
  search?: string;
  clientId?: string;
  status?: '' | 'paid' | 'due';
  receivedBy?: string;
  createdBy?: string;
}

/** GET /v1/bandwidth/daily-bill — sell invoices of a date window with collection totals. */
export function useBandwidthDailyBill({ page, pageSize, from, to, search, clientId, status, receivedBy, createdBy }: DailyBillParams) {
  const params = compact({
    page,
    per_page: pageSize,
    from,
    to,
    search,
    client_id: clientId,
    status,
    received_by: receivedBy,
    created_by: createdBy,
    all: from || to ? undefined : 1,
  });
  return useQuery({
    queryKey: bandwidthKeys.dailyBillList(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/bandwidth/daily-bill', params, { listKey: 'items' });
      return { items: res.items.map(mapDailyBill), meta: res.meta, totals: mapDailyBillTotals(res.raw.totals) };
    },
    placeholderData: keepPreviousData,
  });
}
