'use client';

import { useId, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/lib/constants/status';

export interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[] | number[];
  className?: string;
  showItemCount?: boolean;
}

export function TablePagination({
  currentPage,
  pageSize = DEFAULT_PAGE_SIZE,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
  showItemCount = true,
}: TablePaginationProps) {
  const id = useId();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate visible page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 'ellipsis', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', safePage - 1, safePage, safePage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  }, [totalPages, safePage]);

  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 p-4 border-t border-border/60 bg-card/60 backdrop-blur-sm sm:gap-6',
        className
      )}
    >
      {/* Left: Page Size Selector */}
      <div className="flex items-center gap-2.5">
        <Label htmlFor={`${id}-page-size`} className="text-xs text-muted-foreground whitespace-nowrap">
          Rows per page:
        </Label>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            if (value) {
              onPageSizeChange(Number(value));
              onPageChange(1); // Reset to page 1 on page size change
            }
          }}
        >
          <SelectTrigger
            id={`${id}-page-size`}
            className="w-[72px] h-8 text-xs font-mono font-semibold bg-background border-border/70 shadow-sm"
          >
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent align="start">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)} className="text-xs font-mono">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Middle: Item Count Info */}
      {showItemCount && (
        <div className="text-xs text-muted-foreground font-mono">
          Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
          <span className="font-bold text-foreground">{endItem}</span> of{' '}
          <span className="font-bold text-foreground">{totalItems}</span> entries
        </div>
      )}

      {/* Right: Pagination Navigation Controls */}
      <div className="flex items-center gap-1">
        <Pagination>
          <PaginationContent className="gap-1">
            {/* First Page Button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                onClick={() => onPageChange(1)}
                disabled={safePage <= 1}
                aria-label="First page"
                title="First page"
              >
                <ChevronFirst className="h-3.5 w-3.5" />
              </Button>
            </PaginationItem>

            {/* Previous Button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                onClick={() => onPageChange(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </PaginationItem>

            {/* Page number buttons */}
            {pageNumbers.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <span className="flex h-8 w-6 items-center justify-center text-xs text-muted-foreground select-none">
                      ...
                    </span>
                  </PaginationItem>
                );
              }

              const isCurrent = p === safePage;
              return (
                <PaginationItem key={p}>
                  <Button
                    size="icon"
                    variant={isCurrent ? 'default' : 'outline'}
                    className={cn(
                      'h-8 w-8 text-xs font-mono font-semibold transition-all duration-150',
                      isCurrent
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'border-border/70 hover:bg-muted/80 text-foreground'
                    )}
                    onClick={() => onPageChange(p)}
                    aria-label={`Page ${p}`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {p}
                  </Button>
                </PaginationItem>
              );
            })}

            {/* Next Button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                onClick={() => onPageChange(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </PaginationItem>

            {/* Last Page Button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-xs border-border/70 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                onClick={() => onPageChange(totalPages)}
                disabled={safePage >= totalPages}
                aria-label="Last page"
                title="Last page"
              >
                <ChevronLast className="h-3.5 w-3.5" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

/**
 * Custom hook for standard client-side table pagination
 */
export function useTablePagination<T>(items: T[], initialPageSize: number = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Auto-clamp current page if items change or shrink
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, safePage, pageSize]);

  return {
    currentPage: safePage,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    setCurrentPage,
    setPageSize,
  };
}
