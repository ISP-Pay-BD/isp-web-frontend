'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import {
  downloadCsv,
  fetchAllPages,
  todayYmd,
} from '@/features/admin/accounting/shared/table-utils';

/** One-time connection / installation charge (OTC) for a customer connection. */
export interface OtcReportRow {
  id: string;
  userId: string;
  userName: string;
  otc: number;
  otcStatus: string;
  billingStatus: string;
  connectionType: string;
  clientType: string;
  fiberCode: string;
  createdAt: string;
}

export interface OtcSummary {
  totalOtc: number;
  paidOtc: number;
  dueOtc: number;
  paidCount: number;
  dueCount: number;
  pendingCount: number;
}

export type OtcStatusFilter = 'all' | 'paid' | 'due' | 'pending';

export interface OtcFilters {
  status: OtcStatusFilter;
  fromDate: string;
  toDate: string;
  search: string;
}

type Row = Record<string, unknown>;

function mapRow(r: Row): OtcReportRow {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    userName: str(r.user_name),
    otc: num(r.otc),
    otcStatus: str(r.otc_status),
    billingStatus: str(r.billing_status),
    connectionType: str(r.connection_type),
    clientType: str(r.client_type),
    fiberCode: str(r.fiber_code),
    createdAt: str(r.created_at),
  };
}

function mapSummary(v: unknown): OtcSummary {
  const s = (v ?? {}) as Row;
  return {
    totalOtc: num(s.total_otc),
    paidOtc: num(s.paid_otc),
    dueOtc: num(s.due_otc),
    paidCount: num(s.paid_count),
    dueCount: num(s.due_count),
    pendingCount: num(s.pending_count),
  };
}

function filterParams(f: OtcFilters): Record<string, unknown> {
  return {
    status: f.status,
    from_date: f.fromDate || undefined,
    to_date: f.toDate || undefined,
    search: f.search || undefined,
  };
}

/** GET /v1/accounting/otc-report — paginated rows + summary for the same filters. */
export function useOtcReport(filters: OtcFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['admin', 'reports', 'otc', { ...filters, page, pageSize }],
    queryFn: async () => {
      const res = await http.getPage<Row>(
        '/v1/accounting/otc-report',
        { ...filterParams(filters), page, per_page: pageSize },
        { listKey: 'items' },
      );
      return { items: res.items.map(mapRow), meta: res.meta, summary: mapSummary(res.raw.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

/** User-triggered CSV export of every OTC row matching the filters. */
export function useExportOtcReport() {
  return useMutation({
    mutationFn: async (filters: OtcFilters) => {
      const rows = (
        await fetchAllPages<Row>('/v1/accounting/otc-report', filterParams(filters), {
          listKey: 'items',
        })
      ).map(mapRow);
      downloadCsv(
        `otc_report_${todayYmd()}.csv`,
        [
          'ID',
          'Customer',
          'Customer ID',
          'Connection type',
          'Client type',
          'Fiber code',
          'OTC (BDT)',
          'OTC status',
          'Billing status',
          'Created',
        ],
        rows.map((r) => [
          r.id,
          r.userName,
          r.userId,
          r.connectionType,
          r.clientType,
          r.fiberCode,
          r.otc,
          r.otcStatus,
          r.billingStatus,
          r.createdAt,
        ]),
      );
      return rows.length;
    },
  });
}
