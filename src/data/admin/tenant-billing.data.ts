/** Admin tenant payments to ISP Pay BD platform (D13j) */

import type { PaymentMethod, PaymentStatus } from '../shared/types';

export interface TenantBillingPayment {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  planName: string;
  period: string;
  note?: string;
}

export const tenantBillingPayments: TenantBillingPayment[] = [
  {
    id: 'tbill_001',
    invoiceNo: 'IPB-SUB-2026-0001',
    amountBdt: 8500,
    method: 'bkash',
    status: 'completed',
    paidAt: '2026-08-15T14:22:00',
    planName: 'Pro — up to 2,000 customers',
    period: 'Aug 2026',
    note: 'TrxID: BK8A2F9X1M',
  },
  {
    id: 'tbill_002',
    invoiceNo: 'IPB-SUB-2026-0002',
    amountBdt: 8500,
    method: 'sslcommerz',
    status: 'completed',
    paidAt: '2026-07-15T11:05:00',
    planName: 'Pro — up to 2,000 customers',
    period: 'Jul 2026',
    note: 'Card ending 4242',
  },
  {
    id: 'tbill_003',
    invoiceNo: 'IPB-SUB-2026-0003',
    amountBdt: 8500,
    method: 'bank',
    status: 'completed',
    paidAt: '2026-06-14T09:30:00',
    planName: 'Pro — up to 2,000 customers',
    period: 'Jun 2026',
    note: 'DBBL transfer ref #882910',
  },
  {
    id: 'tbill_004',
    invoiceNo: 'IPB-SUB-2026-0004',
    amountBdt: 3500,
    method: 'nagad',
    status: 'completed',
    paidAt: '2026-05-12T16:45:00',
    planName: 'Starter — up to 500 customers',
    period: 'May 2026',
    note: 'Plan upgrade mid-cycle',
  },
  {
    id: 'tbill_005',
    invoiceNo: 'IPB-SUB-2026-0005',
    amountBdt: 8500,
    method: 'bkash',
    status: 'pending',
    paidAt: '2026-09-02T10:00:00',
    planName: 'Pro — up to 2,000 customers',
    period: 'Sep 2026',
    note: 'Awaiting bKash confirmation',
  },
];

export const tenantBillingSummary = {
  totalPaidBdt: tenantBillingPayments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.amountBdt, 0),
  pendingBdt: tenantBillingPayments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amountBdt, 0),
  lastPaymentDate: tenantBillingPayments.find((p) => p.status === 'completed')?.paidAt ?? '',
};
