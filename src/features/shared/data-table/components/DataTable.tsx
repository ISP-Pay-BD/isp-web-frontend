'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
  type LegacyRow,
  type LegacyTable,
} from '@tanstack/react-table/legacy';
import {
  flexRender,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleX,
  Columns3,
  Filter,
  ListFilter,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/lib/constants/status';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';

type VisibilityState = Record<string, boolean>;
type SearchFilterFn<TData extends RowData> = (
  row: LegacyRow<TData>,
  columnId: string,
  filterValue: unknown,
) => boolean;

export type DataTableFacetFilter = {
  columnId: string;
  title: string;
  /** Prefixed options; falls back to faceted unique values when omitted */
  options?: string[];
};

export interface DataTableProps<TData extends RowData> {
  columns: LegacyColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  /** Column id used for the toolbar search input */
  searchKey?: string;
  searchPlaceholder?: string;
  /** Optional multi-column / custom search filter on `searchKey` */
  searchFilterFn?: SearchFilterFn<TData>;
  facetFilters?: DataTableFacetFilter[];
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  onDeleteSelected?: (rows: TData[]) => void;
  toolbarActions?: ReactNode;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  getRowId?: (originalRow: TData, index: number) => string;
  initialSorting?: SortingState;
}

function multiValueFilterFn<TData extends RowData>(
  row: LegacyRow<TData>,
  columnId: string,
  filterValue: string[],
) {
  if (!filterValue?.length) return true;
  const value = String(row.getValue(columnId) ?? '');
  return filterValue.includes(value);
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No results.',
  emptyDescription,
  className,
  searchKey,
  searchPlaceholder = 'Filter...',
  searchFilterFn,
  facetFilters = [],
  enableColumnVisibility = true,
  enableRowSelection = false,
  onDeleteSelected,
  toolbarActions,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  getRowId,
  initialSorting = [],
}: DataTableProps<TData>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const tableColumns = useMemo(() => {
    const next = columns.map((col) => {
      const columnId =
        col.id ??
        ('accessorKey' in col && typeof col.accessorKey === 'string'
          ? col.accessorKey
          : undefined);

      if (searchKey && columnId === searchKey && searchFilterFn) {
        return { ...col, filterFn: searchFilterFn };
      }

      if (facetFilters.some((f) => f.columnId === columnId) && !col.filterFn) {
        return { ...col, filterFn: multiValueFilterFn };
      }

      return col;
    });

    if (!enableRowSelection) return next;

    const selectCol: LegacyColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }: { table: LegacyTable<TData> }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: LegacyRow<TData> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    };

    return [selectCol, ...next];
  }, [columns, enableRowSelection, facetFilters, searchFilterFn, searchKey]);

  const table = useLegacyTable({
    data,
    columns: tableColumns,
    getRowId,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Reset page index when filters or data change
  const prevFiltersRef = useRef({ columnFilters, data });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.columnFilters !== columnFilters || prev.data !== data) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      prevFiltersRef.current = { columnFilters, data };
    }
  }, [columnFilters, data]);

  const selectedCount = table.getSelectedRowModel().rows.length;

  const handleDeleteSelected = () => {
    if (!onDeleteSelected) return;
    onDeleteSelected(table.getSelectedRowModel().rows.map((r) => r.original));
    table.resetRowSelection();
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {searchKey ? (
            <div className="relative">
              <Input
                id={`${id}-search`}
                ref={inputRef}
                className={cn(
                  'peer min-w-60 ps-9',
                  Boolean(table.getColumn(searchKey)?.getFilterValue()) && 'pe-9',
                )}
                value={(table.getColumn(searchKey)?.getFilterValue() ?? '') as string}
                onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                placeholder={searchPlaceholder}
                type="text"
                aria-label={searchPlaceholder}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <ListFilter size={16} strokeWidth={2} aria-hidden />
              </div>
              {Boolean(table.getColumn(searchKey)?.getFilterValue()) && (
                <button
                  type="button"
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn(searchKey)?.setFilterValue('');
                    inputRef.current?.focus();
                  }}
                >
                  <CircleX size={16} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          ) : null}

          {facetFilters.map((facet) => (
            <FacetFilter
              key={facet.columnId}
              id={id}
              table={table}
              columnId={facet.columnId}
              title={facet.title}
              options={facet.options}
            />
          ))}

          {enableColumnVisibility ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
              >
                <Columns3 className="-ms-1 opacity-60" size={16} strokeWidth={2} aria-hidden />
                View
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {enableRowSelection && onDeleteSelected && selectedCount > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger
                type="button"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
              >
                <Trash className="-ms-1 opacity-60" size={16} strokeWidth={2} aria-hidden />
                Delete
                <span className="-me-1 ms-2 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  {selectedCount}
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent size="default" className="sm:max-w-md">
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                    aria-hidden
                  >
                    <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete {selectedCount}{' '}
                      selected {selectedCount === 1 ? 'row' : 'rows'}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {toolbarActions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="h-11"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          'flex h-full cursor-pointer select-none items-center justify-between gap-2',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: (
                            <ChevronUp
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden
                            />
                          ),
                          desc: (
                            <ChevronDown
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="transition-colors duration-200 ease-out"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{emptyTitle}</p>
                    {emptyDescription ? (
                      <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-8">
        <div className="flex items-center gap-3">
          <Label htmlFor={`${id}-page-size`} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              if (value) table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={`${id}-page-size`} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p aria-live="polite">
            <span className="text-foreground">
              {table.getRowCount() === 0
                ? 0
                : table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                  1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getRowCount(),
              )}
            </span>{' '}
            of <span className="text-foreground">{table.getRowCount()}</span>
          </p>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to first page"
              >
                <ChevronFirst size={16} strokeWidth={2} aria-hidden />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
              >
                <ChevronRight size={16} strokeWidth={2} aria-hidden />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to last page"
              >
                <ChevronLast size={16} strokeWidth={2} aria-hidden />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

function FacetFilter<TData extends RowData>({
  id,
  table,
  columnId,
  title,
  options,
}: {
  id: string;
  table: LegacyTable<TData>;
  columnId: string;
  title: string;
  options?: string[];
}) {
  const column = table.getColumn(columnId);
  const selected = (column?.getFilterValue() as string[] | undefined) ?? [];

  const uniqueValues = useMemo(() => {
    if (options?.length) return [...options].sort();
    if (!column) return [];
    return Array.from(column.getFacetedUniqueValues().keys())
      .map(String)
      .sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const counts = column?.getFacetedUniqueValues() ?? new Map();

  const handleChange = (checked: boolean, value: string) => {
    const next = selected.slice();
    if (checked) next.push(value);
    else {
      const index = next.indexOf(value);
      if (index > -1) next.splice(index, 1);
    }
    column?.setFilterValue(next.length ? next : undefined);
  };

  if (!column || uniqueValues.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
      >
        <Filter className="-ms-1 opacity-60" size={16} strokeWidth={2} aria-hidden />
        {title}
        {selected.length > 0 ? (
          <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
            {selected.length}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="min-w-40 p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">Filters</div>
          <div className="space-y-3">
            {uniqueValues.map((value, i) => (
              <div key={value} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${columnId}-${i}`}
                  checked={selected.includes(value)}
                  onCheckedChange={(checked) => handleChange(checked === true, value)}
                />
                <Label
                  htmlFor={`${id}-${columnId}-${i}`}
                  className="flex grow justify-between gap-2 font-normal"
                >
                  {value}
                  <span className="ms-2 text-xs text-muted-foreground">
                    {counts.get(value) ?? counts.get(value as never) ?? ''}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
