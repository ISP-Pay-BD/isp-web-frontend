'use client';

import { useCallback, useState } from 'react';
import type { DataTableProps } from '@/features/shared/data-table';

export type ServerTable = NonNullable<DataTableProps<Record<string, unknown>>['server']>;

/**
 * page / pageSize / search state for one server-paginated list. Changing the
 * search or page size returns to page 1. `server(total)` feeds DataTable's
 * `server` prop; custom tables use `page`/`setPage` with OpsPager.
 */
export function useServerTable(initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearchState] = useState('');

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const server = (total: number): ServerTable => ({
    page,
    pageSize,
    total,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    search,
    onSearchChange: setSearch,
  });

  return { page, pageSize, search, setPage, setSearch, setPageSize, server };
}
