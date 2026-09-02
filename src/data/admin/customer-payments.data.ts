import type { Payment } from '../shared/types';
import { customers } from './customers.data';
import { pick, invoiceNo, trxId, isoDateTime } from '../shared/generators';

const methods: Payment['method'][] = ['bkash', 'nagad', 'cash', 'bank', 'sslcommerz'];
const amounts = [500, 800, 1200, 1500, 2200, 3500, 5000];

/** Primary payment list — one per customer + extras for history */
export const customerPayments: Payment[] = [
  ...customers.map((c, i) => ({
    id: `pay_${String(i + 1).padStart(4, '0')}`,
    customerId: c.id,
    customerName: c.name,
    amountBdt: pick(amounts, i),
    method: pick(methods, i),
    status: (i % 11 === 0 ? 'pending' : i % 19 === 0 ? 'failed' : 'completed') as Payment['status'],
    invoiceNo: invoiceNo(2026, 1000 + i),
    paidAt: isoDateTime(`2026-${String((i % 8) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`, 9 + (i % 8)),
    note: i % 4 === 0 ? `TrxID: ${trxId(pick(methods, i), i)}` : undefined,
  })),
  // Historical payments for demo customer
  ...customers.slice(0, 15).flatMap((c, ci) =>
    [1, 2, 3].map((m, mi) => ({
      id: `pay_hist_${ci}_${m}`,
      customerId: c.id,
      customerName: c.name,
      amountBdt: pick(amounts, ci + mi),
      method: pick(methods, ci + mi),
      status: 'completed' as const,
      invoiceNo: invoiceNo(2026 - m, 500 + ci * 3 + mi),
      paidAt: isoDateTime(`2026-${String(((ci + mi) % 8) + 1).padStart(2, '0')}-15`, 14),
      note: 'Monthly renewal',
    })),
  ),
];

export function getPaymentsByCustomerId(customerId: string): Payment[] {
  return customerPayments
    .filter((p) => p.customerId === customerId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export const todayCollectionBdt = customerPayments
  .filter((p) => p.paidAt.startsWith('2026-09-02') && p.status === 'completed')
  .reduce((s, p) => s + p.amountBdt, 0);

export const monthlyCollectionBdt = customerPayments
  .filter((p) => p.paidAt.startsWith('2026-09') && p.status === 'completed')
  .reduce((s, p) => s + p.amountBdt, 0);
