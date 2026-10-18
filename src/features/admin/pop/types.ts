import { num, str } from '@/lib/api/case';

/**
 * POP (tenant resellerAdmin) types mapped from zapi:
 *  - GET /v1/pops                → PopController::shapePop rows (fund = wallet balance)
 *  - GET /v1/pops/{id}/funding   → { pop, items, summary } + pagination meta
 */

export interface PopReseller {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  status: string;
  balanceBdt: number;
  billingType: 'prepaid' | 'postpaid';
  fundEnabled: boolean;
  /** All customers under the POP (backend clients_running). */
  customers: number;
  clientsEnabled: number;
  clientsDisabled: number;
  clientsLeft: number;
  createdAt: string;
}

export interface PopFundingEntry {
  id: string;
  type: 'credit' | 'debit';
  amountBdt: number;
  receivedAmount: number | null;
  invoiceNumber: string;
  paidVia: string;
  receivedDate: string;
  comments: string;
  status: string;
  createdAt: string;
}

export interface PopFundingSummary {
  creditTotal: number;
  debitTotal: number;
  net: number;
  balance: number;
}

type Raw = Record<string, unknown>;

export function mapPop(raw: Raw): PopReseller {
  return {
    id: str(raw.id),
    name: str(raw.name),
    mobile: str(raw.mobile),
    email: str(raw.email),
    address: str(raw.address),
    status: str(raw.status) || 'active',
    balanceBdt: num(raw.fund),
    billingType: str(raw.billing_type) === 'prepaid' ? 'prepaid' : 'postpaid',
    fundEnabled: raw.fund_enabled !== false,
    customers: num(raw.clients_running ?? raw.client_count),
    clientsEnabled: num(raw.clients_enabled),
    clientsDisabled: num(raw.clients_disabled),
    clientsLeft: num(raw.clients_left),
    createdAt: str(raw.created_at),
  };
}

export function mapFundingEntry(raw: Raw): PopFundingEntry {
  return {
    id: str(raw.id),
    type: str(raw.type) === 'debit' ? 'debit' : 'credit',
    amountBdt: num(raw.amount),
    receivedAmount: raw.received_amount === null || raw.received_amount === undefined ? null : num(raw.received_amount),
    invoiceNumber: str(raw.invoice_number),
    paidVia: str(raw.paid_via),
    receivedDate: str(raw.received_date),
    comments: str(raw.comments),
    status: str(raw.status),
    createdAt: str(raw.created_at),
  };
}

export function mapFundingSummary(raw: unknown): PopFundingSummary {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Raw;
  return {
    creditTotal: num(s.credit_total),
    debitTotal: num(s.debit_total),
    net: num(s.net),
    balance: num(s.balance),
  };
}
