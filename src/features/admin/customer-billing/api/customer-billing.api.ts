import { http } from '@/lib/api/client';
import { indexExistingPayments, type ExistingIndex, type RawPayment } from '../lib/billing-months';

type Raw = Record<string, unknown>;

const str = (v: unknown) =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
const cents = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n / 100 : 0;
};

export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  validityDays: number;
}

export interface SubscriptionPayment {
  id: string;
  month: string;
  period: string;
  status: string;
  /** Billed amount (৳, `amount_cents`). */
  amount: number;
  /** Received amount (৳, `pay_amount_cents`); legacy rows without it count as received in full. */
  payAmount: number;
  paidVia: string;
  createdAt: string;
}

export interface CustomerSubscription {
  customerId: string;
  name: string;
  phone: string;
  username: string;
  status: string;
  packageId: string;
  packageName: string;
  expiresAt: string;
  /** Monthly price of the customer's package (৳), 0 when unknown. */
  packagePrice: number;
  dailyBill: boolean;
  showDailyBill: boolean;
  currentMonthPayment: SubscriptionPayment | null;
  history: SubscriptionPayment[];
  existing: ExistingIndex;
  packages: SubscriptionPackage[];
}

function mapPayment(p: Raw): SubscriptionPayment {
  return {
    id: str(p.id),
    month: str(p.month),
    period: str(p.period),
    status: str(p.status).toLowerCase(),
    amount: cents(p.amount_cents),
    payAmount:
      p.pay_amount_cents === null || p.pay_amount_cents === undefined
        ? cents(p.amount_cents)
        : cents(p.pay_amount_cents),
    paidVia: str(p.paid_via) || str(p.method),
    createdAt: str(p.created_at),
  };
}

/** `GET /v1/customers/{id}/subscription` (Rust `CustomerSubscriptionView`). */
export function mapSubscription(raw: Raw): CustomerSubscription {
  const c = (raw.customer ?? {}) as Raw;
  const history = Array.isArray(raw.payment_history) ? (raw.payment_history as Raw[]) : [];
  const packages = (
    Array.isArray(raw.available_packages) ? (raw.available_packages as Raw[]) : []
  ).map((p) => ({
    id: str(p.id),
    name: str(p.name),
    price: cents(p.price_cents),
    validityDays: Number(p.validity_days) || 30,
  }));
  const packageId = str(c.package_id);
  return {
    customerId: str(c.id),
    name: str(c.name),
    phone: str(c.phone),
    username: str(c.pppoe_id) || str(c.username),
    status: str(c.status),
    packageId,
    packageName: str(c.package_name),
    expiresAt: str(c.expires_at),
    packagePrice: packages.find((p) => p.id === packageId)?.price ?? 0,
    dailyBill: raw.daily_bill === true,
    showDailyBill: raw.show_daily_bill === true,
    currentMonthPayment: raw.current_month_payment
      ? mapPayment(raw.current_month_payment as Raw)
      : null,
    history: history.map(mapPayment),
    existing: indexExistingPayments(history as RawPayment[]),
    packages,
  };
}

export interface RenewBody {
  will_expire: string;
  package_id?: number;
  month: string;
  status: 'successful' | 'pending';
  paid_via?: string;
  method_trx?: string;
  note?: string;
  daily_bill?: 0 | 1;
  idempotency_key: string;
}

export const customerBillingApi = {
  subscription: async (id: string) =>
    mapSubscription(await http.get<Raw>(`/v1/customers/${id}/subscription`)),
  /** Full recharge (`PUT /v1/customers/{id}/subscription`, not status-only) — carries `daily_bill`. */
  renew: (id: string, body: RenewBody) => http.put<Raw>(`/v1/customers/${id}/subscription`, body),
  /** `POST /v1/customers/{id}/batch-billing` — inserts or updates one payment per month. */
  batchBilling: (id: string, months: Record<string, unknown>[]) =>
    http.post<{ processed?: number }>(`/v1/customers/${id}/batch-billing`, { months }),
};
