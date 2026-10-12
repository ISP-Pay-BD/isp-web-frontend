/** UI shapes for the customer payment ledger (mapped from zapi payments rows). */

export type LedgerStatus = 'completed' | 'pending' | 'failed';

/** Normalised gateway / method key (raw `paid_via` is free text). */
export type MethodKey = 'bkash' | 'nagad' | 'rocket' | 'cash' | 'bank' | 'sslcommerz' | 'card' | 'other';

export interface CustomerPaymentRow {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  amountBdt: number;
  /** Raw `paid_via` text as stored ("" when not recorded). */
  methodRaw: string;
  method: MethodKey;
  status: LedgerStatus;
  trxId: string;
  billingMonth: string;
  createdAt: string;
  paidAt: string | null;
  collector: string;
  comment: string;
}

export interface LedgerSummary {
  count: number;
  totalAmount: number;
  collected: number;
  pending: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  mfsCollected: number;
  bankCollected: number;
  cashCollected: number;
}

export interface LedgerFilters {
  page: number;
  pageSize: number;
  search: string;
  status: 'all' | 'successful' | 'pending' | 'failed';
  method: string;
  from: string;
  to: string;
}

export interface ReceiptIssuer {
  name: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
}

export interface ReceiptPayer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  code: string;
  packageName: string | null;
  packagePrice: number | null;
  areaName: string | null;
  willExpire: string | null;
}

export interface PaymentReceipt {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  status: LedgerStatus;
  methodRaw: string;
  method: MethodKey;
  trxId: string;
  billingMonth: string;
  comment: string;
  userType: string;
  purpose: string | null;
  createdAt: string | null;
  paidAt: string | null;
  customer: ReceiptPayer | null;
  collector: string | null;
  issuer: ReceiptIssuer;
}

export interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
  packageName: string | null;
  packagePrice: number | null;
}
