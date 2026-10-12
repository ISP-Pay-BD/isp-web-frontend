import { num, str } from '@/lib/api/case';
import type {
  CustomerOption,
  CustomerPaymentRow,
  LedgerStatus,
  LedgerSummary,
  MethodKey,
  PaymentReceipt,
  ReceiptPayer,
} from '../types';

type Raw = Record<string, unknown>;

const PAID = new Set(['successful', 'success', 'completed', 'paid']);

export function toLedgerStatus(raw: unknown): LedgerStatus {
  const s = str(raw).toLowerCase();
  if (PAID.has(s)) return 'completed';
  if (s === 'pending') return 'pending';
  return 'failed';
}

export function toMethodKey(raw: unknown): MethodKey {
  const m = str(raw).toLowerCase();
  if (!m) return 'other';
  if (m.includes('bkash')) return 'bkash';
  if (m.includes('nagad')) return 'nagad';
  if (m.includes('rocket')) return 'rocket';
  if (m.includes('ssl')) return 'sslcommerz';
  if (m.includes('bank')) return 'bank';
  if (m.includes('cash')) return 'cash';
  if (m.includes('card') || m.includes('eps') || m.includes('shurjo') || m.includes('paystation')) return 'card';
  return 'other';
}

export const METHOD_LABEL: Record<MethodKey, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  cash: 'Cash',
  bank: 'Bank',
  sslcommerz: 'SSLCommerz',
  card: 'Card / gateway',
  other: 'Other',
};

/** Display label: the stored text when it is meaningful, else the normalised name. */
export function methodLabel(row: { methodRaw: string; method: MethodKey }): string {
  if (!row.methodRaw) return '—';
  return row.method === 'other' ? row.methodRaw : METHOD_LABEL[row.method];
}

export function mapPaymentRow(r: Raw): CustomerPaymentRow {
  const id = str(r.id);
  const methodRaw = str(r.paid_via);
  const name = str(r.customer_name);
  return {
    id,
    invoiceNo: str(r.invoice) || `#${id}`,
    customerId: str(r.user_id),
    customerName: name && name !== '--' ? name : '—',
    customerMobile: str(r.customer_mobile),
    amountBdt: num(r.amount),
    methodRaw,
    method: toMethodKey(methodRaw),
    status: toLedgerStatus(r.status),
    trxId: str(r.method_trx),
    billingMonth: str(r.month),
    createdAt: str(r.created_at),
    paidAt: r.paid_at ? str(r.paid_at) : null,
    collector: str(r.paid_to_name) && str(r.paid_to_name) !== '--' ? str(r.paid_to_name) : '',
    comment: str(r.comment),
  };
}

export function mapLedgerSummary(s: Raw | null | undefined): LedgerSummary {
  const v = s ?? {};
  return {
    count: num(v.count),
    totalAmount: num(v.total_amount),
    collected: num(v.collected),
    pending: num(v.pending),
    paidCount: num(v.paid_count),
    pendingCount: num(v.pending_count),
    failedCount: num(v.failed_count),
    mfsCollected: num(v.mfs_collected),
    bankCollected: num(v.bank_collected),
    cashCollected: num(v.cash_collected),
  };
}

function mapPayer(c: unknown): ReceiptPayer | null {
  if (!c || typeof c !== 'object') return null;
  const r = c as Raw;
  return {
    id: str(r.id),
    name: str(r.name),
    mobile: str(r.mobile),
    email: str(r.email),
    address: str(r.address),
    code: str(r.code),
    packageName: r.package_name ? str(r.package_name) : null,
    packagePrice: r.package_price === null || r.package_price === undefined ? null : num(r.package_price),
    areaName: r.area_name ? str(r.area_name) : null,
    willExpire: r.will_expire ? str(r.will_expire) : null,
  };
}

export function mapReceipt(raw: Raw): PaymentReceipt {
  const p = (raw.payment ?? {}) as Raw;
  const i = (raw.issuer ?? {}) as Raw;
  const collector = raw.collector && typeof raw.collector === 'object' ? str((raw.collector as Raw).name) : '';
  const id = str(p.id);
  const methodRaw = str(p.paid_via);
  return {
    id,
    invoiceNo: str(p.invoice) || `#${id}`,
    amountBdt: num(p.amount),
    status: toLedgerStatus(p.status),
    methodRaw,
    method: toMethodKey(methodRaw),
    trxId: str(p.method_trx),
    billingMonth: str(p.month),
    comment: str(p.comment),
    userType: str(p.user_type),
    purpose: p.purpose ? str(p.purpose) : null,
    createdAt: p.created_at ? str(p.created_at) : null,
    paidAt: p.paid_at ? str(p.paid_at) : null,
    customer: mapPayer(raw.customer),
    collector: collector || null,
    issuer: {
      name: str(i.name),
      slogan: str(i.slogan),
      phone: str(i.phone),
      email: str(i.email),
      address: str(i.address),
    },
  };
}

export function mapCustomerOption(r: Raw): CustomerOption {
  return {
    id: str(r.id),
    name: str(r.name),
    mobile: str(r.mobile),
    packageName: r.package_name ? str(r.package_name) : null,
    packagePrice: r.package_price === null || r.package_price === undefined ? null : num(r.package_price),
  };
}

/** Plain-text SMS body for a payment receipt — every value comes from the receipt. */
export function receiptSmsText(r: PaymentReceipt): string {
  const when = r.paidAt ?? r.createdAt ?? '';
  const parts = [
    `Dear ${r.customer?.name || 'customer'},`,
    r.status === 'completed'
      ? `we received BDT ${r.amountBdt.toFixed(2)}${r.methodRaw ? ` via ${r.methodRaw}` : ''}${when ? ` on ${when.slice(0, 10)}` : ''}.`
      : `your invoice of BDT ${r.amountBdt.toFixed(2)} is ${r.status}.`,
    `Invoice ${r.invoiceNo}.`,
  ];
  if (r.trxId) parts.push(`Ref ${r.trxId}.`);
  if (r.issuer.name) parts.push(`- ${r.issuer.name}`);
  return parts.join(' ');
}
