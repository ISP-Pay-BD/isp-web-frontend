import { describe, it, expect, vi, beforeEach } from 'vitest';

const httpMocks = vi.hoisted(() => ({
  get: vi.fn(),
  getPage: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api/client')>();
  return {
    ...mod,
    http: httpMocks,
  };
});

import { platformService } from '@/lib/api/services/platform.service';

describe('platformService — new v1 surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMetering pages the dedicated metering endpoint and maps snake_case rows', async () => {
    httpMocks.getPage.mockResolvedValueOnce({
      items: [
        {
          admin_id: 7,
          tenant_id: 1,
          tenant_slug: 'demo',
          domain: 'demo.isppaybd.com',
          name: 'Demo ISP',
          customers: 120,
          resellers: 3,
          routers: 2,
          sms_sent: 450,
          payments_count: 90,
          payments_amount_bdt: 54000,
          period: '2026-09',
        },
      ],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
      raw: { summary: { tenants: 1, customers: 120, routers: 2, sms_sent: 450, period: '2026-09' } },
    });

    const res = await platformService.getMetering();
    expect(httpMocks.getPage.mock.calls[0][0]).toBe('/v1/platform/metering');
    expect(res.items[0]).toMatchObject({ tenantSlug: 'demo', customers: 120, smsSent: 450, paymentsAmountBdt: 54000 });
    expect(res.summary.customers).toBe(120);
    expect(res.total).toBe(1);
  });

  it('getSla pages the dedicated sla endpoint (not system-health)', async () => {
    httpMocks.getPage.mockResolvedValueOnce({
      items: [
        {
          admin_id: 7,
          tenant_slug: 'demo',
          name: 'Demo ISP',
          routers_total: 4,
          routers_active: 4,
          router_availability_pct: 100,
          open_tickets: 2,
          severity: 'ok',
          target_pct: 99.5,
        },
      ],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
      raw: { metric: 'share of routers marked active' },
    });

    const res = await platformService.getSla();
    expect(httpMocks.getPage.mock.calls[0][0]).toBe('/v1/platform/sla');
    expect(res.items[0]).toMatchObject({ severity: 'ok', routerAvailabilityPct: 100, openTickets: 2 });
    expect(res.summary.metric).toBe('share of routers marked active');
  });

  it('getRecycleBin hits recycle-bin endpoint with optional entity filter', async () => {
    httpMocks.get.mockResolvedValueOnce({ items: [], total: 0 });
    await platformService.getRecycleBin();
    expect(httpMocks.get).toHaveBeenCalledWith('/v1/platform/recycle-bin', undefined);

    httpMocks.get.mockResolvedValueOnce({ items: [], total: 0 });
    await platformService.getRecycleBin('customer');
    expect(httpMocks.get).toHaveBeenCalledWith('/v1/platform/recycle-bin', { entity: 'customer' });
  });

  it('restore + purge recycle-bin item call the right mutation routes', async () => {
    httpMocks.post.mockResolvedValueOnce({ id: '7' });
    await platformService.restoreRecycleBinItem('7');
    expect(httpMocks.post).toHaveBeenCalledWith('/v1/platform/recycle-bin/7/restore');

    httpMocks.delete.mockResolvedValueOnce({ id: '7' });
    await platformService.purgeRecycleBinItem('7');
    expect(httpMocks.delete).toHaveBeenCalledWith('/v1/platform/recycle-bin/7');
  });
});
