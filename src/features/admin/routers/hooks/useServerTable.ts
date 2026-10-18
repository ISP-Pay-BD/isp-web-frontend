import { useCallback, useMemo, useRef, useState } from 'react';
import type { DataTableProps } from '@/features/shared/data-table';

type ServerTableState = NonNullable<DataTableProps<object>['server']>;

/**
 * Page / page-size / search state for a DataTable in `server` mode. The
 * callbacks are stable: the table re-runs its debounced search effect when
 * `onSearchChange` changes identity, which would otherwise snap back to page 1.
 */
export function useServerTable(initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const searchRef = useRef('');

  const onSearchChange = useCallback((value: string) => {
    if (searchRef.current === value) return;
    searchRef.current = value;
    setSearch(value);
    setPage(1);
  }, []);
  const onPageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);
  const resetPage = useCallback(() => setPage(1), []);

  /** `server` prop for DataTable once the total is known. */
  const server = useCallback(
    (total: number): ServerTableState => ({ page, pageSize, total, onPageChange: setPage, onPageSizeChange, search, onSearchChange }),
    [page, pageSize, search, onPageSizeChange, onSearchChange],
  );

  return useMemo(() => ({ page, pageSize, search, resetPage, server }), [page, pageSize, search, resetPage, server]);
}
