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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
