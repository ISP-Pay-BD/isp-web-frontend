import { describe, it, expect, vi, beforeEach } from 'vitest';

const httpMocks = vi.hoisted(() => ({
  get: vi.fn(),
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

  it('getMetering calls the dedicated metering endpoint (not generic stats)', async () => {
    httpMocks.get.mockResolvedValueOnce({
      items: [
        {
          tenantId: '1',
          tenantSlug: 'demo',
          domain: 'demo.isppaybd.com',
          customers: 120,
          apiCalls: 0,
          smsSent: 450,
          storageGb: 0,
          period: '2026-09',
        },
      ],
      total: 1,
    });

    const res = await platformService.getMetering();
    expect(httpMocks.get).toHaveBeenCalledWith('/v1/platform/metering');
    expect((res as { items: Array<{ customers: number }> }).items[0].customers).toBe(120);
  });

  it('getSla calls the dedicated sla endpoint (not system-health)', async () => {
    httpMocks.get.mockResolvedValueOnce({
      items: [
        {
          tenantId: '1',
          tenantSlug: 'demo',
          uptimePct: 99.8,
          openTickets: 2,
          severity: 'ok',
          targetPct: 99.5,
        },
      ],
      total: 1,
    });

    const res = await platformService.getSla();
    expect(httpMocks.get).toHaveBeenCalledWith('/v1/platform/sla');
    expect((res as { items: Array<{ severity: string }> }).items[0].severity).toBe('ok');
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
