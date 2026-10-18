'use client';

import { useCallback, useRef, useState } from 'react';
import { http, saveBlob } from '@/lib/api/client';

/**
 * Page / page-size / search state for a DataTable in `server` mode.
 * `onSearchChange` is stable (the table debounces and calls it) and resets to page 1.
 */
export function useServerTable(initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearch] = useState('');

  const searchRef = useRef('');

  const onSearchChange = useCallback((value: string) => {
    if (searchRef.current === value) return;
    searchRef.current = value;
    setSearch(value);
    setPage(1);
  }, []);
  const onPageSizeChange = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return { page, pageSize, search, setPage, onPageSizeChange, onSearchChange, resetPage: () => setPage(1) };
}

/** Client-side CSV download of rows already loaded from the API. */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n');
  saveBlob(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }), filename);
}

/** YYYY-MM-DD for today in local time. */
export function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * For user-triggered CSV exports only: pages through a list endpoint
 * (100 rows per request, the backend max) until `total` or `maxRows`.
 */
export async function fetchAllPages<T>(
  url: string,
  params: Record<string, unknown> = {},
  options: { listKey?: string; maxRows?: number } = {},
): Promise<T[]> {
  const maxRows = options.maxRows ?? 5000;
  const out: T[] = [];
  for (let page = 1; out.length < maxRows; page++) {
    const res = await http.getPage<T>(url, { ...params, page, per_page: 100 }, { listKey: options.listKey });
    out.push(...res.items);
    if (res.items.length === 0 || page >= res.meta.totalPages) break;
  }
  return out.slice(0, maxRows);
}
