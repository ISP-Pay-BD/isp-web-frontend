export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  statusCode: number;
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | string>;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface PageMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/** Result of `http.getPage` — the list plus the backend pagination meta. */
export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
  /** The object the list was nested in (summary blocks, filters, etc.) */
  raw: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
