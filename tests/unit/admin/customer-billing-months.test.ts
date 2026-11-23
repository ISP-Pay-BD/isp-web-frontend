import { describe, expect, it } from 'vitest';
import {
  billingTotals,
  buildRecordedTimeline,
  buildTimeline,
  defaultPastStatus,
  indexExistingPayments,
  nextMonthRow,
  toBillingRecords,
} from '@/features/admin/customer-billing/lib/billing-months';
import { mapOperations } from '@/features/employee/operations/lib/map-operations';

const NOW = new Date(2026, 1, 15); // February 2026

describe('past billing timeline (PHP pastBillingModule)', () => {
  it('builds the last N months up to the current one, oldest first, across the year boundary', () => {
    const rows = buildTimeline({ count: 5, price: 800, now: NOW, pastDefaults: true });
    expect(rows.map((r) => r.period)).toEqual([
      '2025-10-01',
      '2025-11-01',
      '2025-12-01',
      '2026-01-01',
      '2026-02-01',
    ]);
    expect(rows.map((r) => r.status)).toEqual([
      'successful',
      'successful',
      'pending',
      'pending',
      'pending',
    ]);
    expect(rows[4].isCurrentMonth).toBe(true);
    expect(rows.every((r) => r.amount === 800)).toBe(true);
  });

  it('defaults half the months paid (2 of 5), none when only one month', () => {
    expect(defaultPastStatus(1, 0)).toBe('pending');
    expect([0, 1, 2, 3].map((p) => defaultPastStatus(4, p))).toEqual([
      'successful',
      'successful',
      'pending',
      'pending',
    ]);
    expect([0, 1, 2].map((p) => defaultPastStatus(3, p))).toEqual([
      'successful',
      'pending',
      'pending',
    ]);
  });

  it('sends the backend record shape; paid_via only for paid months', () => {
    const rows = buildTimeline({ count: 2, price: 500, now: NOW, pastDefaults: true });
    rows[1].comment = '  trx-1 ';
    expect(toBillingRecords(rows)).toEqual([
      {
        month: 'January',
        year: 2026,
        period: '2026-01-01',
        status: 'successful',
        amount: 500,
        paid_via: 'Cash',
        created_at: '2026-01-01 10:00:00',
      },
      {
        month: 'February',
        year: 2026,
        period: '2026-02-01',
        status: 'pending',
        amount: 500,
        comment: 'trx-1',
        created_at: '2026-02-01 10:00:00',
      },
    ]);
    expect(billingTotals(rows)).toEqual({
      paidCount: 1,
      paidAmount: 500,
      dueCount: 1,
      dueAmount: 500,
    });
  });
});

describe('multi-month manager existing-payment detection', () => {
  const history = [
    {
      id: 9,
      status: 'successful',
      amount_cents: 90000,
      paid_via: 'Nagad',
      period: '2026-01-01',
      month: 'January',
      note: 'x',
    },
    {
      id: 8,
      status: 'pending',
      amount_cents: 80000,
      method: 'Cash',
      period: null,
      month: 'November',
      created_at: '2025-11-03 10:00:00',
    },
    { id: 7, status: 'successful', amount_cents: 1, period: '2026-01-01' },
  ];
  const existing = indexExistingPayments(history);

  it('indexes by period, falls back to month + created year, newest record wins', () => {
    expect([...existing.keys()].sort()).toEqual(['2025-11', '2026-01']);
    expect(existing.get('2026-01')).toMatchObject({
      id: '9',
      amount: 900,
      paidVia: 'Nagad',
      status: 'successful',
    });
  });

  it('pre-fills months that already have a payment', () => {
    const rows = buildTimeline({ count: 4, price: 800, now: NOW, existing });
    expect(rows.map((r) => [r.period, r.status, r.amount, Boolean(r.existing)])).toEqual([
      ['2025-11-01', 'pending', 800, true],
      ['2025-12-01', 'pending', 800, false],
      ['2026-01-01', 'successful', 900, true],
      ['2026-02-01', 'pending', 800, false],
    ]);
    expect(rows.every((r) => !r.selected)).toBe(true);
  });

  it('"All recorded" shows every recorded month plus the current one', () => {
    expect(buildRecordedTimeline(800, existing, NOW).map((r) => r.period)).toEqual([
      '2025-11-01',
      '2026-01-01',
      '2026-02-01',
    ]);
  });

  it('adds the next month as a selected, paid advance row', () => {
    const rows = buildTimeline({ count: 1, price: 800, now: new Date(2026, 11, 2) });
    const next = nextMonthRow(rows, 800);
    expect(next).toMatchObject({
      month: 'January',
      year: 2027,
      period: '2027-01-01',
      selected: true,
      status: 'successful',
      isNextMonth: true,
    });
  });
});

describe('employee operations mapping', () => {
  it('hides sections the employee may not read', () => {
    const ops = mapOperations({
      month: 'November',
      can_read_customer: false,
      can_read_payment: true,
      can_read_ticket: false,
      area_ids: [],
      area_due_count: 0,
      my_today_collection: 100.5,
      my_today_count: 1,
      my_month_collection: 900,
      my_month_count: 3,
      my_recent_collections: [{ id: 1, amount: 100.5, status: 'successful', customer_name: 'A' }],
      assigned_tickets_count: 0,
      assigned_tickets: [],
    });
    expect(ops.area).toBeNull();
    expect(ops.tickets).toBeNull();
    expect(ops.collections).toMatchObject({ todayAmount: 100.5, monthCount: 3 });
    expect(ops.collections?.recent[0]).toMatchObject({ id: '1', amount: 100.5, customerName: 'A' });
  });

  it('hides a section the payload omits', () => {
    const ops = mapOperations({ can_read_customer: true, can_read_ticket: true, area_ids: [3] });
    expect(ops.area).toBeNull();
    expect(ops.tickets).toBeNull();
    expect(ops.hasAreas).toBe(true);
  });
});
