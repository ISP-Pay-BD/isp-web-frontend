/**
 * Month rows for past / multi-month billing (PHP `pastBillingModule` in customers/new.php and the
 * multi-month manager in customers/subscription.php). Each row becomes one record of
 * `past_billing` (Add Customer) or `months` (`POST /v1/customers/{id}/batch-billing`).
 * The backend keys a record on (customer, month, period) and updates it when it exists.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** PHP `paid_via` options (customers/new.php past billing table). */
export const PAID_VIA_OPTIONS = [
  'Cash',
  'Bkash',
  'Bkash Send Money',
  'Nagad',
  'Rocket',
  'Upay',
  'Bank',
] as const;

export type BillingStatus = 'successful' | 'pending';

/** A payment already recorded for a month (from the subscription view's `payment_history`). */
export interface ExistingMonthPayment {
  id: string;
  status: BillingStatus | string;
  amount: number;
  paidVia: string;
  comment: string;
  /** `YYYY-MM` */
  periodYm: string;
}

export interface BillingMonthRow {
  month: string;
  year: number;
  /** `YYYY-MM-01` */
  period: string;
  isCurrentMonth: boolean;
  isNextMonth: boolean;
  selected: boolean;
  status: BillingStatus;
  amount: number;
  paidVia: string;
  comment: string;
  existing: ExistingMonthPayment | null;
}

export type ExistingIndex = Map<string, ExistingMonthPayment>;

const pad = (n: number) => String(n).padStart(2, '0');

export function periodOf(year: number, monthIdx: number): string {
  return `${year}-${pad(monthIdx + 1)}-01`;
}

/** Month index (0–11) of an English month name or prefix ("Aug", "August 2026"); -1 when unknown. */
export function monthIndexOf(name: string): number {
  const word = /^([a-zA-Z]+)/.exec(name.trim())?.[1]?.toLowerCase();
  if (!word || word.length < 3) return -1;
  return MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(word.slice(0, 3)));
}

export interface RawPayment {
  id?: unknown;
  status?: unknown;
  amount_cents?: unknown;
  pay_amount_cents?: unknown;
  paid_via?: unknown;
  method?: unknown;
  note?: unknown;
  month?: unknown;
  period?: unknown;
  created_at?: unknown;
}

const str = (v: unknown) =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Index recorded payments by `YYYY-MM`. Uses the real `period` first; legacy rows without one fall back to
 * the month name in the year they were created (PHP `existingCustomerPayments` map). Newest row wins.
 */
export function indexExistingPayments(rows: RawPayment[]): ExistingIndex {
  const index: ExistingIndex = new Map();
  for (const row of rows) {
    let periodYm = /^\d{4}-\d{2}/.exec(str(row.period))?.[0] ?? '';
    if (!periodYm) {
      const idx = monthIndexOf(str(row.month));
      const year = Number(/^(\d{4})/.exec(str(row.created_at))?.[1]);
      if (idx < 0 || !year) continue;
      periodYm = `${year}-${pad(idx + 1)}`;
    }
    if (index.has(periodYm)) continue; // history is newest-first; keep the latest record per month
    index.set(periodYm, {
      id: str(row.id),
      status: str(row.status).toLowerCase(),
      amount: num(row.amount_cents) / 100,
      paidVia: str(row.paid_via) || str(row.method),
      comment: str(row.note),
      periodYm,
    });
  }
  return index;
}

interface RowInput {
  year: number;
  monthIdx: number;
  price: number;
  existing: ExistingIndex;
  isCurrentMonth?: boolean;
  isNextMonth?: boolean;
  status?: BillingStatus;
  selected?: boolean;
}

function makeRow({
  year,
  monthIdx,
  price,
  existing,
  isCurrentMonth = false,
  isNextMonth = false,
  status,
  selected = false,
}: RowInput): BillingMonthRow {
  const period = periodOf(year, monthIdx);
  const found = existing.get(period.slice(0, 7)) ?? null;
  return {
    month: MONTH_NAMES[monthIdx],
    year,
    period,
    isCurrentMonth,
    isNextMonth,
    selected,
    status: found
      ? found.status === 'successful'
        ? 'successful'
        : 'pending'
      : (status ?? 'pending'),
    amount: found ? found.amount : price,
    paidVia: found?.paidVia || 'Cash',
    comment: found?.comment ?? '',
    existing: found,
  };
}

/**
 * Add Customer default: of N months the oldest are paid, the rest due — 2 paid of 5, otherwise half
 * (at least one) once N ≥ 2 (PHP `generateMonths`).
 */
export function defaultPastStatus(count: number, position: number): BillingStatus {
  if (count < 2) return 'pending';
  const paidThreshold = count === 5 ? 2 : Math.max(1, Math.floor(count / 2));
  return position < paidThreshold ? 'successful' : 'pending';
}

/** The last `count` months up to and including the current one, oldest first. */
export function buildTimeline(options: {
  count: number;
  price: number;
  now?: Date;
  existing?: ExistingIndex;
  /** Add Customer pre-fills paid/due per {@link defaultPastStatus}; the manager uses the recorded status. */
  pastDefaults?: boolean;
}): BillingMonthRow[] {
  const { price, now = new Date(), existing = new Map(), pastDefaults = false } = options;
  const count = Math.max(1, Math.min(36, Math.trunc(options.count) || 5));
  const rows: BillingMonthRow[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rows.push(
      makeRow({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        price,
        existing,
        isCurrentMonth: i === 0,
        status: pastDefaults ? defaultPastStatus(count, count - 1 - i) : 'pending',
      }),
    );
  }
  return rows;
}

/** Every month that already has a payment, plus the current month, oldest first (PHP "All Recorded"). */
export function buildRecordedTimeline(
  price: number,
  existing: ExistingIndex,
  now = new Date(),
): BillingMonthRow[] {
  const current = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const periods = [...new Set([current, ...existing.keys()])].sort();
  return periods.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    return makeRow({ year: y, monthIdx: m - 1, price, existing, isCurrentMonth: ym === current });
  });
}

/** The month after the last row (advance billing), selected and marked paid like PHP `addNextMonth`. */
export function nextMonthRow(
  rows: BillingMonthRow[],
  price: number,
  existing: ExistingIndex = new Map(),
  now = new Date(),
): BillingMonthRow {
  const last = rows[rows.length - 1];
  const base = last
    ? new Date(last.year, MONTH_NAMES.indexOf(last.month as (typeof MONTH_NAMES)[number]) + 1, 1)
    : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return makeRow({
    year: base.getFullYear(),
    monthIdx: base.getMonth(),
    price,
    existing,
    isNextMonth: true,
    status: 'successful',
    selected: true,
  });
}

/** Records in the backend's shape (`month`, `year`, `period`, `status`, `amount` in taka, `paid_via`, `comment`). */
export function toBillingRecords(rows: BillingMonthRow[]) {
  return rows.map((r) => ({
    month: r.month,
    year: r.year,
    period: r.period,
    status: r.status,
    amount: Number.isFinite(r.amount) ? r.amount : 0,
    ...(r.status === 'successful' ? { paid_via: r.paidVia || 'Cash' } : {}),
    ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
    created_at: `${r.period} 10:00:00`,
  }));
}

export function billingTotals(rows: BillingMonthRow[]) {
  const paid = rows.filter((r) => r.status === 'successful');
  const due = rows.filter((r) => r.status !== 'successful');
  const sum = (list: BillingMonthRow[]) =>
    list.reduce((acc, r) => acc + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  return {
    paidCount: paid.length,
    paidAmount: sum(paid),
    dueCount: due.length,
    dueAmount: sum(due),
  };
}
