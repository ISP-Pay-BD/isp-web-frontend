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
  AlignCenter,
  AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, STORAGE_KEYS } from '@/lib/constants/status';
import { useThemeCustomizerStore } from '@/stores/theme-store';
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
  /** Enable table container centering vs edge-to-edge full width switcher */
  enableLayoutToggle?: boolean;
  defaultLayoutMode?: 'full' | 'centered';
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
  enableLayoutToggle = true,
  defaultLayoutMode = 'full',
}: DataTableProps<TData>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const setGlobalTableLayout = useThemeCustomizerStore((s) => s.setTableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.tableLayout);
      if (saved === 'centered' || saved === 'full') return saved;
    }
    return globalTableLayout || defaultLayoutMode || 'full';
  });

  // Sync when global theme setting changes
  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const handleLayoutModeToggle = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    setGlobalTableLayout(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.tableLayout, mode);
    }
  };
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
    <div
      className={cn(
        'space-y-4 transition-all duration-200',
        layoutMode === 'centered' ? 'max-w-6xl mx-auto' : 'w-full',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {searchKey ? (
            <div className="relative">
              <Input
                id={`${id}-search`}
                ref={inputRef}
                className={cn(
                  'peer min-w-64 h-9 text-xs ps-9 bg-background/70 border-border/70 rounded-lg shadow-2xs',
                  Boolean(table.getColumn(searchKey)?.getFilterValue()) && 'pe-9',
                )}
                value={(table.getColumn(searchKey)?.getFilterValue() ?? '') as string}
                onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                placeholder={searchPlaceholder}
                type="text"
                aria-label={searchPlaceholder}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <ListFilter size={15} strokeWidth={2} aria-hidden />
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
                  <CircleX size={15} strokeWidth={2} aria-hidden />
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
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5 text-xs h-9 border-border/80')}
              >
                <Columns3 className="h-3.5 w-3.5 opacity-70" aria-hidden />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-xs"
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

          {enableLayoutToggle && (
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40 shadow-2xs">
              <button
                type="button"
                onClick={() => handleLayoutModeToggle('full')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'full'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Full width fluid data layout"
              >
                <AlignJustify size={13} />
                <span className="hidden sm:inline">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleLayoutModeToggle('centered')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'centered'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Centered structured container layout"
              >
                <AlignCenter size={13} />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {enableRowSelection && onDeleteSelected && selectedCount > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger
                type="button"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 text-xs h-9 border-border/80')}
              >
                <Trash className="-ms-1 opacity-60 text-destructive" size={15} strokeWidth={2} aria-hidden />
                Delete
                <span className="-me-1 ms-1.5 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1.5 font-mono text-[0.65rem] font-bold text-muted-foreground">
                  {selectedCount}
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent size="default" className="sm:max-w-md">
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-destructive/10 text-destructive"
                    aria-hidden
                  >
                    <CircleAlert size={16} strokeWidth={2} />
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

      {/* Table Container Card */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs ring-1 ring-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border/80 bg-muted/40 hover:bg-muted/40">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
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
                                size={14}
                                strokeWidth={2}
                                aria-hidden
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={14}
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
            <TableBody className="divide-y divide-border/60">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="transition-colors duration-150 ease-out hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-3.5 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-32 text-center">
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <p className="font-semibold text-sm text-foreground">{emptyTitle}</p>
                      {emptyDescription ? (
                        <p className="text-xs text-muted-foreground">{emptyDescription}</p>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Integrated Bottom Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 border-t border-border/70 bg-muted/20 text-xs">
          <div className="flex items-center gap-2.5">
            <Label htmlFor={`${id}-page-size`} className="text-xs text-muted-foreground whitespace-nowrap">
              Rows per page:
            </Label>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                if (value) table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id={`${id}-page-size`} className="w-[72px] h-8 text-xs font-mono font-semibold bg-background border-border/70 shadow-2xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent align="start">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)} className="text-xs font-mono">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Showing <span className="font-bold text-foreground">{table.getRowCount() === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
            <span className="font-bold text-foreground">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getRowCount())}</span> of{' '}
            <span className="font-bold text-foreground">{table.getRowCount()}</span> entries
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="First page"
                >
                  <ChevronFirst className="h-3.5 w-3.5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 font-mono text-xs font-semibold text-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Last page"
                >
                  <ChevronLast className="h-3.5 w-3.5" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
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
