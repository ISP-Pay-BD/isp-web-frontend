import { describe, expect, it } from 'vitest';
import {
  allowsAction,
  mapPermissionCodes,
} from '@/features/employee/operations/lib/permission-codes';
import { toPaymentBody } from '@/features/employee/operations/schemas/collect-payment.schema';
import { serverTime } from '@/features/platform/cron/api/cron.api';
import { mapStats, mapTestResult } from '@/features/platform/ai-knowledge/types';

describe('employee permission codes (GET /v1/permissions/me, lane W2-R13)', () => {
  it('allows an action only with its menu.action code when the menu lists actions', () => {
    const codes = ['support_ticket', 'support_ticket.read', 'support_ticket.send_msg'];
    expect(allowsAction(codes, 'support_ticket', 'send_msg')).toBe(true);
    expect(allowsAction(codes, 'support_ticket', 'update')).toBe(false);
  });

  it('treats a bare menu code (role shell) as every action', () => {
    expect(allowsAction(['support_ticket'], 'support_ticket', 'update')).toBe(true);
    expect(allowsAction(['customer'], 'support_ticket', 'read')).toBe(false);
  });

  it('reads the code list and ignores junk', () => {
    expect(mapPermissionCodes({ permissions: ['a', 1, 'b.c'] })).toEqual(['a', 'b.c']);
    expect(mapPermissionCodes(null)).toEqual([]);
  });
});

describe('collect payment body (POST /v1/payments)', () => {
  it('sends cents and drops empty optional fields', () => {
    expect(
      toPaymentBody({ customerId: '42', amountBdt: 500.5, method: 'Cash', trxId: ' ', note: '' }),
    ).toEqual({
      customer_id: 42,
      amount_cents: 50050,
      method: 'Cash',
    });
    expect(
      toPaymentBody({ customerId: '7', amountBdt: 1, method: 'bKash', trxId: ' TX1 ', note: 'n' }),
    ).toMatchObject({
      gateway_trx: 'TX1',
      note: 'n',
    });
  });
});

describe('cron server_time', () => {
  it('keeps RFC 3339 with an offset and treats a zone-less legacy value as UTC', () => {
    expect(serverTime('2026-11-23T18:05:00+06:00')).toBe('2026-11-23T18:05:00+06:00');
    expect(serverTime('2026-11-23 12:05:00')).toBe('2026-11-23T12:05:00Z');
    expect(serverTime(null)).toBeNull();
  });
});

describe('AI knowledge (lane R10)', () => {
  it('maps /stats', () => {
    expect(
      mapStats({
        total_items: 5,
        active_items: 4,
        total_hits: 30,
        categories: [
          { category: 'billing', count: 3 },
          { category: null, count: 2 },
        ],
      }),
    ).toEqual({ total: 5, active: 4, hits: 30, categories: [{ category: 'billing', count: 3 }] });
  });

  it('maps test-query related entries, latency and explanation', () => {
    const r = mapTestResult({
      matched: false,
      resolution: 'rag_context',
      latency_ms: 3.2,
      matched_items: [{ id: 1, question: 'Q', answer: 'A', category: 'billing' }],
      explanation: 'context',
    });
    expect(r.related).toHaveLength(1);
    expect(r.latencyMs).toBe(3.2);
    expect(r.resolution).toBe('rag_context');
    expect(mapTestResult({ matched: true, matched_item: { id: 9, question: 'X' } }).entry?.id).toBe(
      '9',
    );
  });
});
